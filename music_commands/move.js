module.exports = {
	name: 'move',
	description: 'Move a song to a different position in the queue.',
	usage: '[move [current position] [desired position]',
	guildOnly: true,
	cooldown: 2,
	async execute(message, args) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!message.member.voice.channel) return await message.channel.send('You have to be in a voice channel to move a song.');
        if (!serverQueue) return await message.channel.send('There are no songs playing in the queue!');
        if (!serverQueue.songs.length) return await message.channel.send('There are no songs in the queue!');
		if (args.length < 2) return await message.channel.send('Please specify the current queue position and the desired queue position to move to!');

        const firstPosition = parseInt(args[0]) - 1;
        const desiredPosition = parseInt(args[1] - 1);

        if (!this.validNumber(firstPosition, serverQueue || this.validNumber(desiredPosition, serverQueue))) {
            return message.channel.send('Invalid move positions for the current song queue!');
        }
        
        let cleanedSongs = [];
        let songToMove = serverQueue.songs[firstPosition];
        delete serverQueue.songs[firstPosition];
        serverQueue.songs.splice(desiredPosition, 0, songToMove);
        for (song of serverQueue.songs) {
            if (song) {
                cleanedSongs.push(song);
            }
        }
        serverQueue.songs = cleanedSongs;
        if (!message.client.config.silent) {
            await message.channel.send(`Song at position **${firstPosition + 1}** has been moved  to position **${desiredPosition + 1}**`);
        } else {
            await message.react('👍');
        }

    },
    validNumber(number, serverQueue) {
        if (isNaN(number)) {
			return false;
		} else if (number < 0 || number > serverQueue.songs.length) {
			return false;
		} else {
            return true;
        }
    }
};