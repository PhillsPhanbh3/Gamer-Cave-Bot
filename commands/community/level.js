const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const GCBLevel = require('../../Schemas.js/gcb leveling schema');
const { LogError } = require('../../utils/LogError');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('level')
    .setDescription("Check a user's level")
    .addUserOption(option => option.setName('user').setDescription('The user to check').setRequired(false)),

  async execute(interaction) {
    try {
      const user = interaction.options.getUser('user') || interaction.user;

      const userData = await GCBLevel.findOne({ userId: user.id });

      if (!userData) {
        return interaction.reply({
          content: `${user.username} has no level data.`,
          flags: 64
        });
      }

      const currentXp = userData.xp;
      const currentLevel = userData.level;
      const requiredXp = currentLevel * 100;
      const progress = Math.floor((currentXp / requiredXp) * 100);

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`${user.username}'s Level`)
        .setDescription(
          `📊 Level: **${currentLevel}**\n` +
          `⭐ XP: **${currentXp} / ${requiredXp}** (${progress}%)`
        )
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `Keep chatting to level up!` });

      await interaction.reply({
        embeds: [embed],
        flags: 64
      });

    } catch (err) {
      console.error('❌ Error in /level command:', err);
      LogError(error, client);
      return interaction.reply({
        content: 'An error occurred while fetching level data.',
        flags: 64
      });
    }
  }
};
