module.exports = {
	name: 'leave',
	description: 'Make the bot leave the voice channel.',
	usage: '[leave',
	guildOnly: true,
	cooldown: 2,
	async execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!message.member.voice.channel) return message.channel.send('You have to be in the voice channel to make the bot leave!');
		if(!message.guild.voice.channel) return message.channel.send('The bot is not in a voice channel!');
		if (!serverQueue || !serverQueue.connection.dispatcher) {
			try {
				message.member.voice.channel.leave();
				if (!message.client.config.silent) {
					return await message.channel.send('The bot has left the voice channel! :monkey_face: :thumbup:');
				} else {
					return await message.react('🍃');
				}
			}
			catch (error) {
				console.log(error);
			}
		}
		try {
			serverQueue.songs = [];
			serverQueue.connection.dispatcher.end();
		} catch (error) {
			console.log(error);
			message.member.voice.channel.leave();
		}
		message.client.queue.delete(message.guild.id);
		await message.member.voice.channel.leave();
		if (!message.client.config.silent) {
			await message.channel.send('The bot has left the voice channel! :monkey_face: :thumbup:');
		} else {
			await message.react('🍃');
		}

	},
};