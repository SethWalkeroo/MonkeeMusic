const wd = require('word-definition')
const Discord = require('discord.js');

module.exports = {
	name: 'def',
	description: 'Finds the definition of a specified word.',
	usage: '[def (word)',
	guildOnly: true,
	cooldown: 3,
	async execute(message, args) {
		if (!args.length) {
			return message.channel.send('Please specify the word you want a definition for!');
		}
		let language = 'en'
		if (args[1]) {
			language = args[1] 
		}
		const word = args[0]
		wd.getDef(word, language, null, function(definition) {
			const defEmbed = new Discord.MessageEmbed()
			.setColor('#FF0000')
			.setTitle(definition.word.toUpperCase())
			defEmbed.addFields(
				{ name: 'category', value: definition.category},
				{ name: 'definition', value: definition.definition, inline: true },
			);
			return message.channel.send(defEmbed);
		});
	return message.channel.send('Something went wrong LMAO!');
	},
};