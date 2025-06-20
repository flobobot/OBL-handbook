const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

exports.handler = async function (event) {
  try {
    // 1. Decode JSON credentials from base64 environment variable
    const base64 = process.env.GOOGLE_CREDENTIALS_BASE64;
    if (!base64) throw new Error("Missing GOOGLE_CREDENTIALS_BASE64 environment variable.");
    const credentials = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));

    // 2. Authenticate using service account
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });

    const drive = google.drive({ version: 'v3', auth });

    // 3. Fetch file content from Google Drive
    const fileId = '1BxPcwCqjrARGjGctfLuZq72xK1_9YXyL'; // your JSON file with cocktail data

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