require("dotenv").config();
console.log(
  "🔍 .env raw:",
  process.env.DISCORD_TOKEN
    ? "LOADED (" + process.env.DISCORD_TOKEN.slice(0, 10) + "...)"
    : "EMPTY - Fix .env!"
);
console.log(
  "🔍 All env keys:",
  Object.keys(process.env).filter((k) => k.includes("DISCORD"))
);
const fs = require("fs");
const path = require("path");
const {
  Client,
  Collection,
  GatewayIntentBits,
  REST,
  Routes,
} = require("discord.js");
const { initDatabase } = require("./src/utils/database");
const config = require("./config.json");
const { initManager } = require("./services/quizManager");
initManager().catch(console.error);

// Debug: Log token status
console.log(
  "🔧 Starting bot... Token loaded:",
  process.env.DISCORD_TOKEN ? "YES" : "NO"
);
console.log("🔧 DB init...");
initDatabase(); // Init DB early (legacy nếu cần)

(async () => {
  try {
    await initManager(); // Init QuizManager với Sequelize
    console.log("✅ QuizManager initialized.");
  } catch (err) {
    console.error("❌ Failed to init QuizManager:", err);
    process.exit(1);
  }
})();

// Client setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers, // Thêm để award roles
  ],
});

// Collections
client.commands = new Collection();
client.commandArray = []; // For deploy

// Load commands
const commandsPath = path.join(__dirname, "src/commands");
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
      client.commands.set(command.data.name, command);
      client.commandArray.push(command.data.toJSON());
    }
  }
}

// Load events
const eventsPath = path.join(__dirname, "src/events");
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
}

// Handle errors
client.on("error", console.error);
process.on("unhandledRejection", (reason) =>
  console.log("Unhandled Rejection:", reason)
);

// FULL INTERACTION HANDLER: Log + Execute command
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    console.log("❌ No command found:", interaction.commandName);
    return await interaction.reply({
      content: "Lệnh không tồn tại!",
      ephemeral: true,
    });
  }

  console.log(
    "📨 Received command:",
    interaction.commandName,
    "subcommand:",
    interaction.options.getSubcommand(false) || "none",
    "by",
    interaction.user.username
  );

  try {
    await command.execute(interaction);
    console.log("✅ Command executed successfully");
  } catch (error) {
    console.error("❌ Command execution error:", error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "Có lỗi xảy ra!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({ content: "Có lỗi xảy ra!", ephemeral: true });
    }
  }
});

// Login
client
  .login(process.env.DISCORD_TOKEN)
  .then(() => {
    console.log(`✅ Logged in as ${client.user.tag}!`);
    client.user.setActivity(config.bot.status, { type: "PLAYING" });
  })
  .catch((error) => {
    console.error("❌ Login failed:", error.message);
    if (error.message.includes("Invalid Token")) {
      console.error("🔧 Fix: Check DISCORD_TOKEN in .env");
    }
    process.exit(1); // Exit nếu fail
  });

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("🛑 Shutting down...");
  client.destroy();
  process.exit(0);
});
