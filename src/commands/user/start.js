const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { checkQuizPerms } = require("../../utils/permissions");
const { startQuiz } = require("../../services/quizManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("start")
    .setDescription("Bắt đầu quiz đã tạo")
    .addStringOption((option) =>
      option
        .setName("quiz_id")
        .setDescription("ID quiz cần start (từ /create)")
        .setRequired(true)
    ),
  async execute(interaction) {
    console.log(`🔄 Executing start`);

    try {
      await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

      const hasPerms = await checkQuizPerms(interaction);

      if (!hasPerms) {
        return interaction.editReply("❌ Bạn không có quyền start quiz!");
      }
      const quizId = interaction.options.getString("quiz_id");
      await startQuiz(interaction, quizId);
    } catch (error) {
      console.error(`❌ Execute error for start:`, error);
      if (interaction.deferred) {
        await interaction.editReply({
          content: `❌ Lỗi start: ${error.message}`,
          flags: [MessageFlags.Ephemeral],
        });
      } else {
        await interaction.reply({
          content: `❌ Lỗi start: ${error.message}`,
          flags: [MessageFlags.Ephemeral],
        });
      }
    }
  },
};
