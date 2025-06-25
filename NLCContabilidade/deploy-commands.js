// ⚠️ No Replit, este require é inofensivo, mas não causa erro
require("dotenv").config();

const { REST, Routes } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

// Lê todos os arquivos de comando
const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  commands.push(command.data.toJSON());
}

// Usa o token do painel de segredos do Replit
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("🔁 Registrando comandos...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID,
      ),
      { body: commands },
    );

    console.log("✅ Comandos registrados com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao registrar comandos:", error);
  }
})();
