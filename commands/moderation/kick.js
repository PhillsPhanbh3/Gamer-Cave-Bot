const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('kick a user from the server')
    .addUserOption(option => option.setName('target').setDescription('The user you would like to kick out of the server').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('The reason for kicking the user')),
    async execute (interaction, client) {

        const kickUser = interaction.options.getUser('target');
        const kickMember = await interaction.guild.members.fetch(kickUser.id);
        const channel = interaction.channel;

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return await interaction.reply({ content: "You can't execute this command because you don't have the **KICK MEMBERS** permission!", flags: 64});
        if (!kickMember) return await interaction.reply({ content: "The user mentioned is not in the server", flags: 64});
        if (!kickMember.kickable) return await interaction.reply({ content: "I can't kick this user because they have roles that is above me or you", flags: 64});

        let reason = interaction.options.getString('reason');
        if (!reason) reason = "No reason given.";

        const dmEmbed = new EmbedBuilder()
        .setColor("DarkOrange")
        .setDescription(`:white_check_mark: You have been kicked from the server **${interaction.guild.name} ** | ${reason}`)

        const embed = new EmbedBuilder()
        .setColor("Navy")
        .setDescription(`:white_check_mark: ${kickUser.tag} has been **kicked** | ${reason}`)

        await kickMember.send ({ embeds: [dmEmbed] }).catch(err => {
            return;
        });

        await kickMember.kick({ reason: reason }).catch(err => {
            interaction.reply({ content: `${err}
                There was an error, please report this screenshot to the support server https://discord.gg/tfSB4D4X`, flags: 64});
        });

        await interaction.reply({ embeds: [embed] });

    }
}