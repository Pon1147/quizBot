module.exports = {
  async checkQuizPerms(interaction) {
    return (
      interaction.member.permissions.has("ManageGuild") ||
      interaction.user.id === process.env.OWNER_ID
    );
  },
};
