module.exports = {
	name: 'duration',
	description: 'Display the duration of the current song.',
	usage: '#duration',
	guildOnly: true,
	cooldown: 3,
	execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to clear the music queue!');
		if (!serverQueue) return message.channel.send('There is currently no song playing.');
		message.channel.send('The queue has been cleared! :thumbup:');
	},
};