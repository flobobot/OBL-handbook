const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
const fs = require('fs');
const os = require('os');
const path = require('path');

// ✅ Replace with correct file ID of cocktail_data_backup.json
const FILE_ID = '1ZZJqLaF3uFxFJSWgGLzRP6h0wABUnq-v'; // ← Replace this with the actual working file ID
const BACKUP_FOLDER_ID = '1qiDPIYAibg5Ao9eCwddx70DbC7mhZOwR';

exports.handler = async function (event, context) {
  try {
    const credentials = JSON.parse(
      Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf-8')
    );

    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // 1. Download live data file
    const originalFile = await drive.files.get({
      fileId: FILE_ID,
      alt: 'media',
    });

    // 2. Write backup locally
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);
    const tempFilePath = path.join(os.tmpdir(), `backup-${timestamp}.json`);
    fs.writeFileSync(tempFilePath, JSON.stringify(originalFile.data, null, 2));

    // 3. Upload to Drive
    const uploadResponse = await drive.files.create({
      requestBody: {
        name: `backup-${timestamp}.json`,
        mimeType: 'application/json',
        parents: [BACKUP_FOLDER_ID],
      },
      media: {
        mimeType: 'application/json',
        body: fs.createReadStream(tempFilePath),
      },
    });

    // 4. Purge older backups beyond 5
    const listResponse = await drive.files.list({
      q: `'${BACKUP_FOLDER_ID}' in parents and name contains 'backup-' and trashed = false`,
      fields: 'files(id, name, createdTime)',
      orderBy: 'createdTime desc',
    });

    const backups = listResponse.data.files;
    const toDelete = backups.slice(5);
    for (const file of toDelete) {
      await drive.files.delete({ fileId: file.id });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Backup created successfully.' }),
    };
  } catch (error) {
    console.error('Backup failed:', error.message, error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};