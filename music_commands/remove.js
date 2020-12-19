module.exports = {
	name: 'remove',
	description: 'Remove a song for a specified position in the queue.',
	usage: '[remove [queue location]',
	guildOnly: true,
	cooldown: 2,
	async execute(message, args) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!message.member.voice.channel) return await message.channel.send('You have to be in a voice channel to remove a song.');
        if (!serverQueue) return await message.channel.send('There are no songs playing in the queue!');
        if (!serverQueue.songs.length) return await message.channel.send('There are no songs in the queue!');
		if (args.length < 1) return await message.channel.send('Please specify the queue position you want to remove!');

        const queuePosition = parseInt(args[0]) - 1;

        if (!this.validNumber(queuePosition, serverQueue)) {
            return message.channel.send('Invalid remove position for the current song queue!');
        }
        
        delete serverQueue.songs[queuePosition];
        let filteredSongs = serverQueue.songs.filter(function (el) {
            return el != null;
        });

        serverQueue.songs = filteredSongs;
        if (!message.client.config.silent) {
            await message.channel.send(`Song at position **${queuePosition + 1}** has been removed from the queue!`);
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