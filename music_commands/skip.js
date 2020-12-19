module.exports = {
	name: 'skip',
	description: 'Skip a song playing in the queue.',
	usage: '[skip',
	guildOnly: true,
	cooldown: 2,
	async execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!message.member.voice.channel) return await message.channel.send('You have to be in a voice channel to skip a song!');
		if (!serverQueue) return await message.channel.send('There is no song playing to skip!');
		if (!serverQueue.connection.dispatcher) return await message.channel.send('There is no song playing to skip!');
		try {
			await serverQueue.connection.dispatcher.end();
		} catch (error) {
			console.log(error);
			return await message.channel.send('There is nothing to skip. Use #leave if you want the bot to leave.');
		}
		if (!message.client.config.silent) {
			await message.channel.send('Song skipped! :monkey_face: :thumbup:');
		} else {
			await message.react('⏩');
		}
	},
};