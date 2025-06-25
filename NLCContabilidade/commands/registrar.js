const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("registrar")
    .setDescription("Abre um formulário para registrar um erro"),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId("registroModal")
      .setTitle("Registro de Erro");

    const usuario = new TextInputBuilder()
      .setCustomId("usuario")
      .setLabel("Seu nome")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const problema = new TextInputBuilder()
      .setCustomId("problema")
      .setLabel("Problema")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const solucao = new TextInputBuilder()
      .setCustomId("solucao")
      .setLabel("Solução aplicada")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const sistema = new TextInputBuilder()
      .setCustomId("sistema")
      .setLabel("Sistema afetado")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const departamento = new TextInputBuilder()
      .setCustomId("departamento")
      .setLabel("Departamento afetado")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(usuario),
      new ActionRowBuilder().addComponents(problema),
      new ActionRowBuilder().addComponents(solucao),
      new ActionRowBuilder().addComponents(sistema),
      new ActionRowBuilder().addComponents(departamento),
    );

    await interaction.showModal(modal);
  },
};
