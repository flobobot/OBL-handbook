const { google } = require('googleapis');
const { Readable } = require('stream');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    const credentialsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64;
    if (!credentialsBase64) {
      throw new Error('Missing GOOGLE_CREDENTIALS_BASE64 environment variable');
    }

    const credentials = JSON.parse(Buffer.from(credentialsBase64, 'base64').toString('utf-8'));

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });

    const fileId = '1BxPcwCqjrARGjGctfLuZq72xK1_9YXyL'; // 🔁 YOUR FILE ID
    const jsonContent = event.body;

    const stream = new Readable();
    stream.push(jsonContent);
    stream.push(null);

    await drive.files.update({
      fileId,
      media: {
        mimeType: 'application/json',
        body: stream,
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Saved to Google Drive' })
    };

  } catch (error) {
    console.error('Drive Save Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to save', error: error.message })
    };
  }
};