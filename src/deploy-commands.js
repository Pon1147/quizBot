require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const commandsPath = path.join(__dirname, "src/commands");
const commandArray = [];

if (fs.existsSync(commandsPath)) {
  const commandFolders = fs.readdirSync(commandsPath);
  for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs
      .readdirSync(folderPath)
      .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const filePath = path.join(folderPath, file);
      const command = require(filePath);
      commandArray.push(command.data.toJSON());
    }
  }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("🔄 Deploying slash commands to guild...");
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commandArray }
    );
    console.log("✅ Deployed guild-specific!");
  } catch (error) {
    console.error("❌ Deploy failed:", error);
  }
})();
