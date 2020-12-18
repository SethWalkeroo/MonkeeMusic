module.exports = {
	name: 'pause',
	description: 'Pause the current song.',
	usage: '[pause',
	guildOnly: true,
	cooldown: 2,
	async execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to pause the music.');
		if (!serverQueue) return message.channel.send('There is nothing to pause!');
		const player = serverQueue.connection.dispatcher;
		await player.pause(true);
		return message.channel.send('The bot has been paused! :monkey_face: :thumbup:');
	},
};