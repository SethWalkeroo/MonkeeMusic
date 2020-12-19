module.exports = {
	name: 'queue',
	description: 'Display all of the songs in the current queue.',
	usage: '[queue',
	guildOnly: true,
	cooldown: 2,
	async execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id)
		if (!serverQueue) {
			return await message.channel.send('```The queue is empty 😟```');
		} else if (!serverQueue.songs.length) {
			return await message.channel.send('```The queue is empty 😟```');
		}
		let result = ''
		let count = 1
		for (song of serverQueue.songs) {
			if (count === 1) {
				result += `1: ${song.title} (currently playing)\n`;
			} else {
				result += `${count}: ${song.title}\n`;
			}
			count += 1;
		}
		let backticks = '```';
		await message.channel.send(`${backticks}${result}${backticks}`);
	},
};