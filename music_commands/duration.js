const convert = require('convert-seconds');

module.exports = {
	name: 'duration',
	description: 'Display the duration of the current song or duratino of entire queue.',
	usage: '#duration (for duration of current song) or #duration queue (for duration of whole queue).',
	guildOnly: true,
	cooldown: 2,
	execute(message, args) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to clear the music queue!');
		if (!serverQueue) return message.channel.send('There are currently no songs playing.');
		if (!args[0]) {
			const currentSong = serverQueue.songs[0];
			const songDuration = convert(parseInt(currentSong.duration));
			return message.channel.send(
				`${currentSong.title} has a duration of **${songDuration.hours} hours : ${songDuration.minutes} minutes : ${songDuration.seconds} seconds**! :monkey_face:
			`);
		}
		let totalDuration = 0;
		for (song of serverQueue.songs) {
			totalDuration += parseInt(song.duration);
		}
		totalDuration = convert(totalDuration);
		return message.channel.send(
			`The current queue has a duration of **${totalDuration.hours} hours : ${totalDuration.minutes} minutes: ${totalDuration.seconds} seconds**! :monkey_face:`
		);
	},
};