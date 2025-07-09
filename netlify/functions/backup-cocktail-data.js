const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');

const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/drive']
});

exports.handler = async function (event, context) {
  try {
    const client = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: client });

    // Folder ID for frontend-backup
    const folderId = '1qiDPIYAibg5Ao9eCwddx70DbC7mhZOwR';

    // Get file list in backup folder
    const listResponse = await drive.files.list({
      q: `'${folderId}' in parents and name contains 'cocktail_data_backup' and trashed = false`,
      fields: 'files(id, name, createdTime)',
      orderBy: 'createdTime desc'
    });

    const files = listResponse.data.files;

    // Keep only 5 most recent
    if (files.length >= 5) {
      const filesToDelete = files.slice(5);
      for (const file of filesToDelete) {
        await drive.files.delete({ fileId: file.id });
      }
    }

    // Create timestamped filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `cocktail_data_backup_${timestamp}.json`;

    // Read current JSON
    const res = await fetch('https://obl-bartender-portal.netlify.app/data/cocktail_data_backup.json');
    const cocktailData = await res.json();

    const buffer = Buffer.from(JSON.stringify(cocktailData, null, 2), 'utf-8');

    // Upload new file
    const uploadRes = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: 'application/json',
        parents: [folderId]
      },
      media: {
        mimeType: 'application/json',
        body: buffer
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Backup created', fileId: uploadRes.data.id })
    };
  } catch (error) {
    console.error('Backup error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create backup', details: error.message })
    };
  }
};