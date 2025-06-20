const { google } = require('googleapis');

exports.handler = async function (event, context) {
  try {
    // Retrieve base64-encoded credentials from environment variable
    const base64Credentials = process.env.GOOGLE_CREDENTIALS_BASE64;

    if (!base64Credentials) {
      return {
        statusCode: 500,
        body: 'Missing environment variable: GOOGLE_CREDENTIALS_BASE64',
      };
    }

    // Decode base64 and parse the service account JSON
    const decoded = Buffer.from(base64Credentials, 'base64').toString('utf8');
    let credentials;
    try {
      credentials = JSON.parse(decoded);
    } catch (err) {
      return {
        statusCode: 500,
        body: `Invalid JSON in GOOGLE_CREDENTIALS_BASE64: ${err.message}`,
      };
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // ID of the JSON file stored in Google Drive
    const FILE_ID = '1OaVR6OhtCFJ1GV-Td2P9WB5VLczMCOK0'; // ← replace if needed

    // Fetch file contents
    const result = await drive.files.get({
      fileId: FILE_ID,
      alt: 'media',
    });

    // Respond with contents
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result.data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `Failed to load cocktail data: ${err.message}`,
    };
  }
};