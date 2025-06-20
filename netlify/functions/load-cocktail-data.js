const { google } = require('googleapis');

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    // Parse credentials from environment variable
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Replace with the actual file ID of your cocktail_data_backup.json
    const fileId = '1ZB1ddghCaKwh4yNdEU8HRGo3ZV8rHkX9';

    const res = await drive.files.get(
      {
        fileId,
        alt: 'media',
      },
      { responseType: 'stream' }
    );

    let data = '';
    await new Promise((resolve, reject) => {
      res.data
        .on('data', (chunk) => (data += chunk))
        .on('end', resolve)
        .on('error', reject);
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: data,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `Failed to load cocktail data: ${err.message}`,
    };
  }
};