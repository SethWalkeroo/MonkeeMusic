const fs = require('fs')
const Discord = require('discord.js')
const config = require('../config.json')

module.exports = {
	name: 'help',
	description: 'List all available music commands.',
	guildOnly: true,
	cooldown: 2,
	execute(message) {
		let commands = [];
		const commandFiles = fs.readdirSync('./music_commands').filter(file => file.endsWith('.js'));

		for (const file of commandFiles) {
			const command = require(`./${file}`);
			commands.push(`**${config.prefix}${command.name}  --**  ${command.description}`);
		}

		const helpEmbed = new Discord.MessageEmbed()
			.setColor('#f0f03c')
			.setTitle('All MonkeeMusic Commands! :monkey_face: :musical_note:')

		for (const command of commands) {
			helpEmbed.addField(name=command, value='\u2800', inline=false);
		}

		message.channel.send(helpEmbed);
	},

};