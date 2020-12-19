module.exports = {
	name: 'settings',
	description: 'View your bot settings for the server.',
	usage: '[settings',
	guildOnly: true,
	cooldown: 2,
	async execute(message) {
		let config = message.client.config;
		const title = 'Server Settings!'
		const commandBoarder = '='.repeat(title.length);
		let settings = `
${commandBoarder}
${title} :monkey_face: :tools:
${commandBoarder}
**Bitrate:** ${config.bitrate}
**Volume:** ${config.volume}
**Silenced:** ${config.silent}
		`;
		await message.channel.send(settings);
	},
};