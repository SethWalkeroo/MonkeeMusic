module.exports = {
	name: 'clear',
	description: 'Clear all the songs from the current queue.',
	usage: '[clear',
	guildOnly: true,
	cooldown: 3,
	async execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!message.member.voice.channel) return await message.channel.send('You have to be in a voice channel to clear the music queue!');
		serverQueue.songs = [];
		if (!message.client.config.silent) {
			await message.channel.send('The queue has been cleared! :thumbup:');
		} else {
			await message.react('👍');
		}

	},
};