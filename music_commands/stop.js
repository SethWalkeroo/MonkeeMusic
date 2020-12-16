module.exports = {
	name: 'stop',
	description: 'Stop all songs in the queue and clears the queue.',
	usage: '#stop',
	guildOnly: true,
	cooldown: 2,
	execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to stop the music.');
		if (!serverQueue) {
			return message.reply('There are no songs playing!');
		}
		serverQueue.songs = [];
		serverQueue.connection.dispatcher.end();
		message.channel.send('The bot has stopped playing music! :thumbup:');
	},
};