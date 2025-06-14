import os
import io
import zipfile
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

# CONFIG
SCOPES = ['https://www.googleapis.com/auth/drive']
SERVICE_ACCOUNT_FILE = 'envs/old-blue-last/flobocorp-automation-cac461eb14c1.json'  # adjust path if needed
FOLDER_ID = '1s-EdyekVcZ13brdCpr6gIWrAcuXQh3Xb'  # ID for FloboCorp-Infrastructure/Backups/OBL
RESTORE_DIR = 'envs/'

def get_latest_backup_file(drive_service):
    results = drive_service.files().list(
        q=f"'{FOLDER_ID}' in parents and name contains 'OBL-v' and mimeType='application/zip'",
        orderBy='createdTime desc',
        pageSize=1,
        fields="files(id, name)"
    ).execute()
    files = results.get('files', [])
    return files[0] if files else None

def download_and_extract(file_id, filename, drive_service):
    request = drive_service.files().get_media(fileId=file_id)
    fh = io.BytesIO()
    downloader = MediaIoBaseDownload(fh, request)
    done = False

    while not done:
        status, done = downloader.next_chunk()

    fh.seek(0)
    with zipfile.ZipFile(fh) as zip_ref:
        zip_ref.extractall(RESTORE_DIR)
    print(f"[✓] Restored from backup: {filename}")

def main():
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    drive_service = build('drive', 'v3', credentials=creds)

    print("[...] Searching for latest backup...")
    file = get_latest_backup_file(drive_service)

    if file:
        download_and_extract(file['id'], file['name'], drive_service)
    else:
        print("[!] No backup file found to restore.")

if __name__ == '__main__':
    main()
