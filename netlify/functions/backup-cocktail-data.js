const { google } = require('googleapis');
const { Buffer } = require('buffer');

const FILE_NAME = 'cocktail_data_backup.json';
const BACKUP_PREFIX = 'cocktail_data_backup_';
const BACKUP_FOLDER_NAME = 'OBL-handbook-backups'; // Folder that holds backups

exports.handler = async function(event) {
  try {
    // Require level 4/5 header token — optional phase 2
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: 'Method Not Allowed',
      };
    }

    // Load and parse service account credentials
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDS);
    const scopes = ['https://www.googleapis.com/auth/drive'];
    const auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      scopes
    );
    const drive = google.drive({ version: 'v3', auth });

    // Step 1: Find main JSON file
    const { data: list } = await drive.files.list({
      q: `name = '${FILE_NAME}' and trashed = false`,
      fields: 'files(id, name, parents)',
    });

    if (list.files.length === 0) {
      return {
        statusCode: 404,
        body: 'Backup source file not found',
      };
    }

    const sourceFile = list.files[0];

    // Step 2: Download file content
    const contentRes = await drive.files.get(
      { fileId: sourceFile.id, alt: 'media' },
      { responseType: 'stream' }
    );

    let content = '';
    await new Promise((resolve, reject) => {
      contentRes.data
        .on('data', chunk => content += chunk)
        .on('end', resolve)
        .on('error', reject);
    });

    // Step 3: Get/create backup folder
    const folderRes = await drive.files.list({
      q: `name = '${BACKUP_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id)',
    });

    let backupFolderId;
    if (folderRes.files.length === 0) {
      const folder = await drive.files.create({
        resource: {
          name: BACKUP_FOLDER_NAME,
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id',
      });
      backupFolderId = folder.data.id;
    } else {
      backupFolderId = folderRes.files[0].id;
    }

    // Step 4: Create timestamped backup file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `${BACKUP_PREFIX}${timestamp}.json`;

    await drive.files.create({
      resource: {
        name: backupFileName,
        parents: [backupFolderId],
        mimeType: 'application/json',
      },
      media: {
        mimeType: 'application/json',
        body: content,
      },
    });

    // Step 5: Prune older backups (keep last 5)
    const backups = await drive.files.list({
      q: `'${backupFolderId}' in parents and name contains '${BACKUP_PREFIX}' and trashed = false`,
      fields: 'files(id, name, createdTime)',
    });

    const sorted = backups.data.files.sort(
      (a, b) => new Date(b.createdTime) - new Date(a.createdTime)
    );

    const excess = sorted.slice(5);
    for (const file of excess) {
      await drive.files.delete({ fileId: file.id });
    }

    return {
      statusCode: 200,
      body: `✅ Backup created: ${backupFileName}`,
    };

  } catch (err) {
    console.error('❌ Backup failed:', err);
    return {
      statusCode: 500,
      body: 'Internal Server Error: ' + err.message,
    };
  }
};