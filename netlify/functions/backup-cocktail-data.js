const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
const fs = require('fs');

const FILE_ID = '1wnbUDegCpxasLQgOY-fpa-0ZC9WhZrJp'; // live data file
const BACKUP_FOLDER_ID = '1qiDPIYAibg5Ao9eCwddx70DbC7mhZOwR'; // frontend-backups folder

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

    // Fetch current cocktail data file
    const originalFile = await drive.files.get({
      fileId: FILE_ID,
      alt: 'media',
    });

    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);
    const backupFilename = `backup-${timestamp}.json`;

    // Upload backup
    await drive.files.create({
      requestBody: {
        name: backupFilename,
        mimeType: 'application/json',
        parents: [BACKUP_FOLDER_ID],
      },
      media: {
        mimeType: 'application/json', // ✅ FORCE MIME HERE
        body: Buffer.from(JSON.stringify(originalFile.data)),
      },
    });

    // List all backups in folder
    const listResponse = await drive.files.list({
      q: `'${BACKUP_FOLDER_ID}' in parents and name contains 'backup-' and trashed = false`,
      fields: 'files(id, name, createdTime)',
      orderBy: 'createdTime desc',
    });

    const backups = listResponse.data.files;
    const toDelete = backups.slice(5); // keep 5 most recent

    for (const file of toDelete) {
      await drive.files.delete({ fileId: file.id });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Backup created successfully.' }),
    };
  } catch (error) {
    console.error('Backup error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};