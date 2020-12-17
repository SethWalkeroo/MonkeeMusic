const fs = require('fs');

module.exports = {
	name: 'settings',
	description: 'View your bot settings for the server.',
	usage: '#settings',
	guildOnly: true,
	cooldown: 2,
	async execute(message, args) {
		const configLocation = `../MonkeeMusic/server_configs/${message.guild.id}.json`;
		const rawData = fs.readFileSync(configLocation);
		let config = JSON.parse(rawData);
		const title = 'Server Settings!'
		const commandBoarder = '='.repeat(title.length);
		let settings = `
${commandBoarder}
${title} :monkey_face: :tools:
${commandBoarder}
**Bitrate:** ${config.bitrate}
**Volume:** ${config.volume}
		`;
		message.channel.send(settings);
	},
};