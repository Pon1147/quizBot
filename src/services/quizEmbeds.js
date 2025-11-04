const { EmbedBuilder } = require("discord.js");
const config = require("../../config.json");

module.exports = {
  createQuizEmbed: (
    quizId,
    category,
    questions_count,
    time_per_question,
    channelId
  ) => {
    return new EmbedBuilder()
      .setTitle("✅ Quiz đã được tạo thành công!")
      .setDescription("━━━━━━━━━━━━━━━━━━━━━━")
      .addFields(
        { name: "📋 Quiz ID", value: quizId, inline: true },
        {
          name: "📂 Category",
          value: config.categories[category],
          inline: true,
        },
        { name: "📊 Questions", value: `${questions_count} câu`, inline: true },
        {
          name: "⏱️ Time",
          value: `${time_per_question} giây/câu`,
          inline: true,
        },
        { name: "📍 Channel", value: `<#${channelId}>`, inline: true }
      )
      .setColor(0x00ff00)
      .setFooter({ text: `Sử dụng /quiz start ${quizId} để bắt đầu` });
  },

  startCountdownEmbed: (quiz, count, isGo = false) => {
    const baseDesc = `\n\n📋 Thông tin Quiz:\n• Category: ${
      config.categories[quiz.category]
    }\n• Số câu: ${quiz.questions_count} câu\n• Thời gian: ${
      quiz.time_per_question
    }s/câu\n\n🎁 Giải thưởng:\n🥇 Top 1: Role "${
      config.roles.quiz_champion
    }" + 1000 coins\n🥈 Top 2: 500 coins\n🥉 Top 3: 250 coins\n\nChuẩn bị sẵn sàng! 🏎️💨`;

    let description;
    if (isGo) {
      description = `GO!${baseDesc}`;
    } else {
      description = `Quiz sẽ bắt đầu trong: ${count} giây${baseDesc}`;
    }

    return new EmbedBuilder()
      .setTitle("🏁 QUIZ ZINGSPEED MOBILE BẮT ĐẦU! 🏁")
      .setDescription(description)
      .setColor(0x00aff4);
  },

  questionEmbed: (
    question,
    questionNumber,
    quiz,
    timeLeft = quiz.time_per_question
  ) => {
    return new EmbedBuilder()
      .setTitle(`Câu ${questionNumber}/${quiz.questions_count}`)
      .setDescription(question.question_text)
      .setColor(0x00aff4)
      .addFields(
        { name: "🇦", value: question.option_a, inline: false },
        { name: "🇧", value: question.option_b, inline: false },
        { name: "🇨", value: question.option_c, inline: false },
        { name: "🇩", value: question.option_d, inline: false }
      )
      .setFooter({
        text: `⏱️ Còn lại: ${timeLeft}s | 🏆 Điểm tối đa: 100`,
      })
      .setImage(question.image_url || null);
  },

  showQuestionResultsEmbed: (questionNumber, question, answers, timeLimit) => {
    if (answers.length === 0) {
      return new EmbedBuilder()
        .setTitle(`📊 KẾT QUẢ CÂU ${questionNumber}`)
        .setDescription("Không có ai trả lời câu này!")
        .setColor(0xff0000);
    }

    const stats = { A: 0, B: 0, C: 0, D: 0 };
    answers.forEach((ans) => stats[ans.answer]++);
    const totalAnswers = answers.length;
    const correctAnswers = answers
      .filter((ans) => ans.answer === question.correct_answer)
      .sort((a, b) => a.time_taken - b.time_taken)
      .slice(0, 3);
    const top3Text =
      correctAnswers.length > 0
        ? correctAnswers
            .map((ans, idx) => {
              const timeBonus = Math.max(
                0,
                (timeLimit - ans.time_taken) / timeLimit
              );
              const points = Math.floor(100 * (0.5 + 0.5 * timeBonus));
              return `${["🥇", "🥈", "🥉"][idx]} <@${
                ans.user_id
              }> - ${points} điểm (${ans.time_taken.toFixed(1)}s)`;
            })
            .join("\n")
        : "Không ai đúng!";

    const correctKey = `option_${question.correct_answer.toLowerCase()}`;
    const correctText = question[correctKey] || "N/A";

    const embed = new EmbedBuilder()
      .setTitle(`📊 KẾT QUẢ CÂU ${questionNumber}`)
      .setDescription(question.question_text)
      .setColor(0x00ff00)
      .addFields(
        {
          name: "📈 Thống kê lựa chọn",
          value: `🇦 ${stats.A} người (${(
            (stats.A / totalAnswers) *
            100
          ).toFixed(0)}%)\n🇧 ${stats.B} người (${(
            (stats.B / totalAnswers) *
            100
          ).toFixed(0)}%)\n🇨 ${stats.C} người (${(
            (stats.C / totalAnswers) *
            100
          ).toFixed(0)}%)\n🇩 ${stats.D} người (${(
            (stats.D / totalAnswers) *
            100
          ).toFixed(0)}%)`,
          inline: false,
        },
        {
          name: "✅ Đáp án đúng",
          value: `${question.correct_answer} - ${correctText}`,
          inline: false,
        }
      );
    if (question.explanation)
      embed.addFields({
        name: "💡 Giải thích",
        value: question.explanation,
        inline: false,
      });
    embed.addFields({
      name: "⚡ Top 3 nhanh nhất (đúng)",
      value: top3Text,
      inline: false,
    });

    return embed;
  },

  noParticipantsEmbed: (quizId, quiz) => {
    return new EmbedBuilder()
      .setTitle("🏆 BẢNG XẾP HẠNG CUỐI CÙNG")
      .setDescription(
        `Quiz: ${quizId}\nCategory: ${
          config.categories[quiz.category]
        }\n\n❌ Chưa có ai tham gia hoặc trả lời!`
      )
      .setColor(0xffd700)
      .setTimestamp();
  },

  endQuizEmbed: (
    quizId,
    quiz,
    finalScores,
    totalParticipants,
    avgCorrect,
    avgTime
  ) => {
    const embed = new EmbedBuilder()
      .setTitle("🏆 BẢNG XẾP HẠNG CUỐI CÙNG")
      .setDescription(
        `Quiz: ${quizId}\nCategory: ${config.categories[quiz.category]}`
      )
      .setColor(0xffd700)
      .setTimestamp();

    finalScores.forEach((entry, idx) => {
      const medal = ["🥇", "🥈", "🥉"][idx];
      embed.addFields({
        name: `${medal} ${entry.username}`,
        value: `📊 Điểm: **${entry.total_score}**\n✅ Đúng: ${entry.correct_answers}/${quiz.questions_count}\n⏱️ Trung bình: ${avgTime}s`,
        inline: true,
      });
    });

    embed.addFields(
      {
        name: "🎁 Phần thưởng đã được trao",
        value: `🥇 Role + 1000 coins | 🥈 500 coins | 🥉 250 coins`,
        inline: false,
      },
      {
        name: "📈 Thống kê Quiz",
        value: `👥 Số người tham gia: ${totalParticipants}\n✅ Tỷ lệ đúng trung bình: ${avgCorrect}%\n⏱️ Thời gian trả lời TB: ${avgTime}s\n🔥 Câu khó nhất: N/A`,
        inline: false,
      }
    );

    return embed;
  },
};
