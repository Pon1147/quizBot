const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");
const fs = require("fs");

const DB_PATH = path.join(__dirname, "../../data/database.sqlite");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: DB_PATH,
  logging: false, // Tắt logs SQL mặc định
});

const models = {};

// Load all models safely
const modelsDir = path.join(__dirname, "./");
fs.readdirSync(modelsDir)
  .filter((file) => file.endsWith(".js") && file !== "index.js")
  .forEach((file) => {
    try {
      const required = require(path.join(modelsDir, file));
      if (typeof required !== "function") {
        console.error(
          `❌ Model file ${file} exports non-function:`,
          typeof required
        );
        return; // Skip invalid
      }
      const model = required(sequelize, DataTypes);
      if (model && model.name) {
        models[model.name] = model;
        console.log(`✅ Loaded model: ${model.name} from ${file}`);
      } else {
        console.error(`❌ Invalid model from ${file}: No name or null`);
      }
    } catch (loadErr) {
      console.error(`❌ Load error for ${file}:`, loadErr.message);
    }
  });

// Associations
Object.values(models).forEach((model) => {
  if (model.associate) {
    try {
      model.associate(models);
      console.log(`✅ Associated model: ${model.name}`);
    } catch (assocErr) {
      console.error(
        `❌ Association error for ${model.name}:`,
        assocErr.message
      );
    }
  }
});

module.exports = { sequelize, ...models };
