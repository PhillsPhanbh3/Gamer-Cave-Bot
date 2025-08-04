const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const GCBLevel = require('../../Schemas.js/gcb leveling schema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('level-edit-xp')
    .setDescription('Edit a user\'s level or experience points')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild) // restrict command usage
    .addUserOption(option => 
      option.setName('user')
        .setDescription('User to edit')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('action-type')
        .setDescription('Choose whether to edit level or experience')
        .setRequired(true)
        .addChoices(
          { name: 'level', value: 'level' },
          { name: 'experience', value: 'xp' },
        ))
    .addStringOption(option =>
      option.setName('operation')
        .setDescription('Add, set, or remove the amount')
        .setRequired(true)
        .addChoices(
          { name: 'add', value: 'add' },
          { name: 'set', value: 'set' },
          { name: 'remove', value: 'remove' },
        ))
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Amount to add, set, or remove')
        .setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const actionType = interaction.options.getString('action-type'); // 'level' or 'xp'
    const operation = interaction.options.getString('operation'); // 'add', 'set', 'remove'
    const amount = interaction.options.getInteger('amount');

    if (amount < 0) {
      return interaction.reply({ content: 'Amount must be a positive integer.', flags: 64 });
    }

    let userData = await GCBLevel.findOne({ userId: user.id });

    if (!userData) {
      // Create user data if missing, only if setting or adding
      if (operation === 'remove') {
        return interaction.reply({ content: `${user.tag} has no data to remove from.`, flags: 64 });
      }
      userData = new GCBLevel({ userId: user.id });
    }

    if (actionType === 'level') {
      // Modify level
      if (operation === 'add') {
        userData.level += amount;
      } else if (operation === 'remove') {
        userData.level -= amount;
        if (userData.level < 1) userData.level = 1;
      } else if (operation === 'set') {
        userData.level = amount < 1 ? 1 : amount;
      }
    } else if (actionType === 'xp') {
      // Modify XP
      if (operation === 'add') {
        userData.xp += amount;
      } else if (operation === 'remove') {
        userData.xp -= amount;
        if (userData.xp < 0) userData.xp = 0;
      } else if (operation === 'set') {
        userData.xp = amount < 0 ? 0 : amount;
      }
    }

    await userData.save();

    return interaction.reply({
      content: `Successfully ${operation}ed ${amount} ${actionType} for ${user.tag}. New level: ${userData.level}, XP: ${userData.xp}.`,
      flags: 64
    });
  }
};
