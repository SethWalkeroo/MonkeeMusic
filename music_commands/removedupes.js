module.exports = {
	name: 'removedupes',
	description: 'Remove all song duplicates from the current queue.',
	usage: '#removedupes',
	guildOnly: true,
	cooldown: 3,
	execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to skip a song!');
        if (!serverQueue) return message.channel.send('There are no songs playing in the queue!');
        songQueue = serverQueue.songs;
        uniqueSongs = [];
        songUrls = [];
        for (song of songQueue) {
            if (!songUrls.includes(song.url)) {
                uniqueSongs.push(song);
                songUrls.push(song.url);
            }
        }
        serverQueue.songs = uniqueSongs;
        message.channel.send('All duplicate songs have been removed from the current queue! :monkey_face: :thumbup:');
	},
};