module.exports = {
	customID: 'poke',
	async execute(interaction, client) {
		await interaction.reply({
			content: 'Ouch that hurts! :c',
			flags: 64
		});
	}
}