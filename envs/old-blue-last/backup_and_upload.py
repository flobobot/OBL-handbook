import os
import zipfile
import datetime
import sys
print("[DEBUG] Starting backup_and_upload.py", file=sys.stderr)
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

# --- CONFIGURATION ---
CREDENTIALS_PATH = "flobocorp-automation-cac461eb14c1.json"
FOLDER_ID = "1s-EdyekVcZ13brdCpr6gIWrAcuXQh3Xb"
ENV_FOLDER = "envs/old-blue-last"  # Adjust path if needed
VERSION = "v5.2"
# ---------------------

def zip_env_folder():
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d")
    zip_name = f"OBL-{VERSION}-{timestamp}.zip"
    zip_path = os.path.join("/tmp", zip_name)
    print("[DEBUG] Zipping folder...", file=sys.stderr)
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(ENV_FOLDER):
            for file in files:
                full_path = os.path.join(root, file)
                arcname = os.path.relpath(full_path, ENV_FOLDER)
                zipf.write(full_path, arcname)
    print(f"[✔] Zipped: {zip_path}")
    return zip_path, zip_name

def upload_to_drive(zip_path, zip_name):
    creds = service_account.Credentials.from_service_account_file(CREDENTIALS_PATH)
    print("[DEBUG] Uploading to Drive...", file=sys.stderr)
    service = build('drive', 'v3', credentials=creds)

    file_metadata = {
        'name': zip_name,
        'parents': [FOLDER_ID]
    }
    media = MediaFileUpload(zip_path, mimetype='application/zip')
    uploaded = service.files().create(body=file_metadata, media_body=media, fields='id').execute()
    print(f"[✔] Uploaded to Drive as: {zip_name} (File ID: {uploaded.get('id')})")

if __name__ == "__main__":
    path, name = zip_env_folder()
    upload_to_drive(path, name)