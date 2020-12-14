module.exports = {
	name: 'queue',
	description: 'Display all of the songs in the current queue.',
	execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id)
		if (!serverQueue) {
			return message.channel.send('There are no songs in queue at the moment.');
		}
		let result = ''
		let count = 1
		for (song of serverQueue.songs) {
			result += `**${count}:** ${song.title}\n`;
			count += 1;
		}
		message.channel.send(result);
	},
};