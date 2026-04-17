#!/usr/bin/env python3
"""
Pequeño script de validación de reglas de Damage-Control.

Objetivo:
- Detectar fallas evidentes de cobertura (edge cases) en reglas de bash.
- Validar paths críticos contra zeroAccess/readOnly/noDelete.
- Medir cobertura de reglas del YAML (cuántas se disparan al menos una vez en la batería).
- Simular la política actual: cualquier violación requiere confirmación interactiva; sin UI, se bloquea.
"""

from __future__ import annotations

import argparse
import os
import re
from pathlib import Path
from typing import Any, Dict, List, Tuple

RULES_PATH_DEFAULT = Path.home() / ".pi" / "damage-control-rules.yaml"


def _strip_quotes(value: str) -> str:
    value = value.strip()
    if not value:
        return value
    if (value[0] == value[-1]) and value.startswith(("'", '"')):
        return value[1:-1]
    return value


def _parse_scalar(value: str) -> Any:
    value = value.strip()
    if value.lower() == "true":
        return True
    if value.lower() == "false":
        return False
    return _strip_quotes(value)


def load_rules(path: Path) -> Dict[str, Any]:
    """Parsea el YAML simple usado por damage-control."""
    text = path.read_text(encoding="utf-8").splitlines()
    data = {
        "bashToolPatterns": [],
        "zeroAccessPaths": [],
        "readOnlyPaths": [],
        "noDeletePaths": [],
    }

    section = None
    current_rule = None

    for raw in text:
        line = raw.rstrip("\n")
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue

        top = re.match(r"^(\w+):\s*$", stripped)
        if top:
            section = top.group(1)
            current_rule = None
            if section not in data:
                continue
            continue

        if section not in data:
            continue

        if section == "bashToolPatterns":
            item = re.match(r"^\s*-\s*([A-Za-z0-9_]+):\s*(.+)$", line)
            if item:
                key, value = item.group(1), item.group(2)
                current_rule = {key: _parse_scalar(value)}
                data[section].append(current_rule)
                continue

            cont = re.match(r"^\s+([A-Za-z0-9_]+):\s*(.+)$", line)
            if current_rule is not None and cont:
                key, value = cont.group(1), cont.group(2)
                current_rule[key] = _parse_scalar(value)
            continue

        item = re.match(r"^\s*-\s*(.+?)\s*$", line)
        if item:
            data[section].append(_parse_scalar(item.group(1)))

    return data


def expand_tilde(value: str) -> str:
    if value.startswith("~/"):
        return str(Path.home() / value[2:])
    if value == "~":
        return str(Path.home())
    return value


def resolve_path(p: str, cwd: str) -> str:
    p = expand_tilde(p)
    return str(Path(cwd).resolve() / p) if not Path(p).is_absolute() else str(Path(p).resolve())


def is_path_match(target_path: str, pattern: str, cwd: str) -> bool:
    pattern = expand_tilde(pattern)

    if pattern.endswith("/"):
        abs_pattern = str(Path(pattern).resolve()) if Path(pattern).is_absolute() else str(Path(cwd, pattern).resolve())
        normalized_pattern = abs_pattern.rstrip("/\\")
        normalized_target = target_path.rstrip("/\\")
        return normalized_target == normalized_pattern or normalized_target.startswith(normalized_pattern + os.sep)

    regex_pattern = re.escape(pattern).replace("\\*", ".*")
    regex = re.compile(rf"^{regex_pattern}$|^{regex_pattern}/|/{regex_pattern}$|/{regex_pattern}/")

    cwd_resolved = Path(cwd).resolve()
    target_resolved = Path(target_path).resolve()
    if target_path.startswith(cwd_resolved.as_posix() + os.sep) or target_path == str(cwd_resolved):
        relative_path = str(target_resolved.relative_to(cwd_resolved))
    else:
        relative_path = os.path.relpath(target_path, cwd)

    return bool(regex.match(target_path) or regex.match(relative_path) or (pattern in target_path) or (pattern in relative_path))


def is_likely_mutating_bash_command(command: str) -> bool:
    mutation_patterns = [
        r"\b(rm|rmdir|mv|cp|install|tee|touch|truncate|chmod|chown)\b",
        r"\bsed\s+-i\b",
        r"\bperl\s+-p[iI]\b",
        r"\bpython\d*\s+-c\b",
        r"\bnode\s+-e\b",
        r"\bruby\s+-e\b",
        r"(^|[^>])>(?!>)",
        r">>",
    ]
    return any(re.search(pattern, command) for pattern in mutation_patterns)


def compile_rule_regex(rule: Dict[str, Any]) -> re.Pattern[str]:
    flags = 0
    for ch in str(rule.get("flags", "")):
        if ch == "i":
            flags |= re.IGNORECASE
        elif ch == "m":
            flags |= re.MULTILINE
        elif ch == "s":
            flags |= re.DOTALL
    return re.compile(str(rule.get("pattern", "")), flags)


def match_bash_rules(command: str, rules: List[Dict[str, Any]], compile_errors: List[Tuple[int, str]]) -> List[Dict[str, Any]]:
    """Replica la extensión real: se usa la PRIMERA regla que matchea."""
    for idx, rule in enumerate(rules):
        try:
            regex = compile_rule_regex(rule)
            if regex.search(command):
                return [{"idx": idx, "rule": rule}]
        except re.error as exc:
            compile_errors.append((idx, f"{exc}"))
    return []


def evaluate_case(case: Dict[str, Any], rules: Dict[str, Any], cwd: str) -> Dict[str, Any]:
    tool = case["tool"]
    violation_hits: List[Tuple[str, Dict[str, Any]]] = []
    compile_errors: List[Tuple[int, str]] = []

    if tool == "bash":
        command = case["command"]

        for hit in match_bash_rules(command, rules["bashToolPatterns"], compile_errors):
            r = hit["rule"]
            violation_hits.append((f"pattern:{r.get('reason')}", r))

        for zap in rules["zeroAccessPaths"]:
            if zap in command:
                violation_hits.append((f"zeroAccess:{zap}", {"reason": f"zeroAccess:{zap}", "ask": False}))

        if is_likely_mutating_bash_command(command):
            for rop in rules["readOnlyPaths"]:
                if rop in command:
                    violation_hits.append((f"readOnly:{rop}", {"reason": f"readOnly:{rop}", "ask": True}))

        for ndp in rules["noDeletePaths"]:
            if ndp in command and re.search(r"\b(rm|rmdir|mv)\b", command):
                violation_hits.append((f"noDelete:{ndp}", {"reason": f"noDelete:{ndp}", "ask": False}))

        status = "ask" if violation_hits else "allow"

        return {
            "case_id": case["id"],
            "status": status,
            "hits": violation_hits,
            "tool": "bash",
            "compile_errors": compile_errors,
        }

    path_value = case["path"]
    resolved = resolve_path(path_value, cwd)

    zero_match = any(is_path_match(resolved, p, cwd) for p in rules["zeroAccessPaths"])
    if zero_match:
        return {
            "case_id": case["id"],
            "status": "ask",
            "hits": [("path-zeroAccess", {"reason": "path zeroAccess", "ask": False})],
            "tool": tool,
            "compile_errors": [],
        }

    if tool in {"write", "edit"}:
        read_only_match = any(is_path_match(resolved, p, cwd) for p in rules["readOnlyPaths"])
        if read_only_match:
            return {
                "case_id": case["id"],
                "status": "ask",
                "hits": [("path-readOnly", {"reason": "path readOnly", "ask": True})],
                "tool": tool,
                "compile_errors": [],
            }

    return {
        "case_id": case["id"],
        "status": "allow",
        "hits": [],
        "tool": tool,
        "compile_errors": [],
    }


def build_cases() -> List[Dict[str, Any]]:
    return [
        # Bash: destructive local commands
        {"id": "B01_rm_rf", "tool": "bash", "command": "rm -rf dist", "expect": "ask", "why": "rm debe bloquearse siempre"},
        {"id": "B02_rm_file", "tool": "bash", "command": "rm foo.txt", "expect": "ask", "why": "rm simple también bloqueado"},
        {"id": "B03_rmdir", "tool": "bash", "command": "rmdir tmp", "expect": "ask", "why": "rmdir bloqueado globalmente"},
        {"id": "B04_sudo_rm", "tool": "bash", "command": "sudo rm -rf /tmp/test", "expect": "ask", "why": "sudo rm sigue bloqueado"},
        {"id": "B05_git_reset_hard", "tool": "bash", "command": "git reset --hard HEAD~1", "expect": "ask", "why": "git reset --hard requiere confirmación"},
        {"id": "B06_git_clean", "tool": "bash", "command": "git clean -fdx", "expect": "allow", "why": "git clean ya no está en la lista de confirmación"},
        {"id": "B07_git_push_force", "tool": "bash", "command": "git push -f origin main", "expect": "ask", "why": "push forzado requiere confirmación"},
        {"id": "B08_chmod_777", "tool": "bash", "command": "chmod 777 .", "expect": "ask", "why": "chmod 777 requiere confirmación"},
        {"id": "B09_chmod_recursive", "tool": "bash", "command": "chmod -R 777 .", "expect": "ask", "why": "chmod 777 recursivo se bloquea"},
        {"id": "B10_gcloud_policies", "tool": "bash", "command": "gcloud iam policies delete-policy", "expect": "ask", "why": "IAM policies requiere confirmación"},
        {"id": "B11_gcloud_delete", "tool": "bash", "command": "gcloud compute instances delete node-1 --zone=us-east1", "expect": "ask", "why": "delete de instancia sigue bloqueado"},
        {"id": "B12_aws_delete", "tool": "bash", "command": "aws s3 rb s3://bucket-old --force", "expect": "ask", "why": "AWS bucket force delete bloqueado"},
        {"id": "B13_firebase_all_collections", "tool": "bash", "command": "firebase firestore:delete users --all-collections", "expect": "ask", "why": "Firebase borrado total bloqueado"},
        {"id": "B14_vercel_remove", "tool": "bash", "command": "vercel remove --yes app", "expect": "ask", "why": "Vercel removal ahora requiere confirmación"},
        {"id": "B15_truncate", "tool": "bash", "command": "TRUNCATE TABLE sessions;", "expect": "ask", "why": "SQL masivo sigue bloqueado"},
        {"id": "B16_drop_db", "tool": "bash", "command": "DROP DATABASE app_db;", "expect": "ask", "why": "destrucción DB bloqueada"},
        {"id": "B17_sql_delete_where", "tool": "bash", "command": "delete from users where id = 1;", "expect": "ask", "why": "DELETE con WHERE requiere confirmación"},
        {"id": "B18_sql_delete_all", "tool": "bash", "command": "DELETE FROM users;", "expect": "ask", "why": "delete total bloqueado"},
        {"id": "B19_sql_update", "tool": "bash", "command": "update users set active = false where id = 1;", "expect": "ask", "why": "UPDATE requiere confirmación"},
        {"id": "B20_sql_insert", "tool": "bash", "command": "insert into users(id, name) values (1, 'Pablo');", "expect": "ask", "why": "INSERT requiere confirmación"},
        {"id": "B21_sql_alter", "tool": "bash", "command": "alter table users add column bio text;", "expect": "ask", "why": "ALTER TABLE requiere confirmación"},
        {"id": "B22_git_checkout_uncommitted", "tool": "bash", "command": "git checkout -- .", "expect": "allow", "why": "git checkout no requiere confirmación según política actual"},
        {"id": "B23_git_restore", "tool": "bash", "command": "git restore .", "expect": "allow", "why": "git restore no requiere confirmación según política actual"},
        {"id": "B24_git_stash_drop", "tool": "bash", "command": "git stash drop stash@{0}", "expect": "allow", "why": "git stash no requiere confirmación según política actual"},
        {"id": "B25_git_branch_delete", "tool": "bash", "command": "git branch -D feature/foo", "expect": "allow", "why": "git branch no requiere confirmación según política actual"},
        {"id": "B26_git_push_delete", "tool": "bash", "command": "git push origin --delete feature/foo", "expect": "ask", "why": "borra branch remota"},
        {"id": "B27_force_with_lease", "tool": "bash", "command": "git push --force-with-lease origin main", "expect": "ask", "why": "git CLI siempre requiere confirmación"},
        {"id": "B28_chain_with_danger", "tool": "bash", "command": "git push --force-with-lease origin main; rm -rf dist", "expect": "ask", "why": "comando peligroso en cadena debe detectar"},
        {"id": "B29_supabase_reset", "tool": "bash", "command": "supabase db reset", "expect": "ask", "why": "reset de Supabase requiere confirmación"},
        {"id": "B30_supabase_push", "tool": "bash", "command": "supabase db push", "expect": "ask", "why": "push de esquema requiere confirmación"},
        {"id": "B31_supabase_repair", "tool": "bash", "command": "supabase migration repair --status reverted 20240301010101", "expect": "ask", "why": "repair de migraciones requiere confirmación"},
        {"id": "B32_readonly_bash_read", "tool": "bash", "command": "rg package-lock.json .", "expect": "allow", "why": "leer lockfiles no debe bloquear"},
        {"id": "B33_readonly_bash_write", "tool": "bash", "command": "echo '{}' > package.json", "expect": "ask", "why": "escribir package.json requiere confirmación"},
        {"id": "B34_readonly_bash_cp", "tool": "bash", "command": "cp package.json package.json.bak", "expect": "ask", "why": "copiar path protegido cuenta como mutación"},
        {"id": "B35_gh_direct", "tool": "bash", "command": "gh pr list", "expect": "ask", "why": "GitHub CLI requiere confirmación explícita"},
        {"id": "B36_gh_nested_shell", "tool": "bash", "command": "bash -lc 'gh repo view'", "expect": "ask", "why": "uso colateral de gh también debe pedir confirmación"},
        {"id": "B37_supabase_direct", "tool": "bash", "command": "supabase status", "expect": "ask", "why": "Supabase CLI requiere confirmación explícita"},
        {"id": "B38_supabase_nested_shell", "tool": "bash", "command": "bash -lc 'supabase projects list'", "expect": "ask", "why": "uso colateral de supabase también debe pedir confirmación"},
        {"id": "B39_git_direct", "tool": "bash", "command": "git log --oneline -n 5", "expect": "allow", "why": "git log debe permitirse sin confirmación"},
        {"id": "B40_git_nested_shell", "tool": "bash", "command": "bash -lc 'git rev-parse --abbrev-ref HEAD'", "expect": "allow", "why": "git rev-parse debe permitirse sin confirmación"},
        {"id": "B41_git_merge", "tool": "bash", "command": "git merge feature/foo", "expect": "ask", "why": "git merge requiere confirmación explícita"},
        {"id": "B42_git_rebase", "tool": "bash", "command": "git rebase main", "expect": "ask", "why": "git rebase requiere confirmación explícita"},
        {"id": "B43_git_commit", "tool": "bash", "command": "git commit -m 'test'", "expect": "ask", "why": "git commit requiere confirmación explícita"},

        # Paths: zeroAccess y confirmación interactiva
        {"id": "P01_read_dotenv", "tool": "read", "path": ".env", "expect": "ask", "why": "zeroAccess por path en read"},
        {"id": "P02_read_env_prod", "tool": "read", "path": ".env.production", "expect": "ask", "why": "env sensible"},
        {"id": "P03_read_kubeconfig", "tool": "read", "path": "kubeconfig", "expect": "ask", "why": "archivo sensible"},
        {"id": "P04_ls_dot_ssh", "tool": "ls", "path": "/home/pablo/.ssh/id_rsa", "expect": "ask", "why": "zeroAccess ssh"},
        {"id": "P05_read_package_json", "tool": "read", "path": "package.json", "expect": "allow", "why": "package.json debe poder leerse"},
        {"id": "P06_read_uv_lock", "tool": "read", "path": "uv.lock", "expect": "allow", "why": "uv.lock debe poder leerse"},
        {"id": "P07_write_dist", "tool": "write", "path": "dist/index.js", "expect": "ask", "why": "dist está protegido y debe pedir confirmación"},
        {"id": "P08_write_dotenv", "tool": "write", "path": "./.env", "expect": "ask", "why": ".env sigue en zeroAccess"},
        {"id": "P09_edit_lock", "tool": "edit", "path": "package-lock.json", "expect": "ask", "why": "lockfiles requieren confirmación al editar"},
        {"id": "P10_write_package_json", "tool": "write", "path": "package.json", "expect": "ask", "why": "package.json requiere confirmación al escribir"},
        {"id": "P11_read_git_dir", "tool": "read", "path": ".git/HEAD", "expect": "allow", "why": ".git no es zeroAccess para lectura en esta política"},
    ]


def run_tests(rules: Dict[str, Any], cases: List[Dict[str, Any]], cwd: str) -> int:
    pass_count = 0
    fail_count = 0
    compile_errors = []
    rule_coverage = {i: 0 for i in range(len(rules["bashToolPatterns"]))}

    for case in cases:
        out = evaluate_case(case, rules, cwd)
        compile_errors.extend(out["compile_errors"])

        if out["status"] in {"block", "ask"}:
            for hit_id, rule_payload in out["hits"]:
                if hit_id.startswith("pattern:"):
                    for i, rule in enumerate(rules["bashToolPatterns"]):
                        if rule == rule_payload:
                            rule_coverage[i] += 1
                            break

        expected = case["expect"]
        ok = out["status"] == expected

        if ok:
            pass_count += 1
            continue

        fail_count += 1
        print(f"[FAIL] {case['id']} ({case['tool']}) expected={expected} got={out['status']} -- {case['why']}")
        if out["hits"]:
            reasons = ", ".join(h[0] for h in out["hits"])
            print(f"       hits: {reasons}")
        if case["tool"] == "bash":
            print(f"       cmd : {case['command']}")
        elif "path" in case:
            print(f"       path: {case['path']}")

    if compile_errors:
        print("\n[WARN] Regex issues while compiling reglas:")
        for idx, err in compile_errors:
            print(f"  - idx={idx}: {err}")

    unmatched = [i for i, count in rule_coverage.items() if count == 0]
    if unmatched:
        print("\n[WARN] Reglas de bashToolPatterns sin ningún caso cubierto:")
        for i in unmatched:
            rule = rules["bashToolPatterns"][i]
            print(f"  - #{i:02d} pattern={rule.get('pattern')} reason={rule.get('reason')}")

    total_patterns = len(rules["bashToolPatterns"])
    touched = total_patterns - len(unmatched)
    print("\nResumen:")
    print(f"  Cases: {len(cases)}")
    print(f"  Pass:  {pass_count}")
    print(f"  Fail:  {fail_count}")
    print(f"  bashToolPatterns cubiertas: {touched}/{total_patterns}")

    return fail_count


def main() -> int:
    parser = argparse.ArgumentParser(description="Edge-case tester for damage-control rules")
    parser.add_argument("--rules", type=Path, default=RULES_PATH_DEFAULT, help="Ruta de damage-control-rules.yaml")
    parser.add_argument("--cwd", default=str(Path.cwd()), help="cwd de prueba para path matching")
    args = parser.parse_args()

    rules = load_rules(args.rules)
    cases = build_cases()

    print(
        f"[INFO] Cargadas reglas: bash={len(rules['bashToolPatterns'])}, zeroAccess={len(rules['zeroAccessPaths'])}, "
        f"readOnly={len(rules['readOnlyPaths'])}, noDelete={len(rules['noDeletePaths'])}"
    )
    print(f"[INFO] Ejecutando {len(cases)} casos sobre cwd={args.cwd}")

    fail_count = run_tests(rules, cases, args.cwd)
    return 1 if fail_count else 0


if __name__ == "__main__":
    raise SystemExit(main())
