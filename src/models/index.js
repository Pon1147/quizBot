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

// Load all models
const modelsDir = path.join(__dirname, "./");
fs.readdirSync(modelsDir)
  .filter((file) => file.endsWith(".js") && file !== "index.js")
  .forEach((file) => {
    const model = require(path.join(modelsDir, file))(sequelize, DataTypes);
    models[model.name] = model;
  });

// Associations
Object.values(models).forEach((model) => {
  if (model.associate) model.associate(models);
});

module.exports = { sequelize, ...models };
