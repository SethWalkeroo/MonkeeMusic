const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
const fs = require('fs');
const config = require('../config.json');

module.exports = {
	name: 'play',
	description: 'Play a song in your channel!',
	async execute(message) {
		try {
			const args = message.content.split(' ');
			const queue = message.client.queue;
			const serverQueue = message.client.queue.get(message.guild.id);

			const voiceChannel = message.member.voice.channel;
			if (!voiceChannel)
				return message.channel.send(
					'You need to be in a voice channel to play music!'
				);
			
			const permissions = voiceChannel.permissionsFor(message.client.user);
			if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
				return message.channel.send(
					'I need the permissions to join and speak in your voice channel!'
				);
			}

			// check for the playlist command
			const playlistSongs = [];
			let chosenPlaylist;
			if (args[1] === 'playlist') {
				const playlistsLocation = '../MonkeeMusic/music_data/playlists.json';
				const data = await fs.readFileSync(playlistsLocation);
				const playlists = await JSON.parse(data);
				if (!args[2]) {
					return message.reply('Please specify which playlist you would like to add.');
				}
				for (playlist in playlists) {
					if (args[2] === playlist) {
						chosenPlaylist = playlists[`${playlist}`];
						break;
					}
				}
				for (song of chosenPlaylist) {
					playlistSongs.push(song);
				}
			}
			console.log(playlistSongs);

			if (!playlistSongs.length) {
				// Setting the video id to default as the second argument (#[command] being the first argument).
				let videoId = args[1];
				// Gets url of first search result from a query if user does not provide a url.	
				if (!videoId.startsWith('https://')) {
					let query = ''
					if (args.length > 2) {
						for (word of args) {
							if (!word.startsWith(config.prefix)) {
								query += word + ' ';
							}
						} 
					} else {
						query = args[1]
					}
					const results = await ytsr(query, {limit: 1, pages: 1});
					videoId = await results.items[0].id;
				}
				// Grabs information about the video provided in the url.
				const songInfo = await ytdl.getInfo(videoId);
				const song = {
					title: songInfo.videoDetails.title,
					url: songInfo.videoDetails.video_url
				};
			}

			// Construct the serverQueue if it does not already exist. 
			if (!serverQueue) {
				const queueConstruct = {
					textChannel: message.channel,
					voiceChannel: voiceChannel,
					connection: null,
					songs: [],
					volume: 5,
					playing: true
				};

				await queue.set(message.guild.id, queueConstruct);
				if (!playlistSongs.length) {
					queueContruct.songs.push(song);
				} else {
					queueConstruct.songs = queueConstruct.songs.concat(playlistSongs);
				}

				try {
					var connection = await voiceChannel.join();
					queueConstruct.connection = connection;
					this.play(message, queueConstruct.songs[0]);
				} catch (err) {
					console.log(err);
					queue.delete(message.guild.id);
					return message.channel.send(err);
				}
			} else {
				if (!playlistSongs.length) {
					serverQueue.songs.push(song);
					return message.channel.send(`${song.title} has been added to the queue!`);
				} else {
					serverQueue.songs = serverQueue.songs.concat(playlistSongs);
					return message.channel.send(`The ${args[2]} playlist has been added to the queue!`);
				}

			}
		} catch (error) {
			console.log(error);
			message.channel.send(error.message);
		}
	},

	play(message, song) {
		const queue = message.client.queue;
		const guild = message.guild;
		const serverQueue = queue.get(message.guild.id);

		if (!song) {
			serverQueue.voiceChannel.leave();
			queue.delete(guild.id);
			return;
		}

		const dispatcher = serverQueue.connection
			.play(ytdl(song.url), {bitrate: 512})
			.on('finish', () => {
				serverQueue.songs.shift();
				this.play(message, serverQueue.songs[0]);
			})
			.on('error', error => console.error(error));

		dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
		serverQueue.textChannel.send(`:monkey_face: :musical_note: Start playing: **${song.title}**`);
	}
};