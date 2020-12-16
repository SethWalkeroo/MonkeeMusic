module.exports = {
	name: 'bitrate',
	description: 'Adjust the bot\'s bitrate.',
	usage: '#bitrate [value]',
	guildOnly: true,
	cooldown: 2,
	async execute(message, args) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!serverQueue) return message.channel.send('There is nothing playing.');
		if (!args[0]) return message.reply('Please specify a value for the bitrate!')
		const amount = parseInt(args[0]);
		if (isNaN(amount)) {
			return message.reply('Please enter a valid bitrate amount.');
		} else if (amount <= 0) {
			return message.reply('Please enter a value greater than 0.');
		}
		serverQueue.bitrate = amount;
		return message.channel.send(`The bot's bitrate is now set to **${amount} kbs**! :monkey_face: :thumbup:`);
	},
};