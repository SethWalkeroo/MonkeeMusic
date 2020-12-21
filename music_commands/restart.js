module.exports = {
	name: 'restart',
	description: 'Restart the song that is currently playing.',
	usage: '[restart',
	guildOnly: true,
	cooldown: 2,
	async execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!message.member.voice.channel) return await message.channel.send('You have to be in a voice channel to restart a song!');
		if (!serverQueue) return await message.channel.send('There is no song to restart!');
		if (!serverQueue.connection.dispatcher) return await message.channel.send('There is no song playing to restart!');
		try {
             const currentSong = serverQueue.songs[0];
             if (serverQueue.songs.length > 1) {
                 serverQueue.songs.splice(1, 0, currentSong);
             } else {
                 serverQueue.songs.push(currentSong);
             }
			await serverQueue.connection.dispatcher.end();
		} catch (error) {
			console.log(error);
			return await message.channel.send('There is no song to restart.');
		}
		if (!message.client.config.silent) {
			await message.channel.send('Song restarted! :monkey_face: :thumbup:');
		} else {
			await message.react('🔄');
		}
	},
};