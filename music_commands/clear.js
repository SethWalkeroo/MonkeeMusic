module.exports = {
	name: 'clear',
	description: 'Clear all the songs from the current queue.',
	usage: '[clear',
	guildOnly: true,
	cooldown: 3,
	execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to clear the music queue!');
		serverQueue.songs = [];
		message.channel.send('The queue has been cleared! :thumbup:');
	},
};