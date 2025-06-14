import os
import sys
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

# CONFIG
SERVICE_ACCOUNT_FILE = 'envs/old-blue-last/flobocorp-automation-cac461eb14c1.json'
FOLDER_ID = '1s-EdyekVcZ13brdCpr6gIWrAcuXQh3Xb'  # OBL backup folder in Drive

def upload_zip_to_drive(zip_path):
    if not os.path.exists(zip_path):
        print(f"[!] File not found: {zip_path}")
        return

    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE,
        scopes=['https://www.googleapis.com/auth/drive']
    )

    service = build('drive', 'v3', credentials=creds)

    file_metadata = {
        'name': os.path.basename(zip_path),
        'parents': [FOLDER_ID]
    }
    media = MediaFileUpload(zip_path, mimetype='application/zip')
    file = service.files().create(
        body=file_metadata,
        media_body=media,
        fields='id'
    ).execute()

    print(f"[✔] Uploaded {zip_path} to Drive with file ID: {file.get('id')}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 push_backup_to_drive.py <path_to_zip>")
    else:
        upload_zip_to_drive(sys.argv[1])
