const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const counting = require('../../Schemas.js/countingschema');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('counting')
    .setDescription('Manage your counting system')
    .addSubcommand(command => command.setName('setup').setDescription('setup the counting system').addChannelOption(option => option.setName('channel').setDescription('The channel you want to select for the counting system').addChannelTypes(ChannelType.GuildText).setRequired(true)))
    .addSubcommand(command => command.setName('disable').setDescription('Disable the counting system')),
    async execute (interaction) {

        const { options } = interaction;
        const sub = options.getSubcommand()
        const data = await counting.findOne({ Guild: interaction.guild.id});

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply('You do not have ADMIN which is needed to run this command!', flags = 64)
        
        switch (sub) {
            case 'setup':

            if (data) {
                return await interaction.reply('You have already setup the counting system within this server!', flags = 64)
            } else {
                const channel = interaction.options.getChannel('channel');
                await counting.create({
                    Guild: interaction.guild.id,
                    Channel: channel.id,
                    Number: 1
                });

                const embed = new EmbedBuilder()
                .setColor("Aqua")
                .setDescription(`⌚ The counting system has been setup! Go to ${channel} and start at number 1!`)

                await interaction.reply({ embeds: [embed], Flags: 64});
            }

            break;
            case 'disable':

            if (!data) {
                return await interaction.reply('You do not have the counting system setup', flags = 64)
            } else {
                await counting.deleteOne({
                    Guild: interaction.guild.id,
                });

                const embed = new EmbedBuilder()
                .setColor("Aqua")
                .setDescription(`👉 The counting channel has been disabled`)

                await interaction.reply({ embeds: [embed], flags: 64});
            }
        }
    }
}