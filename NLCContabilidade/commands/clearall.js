const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clearall")
    .setDescription(
      "Apaga todas as mensagens recentes do canal (até 14 dias).",
    ),

  async execute(interaction) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.ManageMessages,
      )
    ) {
      return interaction.reply({
        content: "❌ Você não tem permissão para apagar mensagens.",
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    let totalApagadas = 0;
    try {
      while (true) {
        const mensagens = await interaction.channel.messages.fetch({
          limit: 100,
        });
        if (mensagens.size === 0) break;

        const apagadas = await interaction.channel.bulkDelete(mensagens, true);
        totalApagadas += apagadas.size;

        if (apagadas.size < 100) break; // Parar se não tem mais mensagens deletáveis
      }

      await interaction.editReply(
        `✅ Foram apagadas ${totalApagadas} mensagens do canal.`,
      );
    } catch (error) {
      console.error("Erro ao apagar mensagens:", error);
      await interaction.editReply({
        content:
          "❌ Erro ao apagar mensagens. Verifique permissões e se as mensagens têm menos de 14 dias.",
      });
    }
  },
};
