module.exports = {
	name: 'resume',
	description: 'Resume the current song.',
	usage: '[resume',
	guildOnly: true,
	cooldown: 2,
	async execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to pause the music.');
		if (!serverQueue) return message.channel.send('There is nothing to resume!');
		const player = serverQueue.connection.dispatcher;
		await player.resume();
		return message.channel.send('The bot has resumed playing music! :monkey_face: :thumbup:');

	},
};