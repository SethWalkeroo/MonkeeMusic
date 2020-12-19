module.exports = {
	name: 'playing',
	description: 'Get the song that is playing.',
	usage: '[playing',
	guildOnly: true,
	cooldown: 2,
	async execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!serverQueue) return await message.channel.send('There is nothing playing.');
		await message.channel.send(`:monkey_face: :musical_note: Now playing: **${serverQueue.songs[0].title}**`);
	},
};