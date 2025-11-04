const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");
const config = require("../../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("quiz")
    .setDescription("Quản lý quiz ZingSpeed Mobile"),
  async execute(interaction) {
    console.log(`🔄 Executing quiz`);

    try {
      const embed = new EmbedBuilder()
        .setTitle("📚 Quiz ZingSpeed Mobile")
        .setDescription("Sử dụng các lệnh sau để quản lý quiz:")
        .addFields(
          {
            name: "/create",
            value: "Tạo quiz mới với category (xe, bản đồ, ...)",
            inline: true,
          },
          { name: "/start", value: "Bắt đầu quiz bằng quiz_id", inline: true },
          { name: "/stop", value: "Dừng quiz đang chạy", inline: true },
          {
            name: "Categories",
            value: Object.values(config.categories).join(", "),
            inline: false,
          },
          {
            name: "Defaults",
            value: `Số câu: ${config.quiz.default_questions_count} | Thời gian: ${config.quiz.default_time_per_question}s`,
            inline: false,
          }
        )
        .setColor("#00ff00")
        .setFooter({ text: "Cần quyền Quiz Admin để sử dụng!" });

      await interaction.reply({
        embeds: [embed],
        flags: [MessageFlags.Ephemeral],
      });
    } catch (error) {
      console.error(`❌ Execute error for quiz:`, error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: `❌ Lỗi quiz: ${error.message}`,
          flags: [MessageFlags.Ephemeral],
        });
      } else {
        await interaction.reply({
          content: `❌ Lỗi quiz: ${error.message}`,
          flags: [MessageFlags.Ephemeral],
        });
      }
    }
  },
};
