module.exports = {
	name: 'volume',
	description: 'Change the server wide volume of the bot on a scale of 0 to 200.',
	execute(message, args) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to change the bot volume!');

		const amount = parseInt(args[0]);

		if (isNaN(amount)) {
			return message.reply('That doesn\'t seem to be a valid number.');
		} else if (amount < 0 || amount > 200) {
			return message.reply('You need to input a decimal value between 0 and 5.');
		}

		serverQueue.volume = amount;
		serverQueue.connection.dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
	},
};