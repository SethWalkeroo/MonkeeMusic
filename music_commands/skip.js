module.exports = {
	name: 'skip',
	description: 'Skip a song playing in the queue.',
	usage: '#skip',
	guildOnly: true,
	cooldown: 2,
	async execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to skip a song.');
		if (!serverQueue) return message.channel.send('There is no song playing to skip.');
		await serverQueue.connection.dispatcher.end();
	},
};