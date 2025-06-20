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

    const dataPath = path.resolve(__dirname, '../../data/cocktail_data_backup.json');
    const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    const slug = cocktail.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const index = jsonData.findIndex(c => c.title && c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug);

    if (index !== -1) {
      jsonData[index] = cocktail;
    } else {
      jsonData.push(cocktail);
    }

    fs.writeFileSync(dataPath, JSON.stringify(jsonData, null, 2));
    return { statusCode: 200, body: JSON.stringify({ message: 'Cocktail updated successfully' }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};