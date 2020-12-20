const Discord = require('discord.js');

module.exports = {
	name: 'help',
	description: 'List all available music commands.',
	usage: '[help',
	guildOnly: true,
	cooldown: 30,
	async execute(message) {
		const helpEmbed = new Discord.MessageEmbed()
		.setColor('#FF0000')
		.setTitle('MonkeeMusic Help :monkey_face:')
		.setURL('https://discord.com/invite/z7uq2rh7bQ')
		.addFields(
			{ name: ':keyboard: ```List of commands:``` https://github.com/SethWalkeroo/MonkeeMusic', value: '\u200B' },
			{ name: ':people_hugging: ```Support Server:``` https://discord.gg/69BGBPrNZY', value: '\u200B'},
		);

		await message.channel.send(helpEmbed);
	},
};