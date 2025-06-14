import os

# CONFIG
CORE_COMPONENT_PATH = os.path.join(os.path.dirname(__file__), "../core-components/navbar.html")
ENV_ROOT = os.path.join(os.path.dirname(__file__), "../envs/")
TARGET_FILENAME = "navbar.html"

def apply_patch_to_envs():
    if not os.path.exists(CORE_COMPONENT_PATH):
        print(f"[ERROR] Shared component not found: {CORE_COMPONENT_PATH}")
        return

    with open(CORE_COMPONENT_PATH, "r") as core_file:
        navbar_code = core_file.read()

    envs = [d for d in os.listdir(ENV_ROOT) if os.path.isdir(os.path.join(ENV_ROOT, d))]
    print(f"[DEBUG] Found environments: {envs}")

    for env in envs:
        env_path = os.path.join(ENV_ROOT, env)
        target_path = os.path.join(env_path, TARGET_FILENAME)

        with open(target_path, "w") as f:
            f.write(navbar_code)

        print(f"[✔] Patched navbar into: {target_path}")

if __name__ == "__main__":
    print("[...] Starting patch process")
    apply_patch_to_envs()
    print("[✓] Done")# Patch engine placeholder