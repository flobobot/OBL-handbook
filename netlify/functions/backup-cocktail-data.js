const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');

const FILE_ID = '1BxPcwCqjrARGjGctfLuZq72xK1_9YXyL'; // Live data file
const BACKUP_FOLDER_ID = '1qiDPIYAibg5Ao9eCwddx70DbC7mhZOwR'; // Frontend backup folder

exports.handler = async function (event, context) {
  try {
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    const authClient = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: authClient });

    // 1. Get original file metadata
    const originalFile = await drive.files.get({
      fileId: FILE_ID,
      fields: 'name, mimeType',
    });

    // 2. Download original content
    const fileContent = await drive.files.get(
      { fileId: FILE_ID, alt: 'media' },
      { responseType: 'stream' }
    );

    // 3. Create backup filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `cocktail_data_backup_${timestamp}.json`;

    // 4. Upload as new backup file
    const backupRes = await drive.files.create({
      requestBody: {
        name: backupName,
        mimeType: originalFile.data.mimeType,
        parents: [BACKUP_FOLDER_ID],
      },
      media: {
        mimeType: originalFile.data.mimeType,
        body: fileContent.data,
      },
    });

    // 5. Enforce max of 5 backups: list, sort, delete oldest
    const list = await drive.files.list({
      q: `'${BACKUP_FOLDER_ID}' in parents and mimeType='application/json'`,
      fields: 'files(id, name, createdTime)',
    });

    const files = list.data.files.sort((a, b) =>
      new Date(b.createdTime) - new Date(a.createdTime)
    );

    if (files.length > 5) {
      const toDelete = files.slice(5);
      for (let file of toDelete) {
        await drive.files.delete({ fileId: file.id });
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Backup created and old backups purged.' }),
    };
  } catch (error) {
    console.error('Backup error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Backup failed.', error: error.message }),
    };
  }
};