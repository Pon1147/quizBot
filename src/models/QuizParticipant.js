const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const QuizParticipant = sequelize.define(
    "QuizParticipant",
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
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      total_score: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      correct_answers: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      joined_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "quiz_participants",
      timestamps: false,
      indexes: [{ fields: ["quiz_id"] }],
      uniqueKeys: {
        unique_quiz_user: {
          fields: ["quiz_id", "user_id"],
        },
      },
    }
  );

  QuizParticipant.associate = (models) => {
    QuizParticipant.belongsTo(models.Quiz, { foreignKey: "quiz_id" });
    QuizParticipant.hasMany(models.QuizAnswer, {
      foreignKey: "user_id",
      sourceKey: "user_id",
    });
  };

  return QuizParticipant;
};
