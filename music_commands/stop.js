module.exports = {
	name: 'stop',
	description: 'Stop all songs in the queue and clears the queue.',
	usage: '[stop',
	guildOnly: true,
	cooldown: 2,
	async execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to stop the music.');
		if (!serverQueue) {
			return message.channel.send('There are no songs playing!');
		}
		try {
			serverQueue.songs = [];
			await serverQueue.connection.dispatcher.end();
		} catch (error) {
			console.log(error);
			return message.channel.send('There is nothing to stop. Use #leave if you want the bot to leave.');
		}

		return message.channel.send('The bot has stopped playing music! :thumbup:');
	},
};