const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

exports.handler = async function(event) {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: 'Method Not Allowed',
      };
    }

    const credentialsPath = path.resolve(__dirname, 'flobocorp-automation-3ac38a3f9c31.json');
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    const fileId = '1BxPcwCqjrARGjGctfLuZq72xK1_9YXyL';

    const updatedData = event.body;

    await drive.files.update({
      fileId,
      media: {
        mimeType: 'application/json',
        body: updatedData,
      },
    });

    return {
      statusCode: 200,
      body: 'Cocktail data updated successfully',
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `Failed to save cocktail data: ${err.message}`,
    };
  }
};