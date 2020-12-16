const shuffle = require('shuffle-array')

module.exports = {
	name: 'shuffle',
	description: 'Shuffle the current queue.',
	usage: '#shuffle',
	guildOnly: true,
	cooldown: 2,
	execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to skip a song.');
		if (!serverQueue) return message.channel.send('There is no queue to shuffle.');
		shuffle(serverQueue.songs);
		return message.channel.send('The current queue has been shuffled! :monkey_face: :thumbup:');
	},
};