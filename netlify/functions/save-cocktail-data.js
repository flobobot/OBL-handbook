const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
  const credentials = { username: 'florian', password: '280984' };

  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { username, password, cocktail } = JSON.parse(event.body);
    if (username !== credentials.username || password !== credentials.password) {
      return { statusCode: 403, body: 'Unauthorized' };
    }

    // Prepare filename
    const slug = cocktail.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const fileName = `${slug}.json`;

    // Load service account credentials
    const keyPath = path.resolve(__dirname, '../../auth/flobocorp-automation-cac461eb14c1.json');
    const auth = new google.auth.GoogleAuth({
      keyFile: keyPath,
      scopes: ['https://www.googleapis.com/auth/drive']
    });

    const drive = google.drive({ version: 'v3', auth });

    // STEP 1: Find the cocktails folder inside Google Drive
    const folderRes = await drive.files.list({
      q: "name = 'cocktails' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
      fields: 'files(id, name)'
    });

    const folder = folderRes.data.files[0];
    if (!folder) {
      return { statusCode: 404, body: 'Cocktails folder not found on Drive' };
    }

    const folderId = folder.id;

    // STEP 2: Check if file exists
    const existingRes = await drive.files.list({
      q: `name = '${fileName}' and '${folderId}' in parents and trashed = false`,
      fields: 'files(id, name)'
    });

    const fileMetadata = {
      name: fileName,
      parents: [folderId]
    };

    const media = {
      mimeType: 'application/json',
      body: Buffer.from(JSON.stringify(cocktail, null, 2), 'utf-8')
    };

    if (existingRes.data.files.length > 0) {
      const fileId = existingRes.data.files[0].id;
      await drive.files.update({
        fileId,
        media
      });
      console.log(`✏️ Updated existing cocktail: ${fileName}`);
    } else {
      await drive.files.create({
        resource: fileMetadata,
        media,
        fields: 'id'
      });
      console.log(`✅ Created new cocktail: ${fileName}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Cocktail saved to Google Drive', file: fileName })
    };

  } catch (err) {
    console.error('🔥 Drive save error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Unknown error' })
    };
  }
};