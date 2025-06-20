const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

exports.handler = async function (event) {
  try {
    // 1. Load credentials
    const credentialsPath = path.resolve(__dirname, 'flobocorp-automation-3ac38a3f9c31.json');
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

    // 2. Authenticate using service account
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });

    const drive = google.drive({ version: 'v3', auth });

    // 3. Define the file ID to fetch from Google Drive
    const fileId = '1BxPcwCqjrARGjGctfLuZq72xK1_9YXyL';

    // 4. Download file content
    const res = await drive.files.get({
      fileId,
      alt: 'media'
    }, { responseType: 'stream' });

    let rawData = '';
    await new Promise((resolve, reject) => {
      res.data
        .on('data', chunk => rawData += chunk)
        .on('end', resolve)
        .on('error', reject);
    });

    const cocktailData = JSON.parse(rawData);

    return {
      statusCode: 200,
      body: JSON.stringify(cocktailData)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `Failed to load cocktail data: ${err.message}`
    };
  }
};