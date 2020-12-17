const convert = require('convert-seconds');
const fs = require('fs');

module.exports = {
	name: 'duration',
	description: 'Display the duration of the current song, queue, or specified playlist.',
	usage: '#duration, #duration queue, #duration [playlist name].',
	guildOnly: true,
	cooldown: 2,
	execute(message, args) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to clear the music queue!');
		if (!serverQueue) return message.channel.send('There are currently no songs playing.');

		// if no argument is specified, get the duration of the current song.
		if (!args[0]) {
			const currentSong = serverQueue.songs[0];
			const songDuration = convert(parseInt(currentSong.duration));
			return message.channel.send(
				`${currentSong.title} has a duration of **${songDuration.hours} hours : ${songDuration.minutes} minutes : ${songDuration.seconds} seconds**! :monkey_face:
			`);
		}
		// if the the argument is equal to queue, get the duration of the current queue.
		if (args[0] === 'queue') {
			let totalDuration = 0;
			for (song of serverQueue.songs) {
				totalDuration += parseInt(song.duration);
			}
			totalDuration = convert(totalDuration);
			return message.channel.send(
				`The current queue has a duration of **${totalDuration.hours} hours : ${totalDuration.minutes} minutes: ${totalDuration.seconds} seconds**! :monkey_face:`
			);
		}

		// if the argument is the name of a playlist, get the duration of the playlist.
		const playlistsLocation = `../MonkeeMusic/music_data/${message.guild.id}.json`;
		const rawData = fs.readFileSync(playlistsLocation);
		const playlists = JSON.parse(rawData);

		let playlistName = null;
		for (playlist in playlists) {
			if (args[0] === playlist) {
				playlistName = playlist;
				break;
			}
		}
		if (playlistName) {
			let totalDuration = 0;
			for (song of playlists[`${playlistName}`]) {
				totalDuration += parseInt(song.duration);
			}
			totalDuration = convert(totalDuration);
			return message.channel.send(
				`The **${playlistName}** playlist has a duration of **hours : ${totalDuration.minutes} minutes: ${totalDuration.seconds} seconds**! :monkey_face:`
			);
		} else {
			return message.channel.send('The specified playlist does not exist! :worried:');
		}
	},
};