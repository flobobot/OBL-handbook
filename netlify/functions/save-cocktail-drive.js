const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
const { Readable } = require('stream');

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

    const fileId = '1BxPcwCqjrARGjGctfLuZq72xK1_9YXyL'; // Replace with your real file ID
    const jsonContent = event.body;

    // Convert string to a stream
    const stream = new Readable();
    stream.push(jsonContent);
    stream.push(null); // End the stream

    await drive.files.update({
      fileId,
      media: {
        mimeType: 'application/json',
        body: stream,
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
      body: JSON.stringify({ message: 'Failed to save file to Google Drive.', error: error.message })
    };
  }
};