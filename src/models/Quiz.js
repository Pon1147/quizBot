const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const Quiz = sequelize.define(
    "Quiz",
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      server_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      creator_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      creator_username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      questions_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      time_per_question: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      channel_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      started_at: {
        type: DataTypes.DATE,
      },
      finished_at: {
        type: DataTypes.DATE,
      },
      deleted_at: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "quizzes",
      timestamps: false,
      indexes: [{ fields: ["server_id"] }, { fields: ["status"] }],
    }
  );

  Quiz.associate = (models) => {
    Quiz.hasMany(models.QuizParticipant, { foreignKey: "quiz_id" });
    Quiz.hasMany(models.QuizAnswer, { foreignKey: "quiz_id" });
    Quiz.hasMany(models.UsedQuestion, { foreignKey: "quiz_id" });
  };

  return Quiz;
};
