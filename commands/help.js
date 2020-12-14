const fs = require('fs')
const config = require('../config.json')

module.exports = {
	name: 'help',
	description: 'List all available commands.',
	execute(message) {
		let str = '';
		const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

		for (const file of commandFiles) {
			const command = require(`./${file}`);
			str += `**${config.prefix}${command.name}** **-->** _${command.description}_\n`;
		}

		message.channel.send('Here is a list of all the available bot commands and their functions!\n');
		message.channel.send(str);
	},
};