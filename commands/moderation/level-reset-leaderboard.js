const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const GCBLevel = require('../../Schemas.js/gcb leveling schema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('level-reset-leaderboard')
    .setDescription('⚠ Reset ALL users\' levels and XP data')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const confirmRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('confirm_reset')
        .setLabel('✅ Confirm Reset')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('cancel_reset')
        .setLabel('❌ Cancel')
        .setStyle(ButtonStyle.Secondary)
    );

    const confirmEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('Reset Leaderboard?')
      .setDescription('⚠ This will **delete all XP and level data** from the leaderboard.\n\nAre you sure you want to proceed?')
      .setFooter({ text: 'This action is permanent!' });

    await interaction.reply({ embeds: [confirmEmbed], components: [confirmRow], flags: 64 });

    const collector = interaction.channel.createMessageComponentCollector({
      filter: i => i.user.id === interaction.user.id,
      time: 15000
    });

    collector.on('collect', async i => {
      if (i.customId === 'confirm_reset') {
        await GCBLevel.deleteMany({});
        await i.update({
          content: '✅ Successfully reset the entire leaderboard.',
          embeds: [],
          components: [],
        });
      } else if (i.customId === 'cancel_reset') {
        await i.update({
          content: '❌ Leaderboard reset cancelled.',
          embeds: [],
          components: [],
        });
      }
      collector.stop();
    });

    collector.on('end', async collected => {
      if (collected.size === 0) {
        await interaction.editReply({
          content: '⏱ Leaderboard reset request timed out.',
          embeds: [],
          components: [],
        }).catch(() => {});
      }
    });
  }
};
