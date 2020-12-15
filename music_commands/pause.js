module.exports = {
	name: 'pause',
	description: 'Pause the current song.',
	usage: '#pause',
	guildOnly: true,
	cooldown: 2,
	execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to pause the music.');
		serverQueue.connection.dispatcher.pause();
		message.channel.send('The bot has been paused! :thumbup:');
	},
};