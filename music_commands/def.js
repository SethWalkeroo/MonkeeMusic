const wd = require('word-definition');
const Discord = require('discord.js');

module.exports = {
	name: 'def',
	description: 'Finds the definition of a specified word.',
	usage: '[def (word)',
	guildOnly: true,
	cooldown: 3,
	async execute(message, args) {
		if (!args.length) {return message.channel.send('Please specify the word you want a definition for!');}
		if (args.length > 1) {return message.channel.send('Please only specify one word!');}
		const word = args[0]
		const image = 'https://www.collinsdictionary.com/images/full/dictionary_168552845.jpg'
		wd.getDef(word, 'en', null, function(definition) {
			const defEmbed = new Discord.MessageEmbed()
			.setColor('#03cffc')
			.setThumbnail(image)
			.setTitle(definition.word.toUpperCase())
			defEmbed.addFields(
				{ name: 'category', value: definition.category},
				{ name: 'definition', value: definition.definition, inline: true },
			);
			return message.channel.send(defEmbed);
		});
	},
};