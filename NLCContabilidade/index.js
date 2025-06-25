require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const {
  Client,
  Collection,
  GatewayIntentBits,
  ChannelType,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  Events,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Carrega comandos
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

client.once("ready", () => {
  console.log(`🤖 Bot online como ${client.user.tag}`);
});

// Armazena tópicos criados e quem os criou (temporariamente em memória)
const registrosPendentes = new Map();

client.on("interactionCreate", async (interaction) => {
  // Slash Commands
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "Erro ao executar o comando.",
        ephemeral: true,
      });
    }
  }

  // Modal Submit
  if (interaction.isModalSubmit() && interaction.customId === "registroModal") {
    const usuario = interaction.fields.getTextInputValue("usuario");
    const problema = interaction.fields.getTextInputValue("problema");
    const solucao = interaction.fields.getTextInputValue("solucao");
    const sistema = interaction.fields.getTextInputValue("sistema");
    const departamento = interaction.fields.getTextInputValue("departamento");

    try {
      const canal = await client.channels.fetch(process.env.CHANNEL_ID);
      if (!canal || canal.type !== ChannelType.GuildForum) {
        return await interaction.reply({
          content: "❌ Canal de fórum inválido.",
          ephemeral: true,
        });
      }

      const thread = await canal.threads.create({
        name: problema,
        autoArchiveDuration: 1440,
        reason: "Novo erro registrado via formulário",
        message: {
          content: `‍
          💼 **Usuário:** ${usuario}
          📌 **Problema:** ${problema}
          ⚙️ **Sistema:** ${sistema}
          🏢 **Departamento:** ${departamento}
          ✅ **Solução:** ${solucao}`,
        },
      });

      // Salva info para esperar print do usuário
      registrosPendentes.set(interaction.user.id, thread.id);

      const botao = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("enviarPrint")
          .setLabel("📎 Enviar Print")
          .setStyle(ButtonStyle.Primary),
      );

      await interaction.reply({
        content: `✅ Registro criado com sucesso!\n[Ver tópico](https://discord.com/channels/${interaction.guildId}/${thread.id})\n\nDeseja enviar um print?`,
        components: [botao],
        ephemeral: true,
      });
    } catch (error) {
      console.error("Erro criando thread:", error);
      await interaction.reply({
        content: `❌ Falha ao criar o tópico.\nErro: ${error.message}`,
        ephemeral: true,
      });
    }
  }

  // Botão: Enviar Print
  if (interaction.isButton() && interaction.customId === "enviarPrint") {
    await interaction.reply({
      content:
        "📤 Por favor, envie o print aqui nesta conversa como **anexo**.",
      ephemeral: true,
    });
  }
});

// Detecta mensagens com anexos após o botão
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const threadId = registrosPendentes.get(message.author.id);
  if (!threadId) return;
  if (message.attachments.size === 0) return;

  const thread = await client.channels.fetch(threadId);
  if (!thread) return;

  try {
    // Reenvia a print dentro do tópico
    await thread.send({
      content: `🖼️ Print enviada`,
      files: Array.from(message.attachments.values()).map((a) => a.url),
    });

    // Apaga a mensagem original
    await message.delete();

    // Envia confirmação e agenda para apagar depois de 5 segundos
    const confirmMsg = await message.channel.send(
      "✅ Print adicionada ao tópico e mensagem original apagada.",
    );
    setTimeout(() => confirmMsg.delete().catch(() => {}), 5000);

    // Limpa do controle temporário
    registrosPendentes.delete(message.author.id);
  } catch (err) {
    console.error("Erro ao processar print:", err);
    await message.reply("❌ Erro ao adicionar o print ao tópico.");
  }
});

// Login e manter vivo
client.login(process.env.DISCORD_TOKEN);

const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("✅ Bot está vivo!"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Servidor escutando na porta ${PORT}`));
