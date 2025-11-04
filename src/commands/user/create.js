const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { checkQuizPerms } = require("../../utils/permissions");
const { createQuiz } = require("../../services/quizManager");
const config = require("../../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("create")
    .setDescription("Tạo quiz mới")
    .addStringOption((option) =>
      option
        .setName("category")
        .setDescription("Loại câu hỏi")
        .setRequired(true)
        .addChoices(
          { name: config.categories.vehicles, value: "vehicles" },
          { name: config.categories.maps, value: "maps" },
          { name: config.categories.gameplay, value: "gameplay" },
          { name: config.categories.items, value: "items" },
          { name: config.categories.history, value: "history" }
        )
    )
    .addIntegerOption((option) =>
      option
        .setName("questions_count")
        .setDescription("Số câu (mặc định 10)")
        .setRequired(false)
        .setMinValue(5)
        .setMaxValue(50)
    )
    .addIntegerOption((option) =>
      option
        .setName("time_per_question")
        .setDescription("Thời gian mỗi câu (mặc định 20s)")
        .setRequired(false)
        .setMinValue(10)
        .setMaxValue(60)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel chạy quiz (mặc định hiện tại)")
        .setRequired(false)
    ),
  async execute(interaction) {
    console.log(`🔄 Executing create`);

    try {
      await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

      const hasPerms = await checkQuizPerms(interaction);

      if (!hasPerms) {
        return interaction.editReply("❌ Bạn không có quyền tạo quiz!");
      }
      const category = interaction.options.getString("category");
      const questions_count =
        interaction.options.getInteger("questions_count") ||
        config.quiz.default_questions_count;
      const time_per_question =
        interaction.options.getInteger("time_per_question") ||
        config.quiz.default_time_per_question;
      const channel =
        interaction.options.getChannel("channel")?.id || interaction.channel.id;

      await createQuiz(
        interaction,
        category,
        questions_count,
        time_per_question,
        channel
      );
    } catch (error) {
      console.error(`❌ Execute error for create:`, error);
      if (interaction.deferred) {
        await interaction.editReply({
          content: `❌ Lỗi create: ${error.message}`,
          flags: [MessageFlags.Ephemeral],
        });
      } else {
        await interaction.reply({
          content: `❌ Lỗi create: ${error.message}`,
          flags: [MessageFlags.Ephemeral],
        });
      }
    }
  },
};
