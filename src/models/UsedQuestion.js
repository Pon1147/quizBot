const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const UsedQuestion = sequelize.define(
    "UsedQuestion",
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
      used_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "used_questions",
      timestamps: false,
      indexes: [{ fields: ["quiz_id"] }],
      uniqueKeys: {
        unique_quiz_question: {
          fields: ["quiz_id", "question_id"],
        },
      },
    }
  );

  UsedQuestion.associate = (models) => {
    UsedQuestion.belongsTo(models.Quiz, { foreignKey: "quiz_id" });
    UsedQuestion.belongsTo(models.Question, { foreignKey: "question_id" });
  };

  return UsedQuestion;
};
