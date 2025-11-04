const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { checkQuizPerms } = require("../../utils/permissions");
const { stopQuiz } = require("../../services/quizManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Dừng quiz đang chạy"),
  async execute(interaction) {
    console.log(`🔄 Executing stop`);

    try {
      await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

      const hasPerms = await checkQuizPerms(interaction);

      if (!hasPerms) {
        return interaction.editReply("❌ Bạn không có quyền dừng quiz!");
      }
      await stopQuiz(interaction);
    } catch (error) {
      console.error(`❌ Execute error for stop:`, error);
      if (interaction.deferred) {
        await interaction.editReply({
          content: `❌ Lỗi stop: ${error.message}`,
          flags: [MessageFlags.Ephemeral],
        });
      } else {
        await interaction.reply({
          content: `❌ Lỗi stop: ${error.message}`,
          flags: [MessageFlags.Ephemeral],
        });
      }
    }
  },
};
