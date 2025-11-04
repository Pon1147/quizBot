const {
  sequelize,
  Quiz,
  Question,
  QuizParticipant,
  QuizAnswer,
  UsedQuestion,
} = require("../models");

async function initDatabase() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true }); // Alter schema nếu cần
    console.log("✅ Sequelize DB connected and synced.");
    return {
      sequelize,
      Quiz,
      Question,
      QuizParticipant,
      QuizAnswer,
      UsedQuestion,
    };
  } catch (error) {
    console.error("❌ DB init error:", error);
    process.exit(1);
  }
}

module.exports = { initDatabase };
