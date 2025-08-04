const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout-remove')
        .setDescription('Removes a timeout from a server member')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user you want to remove the timeout from')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for removing the timeout from the user')),

    async execute(interaction) {
        const timeUser = interaction.options.getUser('user');
        let timeMember;

        // Check for necessary permissions
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return await interaction.reply({
                content: 'You must have the Moderate Members permission to use this command.',
                flags: 64
            });
        }

        // Fetch the member
        try {
            timeMember = await interaction.guild.members.fetch(timeUser.id);
        } catch {
            return await interaction.reply({
                content: 'The user mentioned is no longer within the server.',
                flags: 64
            });
        }

        // Additional checks
        if (!timeMember.kickable) {
            return await interaction.reply({
                content: 'I cannot remove the timeout from this user! Ensure I have sufficient permissions.',
                flags: 64
            });
        }

        if (interaction.member.id === timeMember.id) {
            return await interaction.reply({
                content: 'You cannot remove the timeout from yourself!',
                flags: 64
            });
        }

        if (timeMember.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return await interaction.reply({
                content: 'You cannot remove the timeout from a person with Administrator permissions.',
                flags: 64
            });
        }

        const reason = interaction.options.getString('reason') || 'No reason given';

        // Remove timeout
        try {
            await timeMember.timeout(null, reason);

            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setDescription(`:white_check_mark: ${timeUser.tag}'s timeout has been **removed** | ${reason}`);

            const dmEmbed = new EmbedBuilder()
                .setColor('Blue')
                .setDescription(`:white_check_mark: Your timeout in ${interaction.guild.name} has been removed. Reason: ${reason}`);

            // Notify the user in DMs
            await timeMember.send({ embeds: [dmEmbed] }).catch(() => {
                console.log('Failed to send DM to the user.');
            });

            // Reply to the interaction
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({content: `${err}, There was an error while attempting to remove the timeout from this user, please report this to the support server https://discord.gg/tfSB4D4X`, flags: 64});
        }
    }
};