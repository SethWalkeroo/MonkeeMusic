module.exports = {
	name: 'reverse',
	description: 'Reverses the queue.',
	usage: '[reverse',
	guildOnly: true,
	cooldown: 2,
	async execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id)
		if (!serverQueue) {
			return await message.channel.send('There are no songs in queue at the moment.');
		} else if (!serverQueue.songs.length) {
			return await message.channel.send('There are no songs in queue at the moment.');
		}
		await serverQueue.songs.reverse();
		await message.channel.send('The queue has been reversed! :monkey_face: :thumbup:')
	},
};