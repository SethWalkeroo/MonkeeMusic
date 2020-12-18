module.exports = {
	name: 'leave',
	description: 'Make the bot leave the voice channel.',
	usage: '[leave',
	guildOnly: true,
	cooldown: 2,
	async execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to stop the music.');
		if (!serverQueue) {
			try {
				return await message.member.voice.channel.leave();
			}
			catch (error) {
				console.log(error);
			}
		}
		try {
			serverQueue.songs = [];
			await serverQueue.connection.dispatcher.end();
		} catch (error) {
			console.log(error);
			await message.member.voice.channel.leave();
		}
		message.client.queue.delete(message.guild.id);
		await message.member.voice.channel.leave();
		message.channel.send('The bot has left the voice channel! :monkey_face: :thumbup:');
	},
};