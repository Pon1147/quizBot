const { dbRun, dbAll, dbQuery } = require("../utils/database");
const { logScore } = require("../utils/logger");
const config = require("../../config.json");

module.exports = {
  calculateScores: async (
    quizId,
    questionId,
    questionNumber,
    correctAnswer,
    answers,
    timeLimit,
    db
  ) => {
    if (answers.length === 0) {
      console.log(`⚠️ No answers for Q${questionNumber} - Skipping scores`);
      return;
    }
    const multiplier = 1.0;
    const participants = await dbAll(
      "SELECT user_id FROM quiz_participants WHERE quiz_id = ?",
      [quizId]
    );
    const participantIds = participants.map((p) => p.user_id);
    console.log(
      `🔍 Debug: Fresh participants for scores: [${participantIds.join(
        ", "
      )}] | Total: ${participantIds.length}`
    );

    for (const ans of answers) {
      try {
        if (!participantIds.includes(ans.user_id)) {
          console.log(
            `🔍 Debug: Auto-joining ${ans.user_id} (${ans.username})`
          );
          await dbRun(
            `INSERT OR IGNORE INTO quiz_participants (quiz_id, user_id, username, total_score, correct_answers) VALUES (?, ?, ?, 0, 0)`,
            [quizId, ans.user_id, ans.username]
          );
          participantIds.push(ans.user_id);
        }

        let points = 0,
          isCorrect = 0;
        if (ans.answer.toUpperCase() === correctAnswer.toUpperCase()) {
          const timeBonus = Math.max(
            0,
            (timeLimit - ans.time_taken) / timeLimit
          );
          points = Math.floor(100 * (0.5 + 0.5 * timeBonus) * multiplier);
          isCorrect = 1;
          console.log(
            `✅ Correct! User ${ans.user_id} gets ${points} points (time: ${ans.time_taken}s)`
          );
        } else {
          console.log(
            `❌ Wrong! User ${ans.user_id} answer ${ans.answer} vs correct ${correctAnswer}`
          );
        }

        await dbRun(
          `INSERT INTO quiz_answers (quiz_id, question_id, question_number, user_id, answer, is_correct, time_taken, points_earned) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            quizId,
            questionId,
            questionNumber,
            ans.user_id,
            ans.answer,
            isCorrect,
            ans.time_taken,
            points,
          ]
        );

        const existing = await dbQuery(
          "SELECT total_score, correct_answers FROM quiz_participants WHERE quiz_id = ? AND user_id = ?",
          [quizId, ans.user_id]
        );
        if (existing) {
          const newScore = existing.total_score + points;
          const newCorrect = existing.correct_answers + isCorrect;
          await dbRun(
            `UPDATE quiz_participants SET total_score = ?, correct_answers = ?, username = ? WHERE quiz_id = ? AND user_id = ?`,
            [newScore, newCorrect, ans.username, quizId, ans.user_id]
          );
          console.log(
            `🔍 Debug: UPDATED score for ${ans.user_id}: ${newScore} total, ${newCorrect} correct`
          );
        } else {
          await dbRun(
            `INSERT INTO quiz_participants (quiz_id, user_id, username, total_score, correct_answers) VALUES (?, ?, ?, ?, ?)`,
            [quizId, ans.user_id, ans.username, points, isCorrect]
          );
          console.log(
            `🔍 Debug: INSERTED score for ${ans.user_id}: ${points} points, ${isCorrect} correct`
          );
        }

        logScore({
          quiz_id: quizId,
          question_number: questionNumber,
          user_id: ans.user_id,
          points,
          is_correct: isCorrect,
        });
      } catch (ansErr) {
        console.error("Answer insert error:", ansErr);
      }
    }
    console.log(
      `📊 Scores calculated for Q${questionNumber}: ${answers.length} answers processed`
    );
  },

  calculateFinalStats: async (quizId, quiz, db) => {
    const finalScores = await dbAll(
      `SELECT p.user_id, p.username, p.total_score, p.correct_answers FROM quiz_participants p WHERE p.quiz_id = ? ORDER BY p.total_score DESC LIMIT 3`,
      [quizId]
    );

    if (finalScores.length === 0) {
      return {
        finalScores: [],
        totalParticipants: 0,
        avgCorrect: 0,
        avgTime: "N/A",
      };
    }

    const totalParticipants = (
      await dbQuery(
        "SELECT COUNT(*) as count FROM quiz_participants WHERE quiz_id = ?",
        [quizId]
      )
    ).count;
    const totalCorrect = finalScores.reduce(
      (sum, s) => sum + s.correct_answers,
      0
    );
    const avgCorrect =
      totalParticipants > 0
        ? Math.round(
            (totalCorrect / totalParticipants / quiz.questions_count) * 100 * 10
          ) / 10
        : 0;
    const avgTimeRow = await dbQuery(
      "SELECT AVG(time_taken) as avg_time FROM quiz_answers WHERE quiz_id = ?",
      [quizId]
    );
    const avgTime = avgTimeRow?.avg_time?.toFixed(2) ?? "N/A";

    return { finalScores, totalParticipants, avgCorrect, avgTime };
  },
};
