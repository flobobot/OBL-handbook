const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/drive']
    });

    const drive = google.drive({ version: 'v3', auth });

    const fileId = '1BxPcwCqjrARGjGctfLuZq72xK1_9YXyL'; // your correct file ID
    const body = event.body;

    await drive.files.update({
      fileId,
      media: {
        mimeType: 'application/json',
        body,
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'File saved successfully to Google Drive.' })
    };
  } catch (error) {
    console.error('Drive Save Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to save file to Google Drive.' })
    };
  }
};
