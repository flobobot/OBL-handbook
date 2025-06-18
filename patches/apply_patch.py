import os
import sys
import json
from datetime import datetime

# CONFIG
CORE_COMPONENT_PATH = os.path.join(os.path.dirname(__file__), "../core-components/navbar.html")
ENV_ROOT = os.path.join(os.path.dirname(__file__), "../envs/")
TARGET_FILENAME = "navbar.html"
LOG_DIR = os.path.join(os.path.dirname(__file__), "../scripts/logs/")

def apply_patch_to_envs(target_venue=None):
    # Validate shared component
    if not os.path.exists(CORE_COMPONENT_PATH):
        print(f"[ERROR] Shared component not found: {CORE_COMPONENT_PATH}")
        return

    # Read the shared navbar code
    with open(CORE_COMPONENT_PATH, "r") as core_file:
        navbar_code = core_file.read()

    # Identify environments
    envs = [d for d in os.listdir(ENV_ROOT) if os.path.isdir(os.path.join(ENV_ROOT, d))]
    print(f"[DEBUG] Found environments: {envs}")

    if target_venue:
        if target_venue not in envs:
            print(f"[ERROR] Specified venue '{target_venue}' not found in envs/")
            return
        envs = [target_venue]

    for env in envs:
        env_path = os.path.join(ENV_ROOT, env)
        target_path = os.path.join(env_path, TARGET_FILENAME)

        try:
            with open(target_path, "w") as f:
                f.write(navbar_code)
            print(f"[✓] Patched navbar into: {target_path}")
            log_trace(env, success=True)
        except Exception as e:
            print(f"[ERROR] Failed to patch {env}: {e}")
            log_trace(env, success=False, error=str(e))

def log_trace(env, success=True, error=None):
    os.makedirs(LOG_DIR, exist_ok=True)
    trace = {
        "venue": env,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "success": success,
        "error": error,
    }
    trace_file = os.path.join(LOG_DIR, f"{env}.json")
    with open(trace_file, "w") as log_file:
        json.dump(trace, log_file, indent=2)

if __name__ == "__main__":
    venue_arg = sys.argv[1] if len(sys.argv) > 1 else None
    print(f"[•] Starting patch process {'for ' + venue_arg if venue_arg else '(all venues)'}...")
    apply_patch_to_envs(venue_arg)
    print("[✓] Done")