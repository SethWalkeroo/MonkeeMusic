module.exports = {
	name: 'queue',
	description: 'Display all of the songs in the current queue.',
	usage: '[queue',
	guildOnly: true,
	cooldown: 2,
	async execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id)
		if (!serverQueue) {
			return await message.channel.send('There are no songs in queue at the moment.');
		} else if (!serverQueue.songs.length) {
			return await message.channel.send('There are no songs in queue at the moment.');
		}
		let result = ''
		let count = 1
		for (song of serverQueue.songs) {
			if (count === 1) {
				result += `**Currently playing:** ${song.title}\n`;
			} else {
				result += `**${count}:** ${song.title}\n`;
			}
			count += 1;
		}
		await message.channel.send(result);
	},
};