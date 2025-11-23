const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const {LogError} = require('../../utils/LogError');

module.exports = {
    dev: true,
    Owner: true,
    data: new SlashCommandBuilder()
    .setName('pgc-perks')
    .setDescription('Bot & Guild Owner only command to send the guild rules'),
    async execute(interaction) {
        
    }
}