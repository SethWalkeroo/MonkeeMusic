const fs = require('fs');

module.exports = {
	name: 'save',
	description: 'Saves the current queue as a playlist.',
	usage: '[save [playlist name]',
	guildOnly: true,
	cooldown: 3,
	async execute(message, args) {
		if (!args[0]) return message.channel.send('Please specify a playlist name for the queue!');
		
		const playlistsLocation = `../MonkeeMusic/music_data/${message.guild.id}.json`;
		const rawData = await fs.readFileSync(playlistsLocation);
		let playlists = await JSON.parse(rawData);
		const serverQueue = message.client.queue.get(message.guild.id);
		playlists[`${args[0]}`] = serverQueue.songs;
		const data = JSON.stringify(playlists, null, 2);
		fs.writeFileSync(playlistsLocation, data);
		return message.channel.send(`The **${args[0]}** playlist has been created from the current queue! :monkey_face: :thumbup:`);
	},
};