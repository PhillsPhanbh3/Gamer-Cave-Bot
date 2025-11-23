const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const GCBLevel = require('../../Schemas/gcb_leveling');
const LogError = require('../../utils/LogError');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('level-leaderboard')
    .setDescription('Show the level leaderboard with pagination'),

  async execute(interaction) {
    try {
      const allUsers = await GCBLevel.find().sort({ level: -1, xp: -1 });

      if (!allUsers.length) {
        return interaction.reply({ content: 'No level data available.', flags: 64 });
      }

      const usersPerPage = 25;
      let page = 0;

      const getEmbed = (start) => {
        const pageUsers = allUsers.slice(start, start + usersPerPage);
        const embed = new EmbedBuilder()
          .setTitle('🏆 Level Leaderboard')
          .setColor(0x5865f2)
          .setFooter({ text: `Page ${Math.floor(start / usersPerPage) + 1} of ${Math.ceil(allUsers.length / usersPerPage)}` });

        const description = pageUsers.map((user, index) => {
          const level = user.level;
          const xp = user.xp;
          const nextXp = level * 100;
          const progress = Math.floor((xp / nextXp) * 100);
          return `**${start + index + 1}.** <@${user.userId}> — Level **${level}** | XP: **${xp}/${nextXp}** (${progress}%)`;
        }).join('\n');

        embed.setDescription(description);
        return embed;
      };

      const backButton = new ButtonBuilder()
        .setCustomId('leaderboard_back')
        .setLabel('◀ Back')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

      const nextButton = new ButtonBuilder()
        .setCustomId('leaderboard_next')
        .setLabel('Next ▶')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(allUsers.length <= usersPerPage);

      const row = new ActionRowBuilder().addComponents(backButton, nextButton);

      await interaction.reply({
        embeds: [getEmbed(0)],
        components: [row],
        ephemeral: false
      });

      const message = await interaction.fetchReply();

      const collector = message.createMessageComponentCollector({
        time: 60_000,
        filter: i => i.user.id === interaction.user.id
      });

      collector.on('collect', async i => {
        if (i.customId === 'leaderboard_next') page++;
        if (i.customId === 'leaderboard_back') page--;

        const startIndex = page * usersPerPage;
        const maxPages = Math.ceil(allUsers.length / usersPerPage);

        backButton.setDisabled(page === 0);
        nextButton.setDisabled(startIndex + usersPerPage >= allUsers.length);

        await i.update({
          embeds: [getEmbed(startIndex)],
          components: [new ActionRowBuilder().addComponents(backButton, nextButton)]
        });
      });

      collector.on('end', async () => {
        const disabledRow = new ActionRowBuilder().addComponents(
          backButton.setDisabled(true),
          nextButton.setDisabled(true)
        );

        await message.edit({ components: [disabledRow] }).catch(() => {});
      });

    } catch (err) {
      console.error('❌ Error in /leaderboard command:', err);
      LogError(error, client);
      return interaction.reply({
        content: 'An error occurred while loading the leaderboard.',
        flags: 64
      });
    }
  }
};