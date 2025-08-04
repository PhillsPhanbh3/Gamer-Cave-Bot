const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('ban a user from the server')
    .addUserOption(option => option.setName('user').setDescription('The user you would like to ban').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('The reason for banning the user')),
    async execute (interaction, client) {

        const users = interaction.options.getUser('user');
        const ID = users.id;
        const banUser = client.users.cache.get(ID)

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return await interaction.reply({ content: "You can't execute this command because you don't have the **BAN MEMBERS** permission!", flags: 64});
        if (!interaction.member.id === ID) return await interaction.reply({ content: "You can't ban yourself", flags: 64});

        let reason = interaction.options.getString('reason');
        if (!reason) reason = "No reason given.";

        const dmEmbed = new EmbedBuilder()
        .setColor("Red")
        .setDescription(`:white_check_mark: You have been banned from the server **${interaction.guild.name} | ${reason}`)

        const embed = new EmbedBuilder()
        .setColor("DarkAqua")
        .setDescription(`:white_check_mark: ${banUser.tag} has been **banned** | ${reason}`)

        await interaction.guild.bans.create(banUser.id, {reason}).catch(err => {
            return interaction.reply({ content: "I can't ban this member! run /support to report the issue!", flags: 64})
        })

        await banUser.send ({ embeds: [dmEmbed] }).catch(err => {
            return;
        });

        await interaction.reply({ embeds: [embed] });

    }
}