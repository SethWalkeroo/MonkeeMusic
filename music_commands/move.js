module.exports = {
	name: 'move',
	description: 'Move a song to a different position in the queue.',
	usage: '#move [current position] [desired position]',
	guildOnly: true,
	cooldown: 2,
	execute(message, args) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to move a song.');
		if (!serverQueue) return message.channel.send('There are no songs playing in the queue!');
		if (args.length < 2) return message.channel.send('Please specify the current queue position and the desired queue position to move to!');

        const firstPosition = parseInt(args[0]) - 1;
        const desiredPosition = parseInt(args[1] - 1);
        this.validNumber(firstPosition, serverQueue);
        this.validNumber(desiredPosition, serverQueue);
        
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
        return message.channel.send(`Song at position **${firstPosition}** has been moved  to position **${desiredPosition}**`);
    },
    validNumber(number, serverQueue) {
        if (isNaN(number)) {
			return message.channel.send('That doesn\'t seem to be a valid number.');
		} else if (number < 0 || number > serverQueue.songs.length) {
			return message.channel.send(`Please enter a value that is in range of the current queue size (${serverQueue.songs.length}).`);
		}
    }
};