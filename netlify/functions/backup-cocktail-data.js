const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
const { Readable } = require('stream');

exports.handler = async function (event, context) {
  try {
    const base64Creds = process.env.GOOGLE_CREDENTIALS_BASE64;
    if (!base64Creds) throw new Error('Missing GOOGLE_CREDENTIALS_BASE64 env variable');

    const credentials = JSON.parse(Buffer.from(base64Creds, 'base64').toString('utf8'));

    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive']
    });

    const client = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: client });

    const folderId = '1qiDPIYAibg5Ao9eCwddx70DbC7mhZOwR';

    // Purge older backups (keep only 5)
    const listResponse = await drive.files.list({
      q: `'${folderId}' in parents and name contains 'cocktail_data_backup' and trashed = false`,
      fields: 'files(id, name, createdTime)',
      orderBy: 'createdTime desc'
    });

    const files = listResponse.data.files;
    if (files.length >= 5) {
      const toDelete = files.slice(5);
      for (const file of toDelete) {
        await drive.files.delete({ fileId: file.id });
      }
    }

    // Fetch current live JSON data
    const res = await fetch('https://obl-bartender-portal.netlify.app/data/cocktail_data_backup.json');
    const json = await res.json();
    const buffer = Buffer.from(JSON.stringify(json, null, 2), 'utf8');

    const stream = Readable.from(buffer);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `cocktail_data_backup_${timestamp}.json`;

    const upload = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: 'application/json',
        parents: [folderId]
      },
      media: {
        mimeType: 'application/json',
        body: stream
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Backup created successfully', fileId: upload.data.id })
    };
  } catch (error) {
    console.error('Backup error:', error.message, error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Backup failed', details: error.message })
    };
  }
};