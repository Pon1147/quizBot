const { sequelize } = require("./src/models");

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true }); // Force recreate tables (destructive, chỉ dev)
    console.log("✅ Migration complete via Sequelize sync (fresh DB).");
    await sequelize.close();
  } catch (error) {
    console.error("❌ Migration error:", error);
  }
})();
