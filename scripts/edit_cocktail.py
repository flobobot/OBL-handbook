import os
import json
from pathlib import Path

COCKTAILS_DIR = Path("envs/old-blue-last/cocktails")


def list_cocktails():
    print("\nAvailable cocktails:")
    for f in sorted(COCKTAILS_DIR.glob("*.html")):
        print("-", f.stem)


def get_input(prompt, default=""):
    val = input(f"{prompt} [{default}]: ").strip()
    return val or default


def load_metadata(name):
    json_path = COCKTAILS_DIR / f"{name}.json"
    if json_path.exists():
        with open(json_path, "r") as f:
            return json.load(f)
    return {}


def save_metadata(name, metadata):
    with open(COCKTAILS_DIR / f"{name}.json", "w") as f:
        json.dump(metadata, f, indent=2)


def save_html(name, metadata):
    html_path = COCKTAILS_DIR / f"{name}.html"
    with open(html_path, "w") as f:
        f.write(f"<h1>{metadata['name']}</h1>\n")
        f.write("<ul>\n")
        for ing in metadata['ingredients'].split(","):
            f.write(f"  <li>{ing.strip()}</li>\n")
        f.write("</ul>\n")
        f.write(f"<p><strong>Glassware:</strong> {metadata['glassware']}</p>\n")
        f.write(f"<p><strong>Method:</strong> {metadata['method']}</p>\n")
        f.write(f"<p><em>Pro tip:</em> {metadata['pro_tip']}</p>\n")
        f.write(f"<p><em>Did you know:</em> {metadata['did_you_know']}</p>\n")


def edit_cocktail():
    os.makedirs(COCKTAILS_DIR, exist_ok=True)
    list_cocktails()

    name = input("\nEnter the cocktail name to edit or create: ").strip().lower().replace(" ", "-")
    data = load_metadata(name)

    print("\n-- Editing metadata --")
    data['name'] = get_input("Cocktail name", data.get('name', name.replace("-", " ").title()))
    data['ingredients'] = get_input("Ingredients (comma-separated)", data.get('ingredients', ''))
    data['glassware'] = get_input("Glassware", data.get('glassware', ''))
    data['method'] = get_input("Method", data.get('method', ''))
    data['pro_tip'] = get_input("Pro tip", data.get('pro_tip', ''))
    data['did_you_know'] = get_input("Did you know", data.get('did_you_know', ''))

    save_metadata(name, data)
    save_html(name, data)

    print(f"\n✅ Saved: {name}.html and {name}.json in cocktails folder.")


if __name__ == "__main__":
    edit_cocktail()