const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('unban a user from the server')
    .addUserOption(option => option.setName('user').setDescription('The user you would like to unban').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('The reason for unbanning the user')),
    async execute (interaction, client) {

        const userID = interaction.options.getUser('user');

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return await interaction.reply({ content: "You can't execute this command because you don't have the **BAN MEMBERS** permission!", flags: 64});
        if (!interaction.member.id === userID) return await interaction.reply({ content: "You can't ban yourself", flags: 64});

        let reason = interaction.options.getString('reason');
        if (!reason) reason = "No reason given.";

        const embed = new EmbedBuilder()
        .setColor("DarkAqua")
        .setDescription(`:white_check_mark: <@${userID}> has unbannned | ${reason}`)
        
        await interaction.guild.bans.fetch()
        .then(async bans => {

            if (bans.size == 0) return await interaction.reply({ content: "There is no one banned from this server", flags: 64})
            let bannedID = bans.find(ban => ban.user.id == userID);
            if (!bannedID ) return await interaction.reply({ content: "The ID stated is not banned from this server", flags: 64})

            await interaction.guild.bans.remove(userID, reason).catch(err => {
                return interaction.reply({ content: "I can't unban this user"})
            })
        })

        await interaction.reply({ embeds: [embed] });

    }
}