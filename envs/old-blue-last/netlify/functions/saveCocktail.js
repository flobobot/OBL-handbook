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

    // Use Netlify's writeable /tmp directory
    const dataPath = '/tmp/cocktail_data_backup.json';

    // If the file doesn't exist, create an empty array
    let jsonData = [];
    if (fs.existsSync(dataPath)) {
      const fileContent = fs.readFileSync(dataPath, 'utf8');
      jsonData = JSON.parse(fileContent || '[]');
    }

    const slug = cocktail.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const index = jsonData.findIndex(
      c => c.title && c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug
    );

    if (index !== -1) {
      jsonData[index] = cocktail;
    } else {
      jsonData.push(cocktail);
    }

    fs.writeFileSync(dataPath, JSON.stringify(jsonData, null, 2), 'utf8');

    console.log(`Cocktail "${cocktail.title}" written to ${dataPath}`);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Cocktail updated successfully',
        cocktail,
        writtenTo: dataPath
      })
    };

  } catch (err) {
    console.error('Error saving cocktail:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};