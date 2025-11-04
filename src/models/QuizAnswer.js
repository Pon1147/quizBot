const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const QuizAnswer = sequelize.define(
    "QuizAnswer",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      quiz_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      question_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      question_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      answer: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_correct: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      time_taken: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      points_earned: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      answered_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "quiz_answers",
      timestamps: false,
      indexes: [{ fields: ["quiz_id"] }],
    }
  );

  QuizAnswer.associate = (models) => {
    QuizAnswer.belongsTo(models.Quiz, { foreignKey: "quiz_id" });
    QuizAnswer.belongsTo(models.Question, { foreignKey: "question_id" });
    QuizAnswer.belongsTo(models.QuizParticipant, {
      foreignKey: "user_id",
      targetKey: "user_id",
    });
  };

  return QuizAnswer;
};
