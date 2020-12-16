const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
const stringSimilarity = require('string-similarity');
const fs = require('fs');
const chalk = require('chalk');
const config = require('../config.json');
const cacheLocation = '../MonkeeMusic/music_data/query_cache.json'
const queueLimit = 250;

module.exports = {
	name: 'play',
	description: 'Play a song in your channel!',
	usage: '#play [link or query (song name)] **_also_** #play [playlist] [playlist name]',
	guildOnly: true,
	cooldown: 3,
	async execute(message) {
		try {
			
			const args = message.content.split(' ');
			const queue = message.client.queue;
			const serverQueue = message.client.queue.get(message.guild.id);
			const voiceChannel = message.member.voice.channel;
			const queryData = await fs.readFileSync(cacheLocation);
			const playlistCache = await JSON.parse(queryData);


			if (!voiceChannel) {
				return message.channel.send('You need to be in a voice channel to play music!');
			}
			
			const permissions = voiceChannel.permissionsFor(message.client.user);
			if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
				return message.channel.send('I need the permissions to join and speak in your voice channel!');
			}

			if (!args[1]) {
				return message.reply('Please enter an argument for the play command!');
			}

			// check for the playlist command
			const playlistSongs = [];
			let chosenPlaylist;
			if (args[1] === 'playlist') {
				const playlistsLocation = '../MonkeeMusic/music_data/playlists.json';
				const data = await fs.readFileSync(playlistsLocation);
				const playlists = await JSON.parse(data);
				if (!args[2]) {
					return message.reply('Please specify which playlist you would like to add!');
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
				console.log(`someone tried to get the playlist: "${playlistSongs}"`);
			}
			// Hell begins...
			let song = 0;
			let firstLetter = null;
			let currentQuery = args.slice(1, args.length + 1).join([' ']); 
			if (currentQuery.length) {
				firstLetter = currentQuery[0].toUpperCase();
				if (playlistCache[`${firstLetter}`]) {
					for (previousQuery of playlistCache[`${firstLetter}`]) {
						if (stringSimilarity.compareTwoStrings(previousQuery.query, currentQuery) >= 0.70) {
							console.log(chalk.green(`MATCHING QUERY FOUND! for ${chalk.yellow(currentQuery)}`));
							song = {
								title: previousQuery.title,
								url: previousQuery.url
							};
							playlistCache[`${firstLetter}`].push(song);
							break;
						}
					}
				} else {
					playlistCache[`${firstLetter}`] = [];
				}
				if (!song) {
					let videoId = args[1];
					if (!playlistSongs.length) {
						if (!videoId.startsWith('https://')) {
							if (args.length > 2) {
								currentQuery = args.slice(1, args.length + 1).join([' ']); 
							} else {
								currentQuery = args[1];
							}
							console.log(`${chalk.yellow(`${message.author.username}`)} tried to query "${chalk.cyan(currentQuery)}"`);
							
							const results = await ytsr(currentQuery, {limit: 1, pages: 1});
							if (!results.items.length) {
								return message.reply('Sorry, I could not find a result matching that query! :worried:');
							}
							videoId = results.items[0].id;
							let itemsIndex = 1;
							while (!videoId) {
								videoId = results.items[itemsIndex].id;
								itemsIndex++;
							}
						}
					}
					const songInfo = await ytdl.getInfo(videoId);
					song = {
						query: currentQuery,
						title: songInfo.videoDetails.title,
						url: songInfo.videoDetails.video_url
					};
					playlistCache[`${firstLetter}`].push(song);
					const data = await JSON.stringify(playlistCache, null, 2);
					await fs.writeFile(cacheLocation, data, (err) => {
					    if (err) throw err;
					    console.log(`
${chalk.magenta('NEW QUERY ADDED!')}
QUERY: ${chalk.cyan(`${currentQuery}`)}
					    `);
					});
				}
			} else {
				const songInfo = await ytdl.getInfo(videoId);
				song = {
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
					queueConstruct.songs.push(song);
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
				if (serverQueue.songs.length >= queueLimit) {
					return message.reply(`You have reached the maximum number of songs to have in queue (**${queueLimit}**) :worried:`);
				}
				if (!playlistSongs.length) {
					serverQueue.songs.push(song);
					return message.channel.send(`**${song.title}** has been added to the queue! :monkey_face: :thumbup:`);
				} else {
					serverQueue.songs = serverQueue.songs.concat(playlistSongs);
					return message.channel.send(`The **${args[2]}** playlist has been added to the queue! :monkey_face: :thumbup:`);
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