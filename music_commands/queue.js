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
		let result = []
		let count = 1
		totalLength = 0;
		for (song of serverQueue.songs) {
			if (count === 1) {
				const queueInfo = `1: ${song.title} (currently playing)\n`
				totalLength += queueInfo.length;
				result.push(`1: ${song.title} (currently playing)`);
			} else {
				const queueInfo = `${count}: ${song.title}`;
				totalLength += queueInfo.length;
				result.push(queueInfo);
			}
			count += 1;
		}

		let backticks = '```';
		if (totalLength < 2000) {
			message.channel.send(`${backticks}${result.join('\r\n')}${backticks}`);
		} else {
			beginningOfQueue = Math.floor(result.length / 3)
			firstHalf = result.slice(0, beginningOfQueue);
			firstHalf.push(`And about ${result.length - beginningOfQueue} more songs in queue...`);
			try {
				return await message.channel.send(`${backticks}${firstHalf.join('\r\n')}${backticks}`);
			} catch {
				return message.channel.send(`The queue is gigantic and I am not smart enough to solve this problem at the moment.\nYou can complain on the Discord server and hopefully I will fix this soon.`);
			}
		}
	},
};