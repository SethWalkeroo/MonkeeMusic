const shuffle = require('shuffle-array')

module.exports = {
	name: 'shuffle',
	description: 'Shuffle the current queue.',
	usage: '[shuffle',
	guildOnly: true,
	cooldown: 2,
	async execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!message.member.voice.channel) return await message.channel.send('You have to be in a voice channel to skip a song.');
		if (!serverQueue) return await message.channel.send('There is no queue to shuffle.');
		shuffle(serverQueue.songs);
		if (!message.client.config.silent) {
			await message.channel.send('The current queue has been shuffled! :monkey_face: :thumbup:');
		} else {
			await message.react('🔀');
		}
	},
};
