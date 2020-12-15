module.exports = {
	name: 'nowplaying',
	description: 'Get the song that is playing.',
	guildOnly: true,
	cooldown: 2,
	execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!serverQueue) return message.channel.send('There is nothing playing.');
		return message.channel.send(`:monkey_face: :musical_note: Now playing: ${serverQueue.songs[0].title}`);
	},
};