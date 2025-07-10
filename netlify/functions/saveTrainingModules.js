const fs = require("fs");
const path = require("path");

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const modules = JSON.parse(event.body);
    const savePath = path.join(__dirname, "../data/training_modules.json");

    fs.writeFileSync(savePath, JSON.stringify(modules, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to save module data." })
    };
  }
};