const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
const stringSimilarity = require('string-similarity');
const fs = require('fs');
const chalk = require('chalk');
const cacheLocation = '../MonkeeMusic/music_data/query_cache.json'
const queueLimit = 250;

module.exports = {
	name: 'play',
	description: 'Play a song in your channel!',
	usage: '#play [link or query (song name)] **_also_** #play [playlist] [playlist name]',
	guildOnly: true,
	cooldown: 2,
	async execute(message) {
		try {
			
			const args = message.content.split(' ');
			const queue = message.client.queue;
			const serverQueue = message.client.queue.get(message.guild.id);
			const voiceChannel = message.member.voice.channel;
			const queryData = fs.readFileSync(cacheLocation);
			const playlistCache = await JSON.parse(queryData);
			const configLocation = `../MonkeeMusic/server_configs/${message.guild.id}.json`;
			const rawData = fs.readFileSync(configLocation);
			let config = JSON.parse(rawData);


			if (!voiceChannel) {
				return message.channel.send('You need to be in a voice channel to play music!');
			}
			
			const permissions = voiceChannel.permissionsFor(message.client.user);
			if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
				return message.channel.send('I need the permissions to join and speak in your voice channel!');
			}

			if (!args[1]) {
				return message.channel.send('Please enter an argument for the play command!');
			}

			// check for the playlist command
			const playlistSongs = [];
			let chosenPlaylist = null;
			if (args[1] === 'playlist') {
				const playlistsLocation = `../MonkeeMusic/music_data/${message.guild.id}.json`;
				const data = fs.readFileSync(playlistsLocation);
				const playlists = await JSON.parse(data);
				if (!args[2]) {
					return message.channel.send('Please specify which playlist you would like to add!');
				}
				for (playlist in playlists) {
					if (args[2] === playlist) {
						chosenPlaylist = playlists[`${playlist}`];
						break;
					}
				}
				for (playlistSong of chosenPlaylist) {
					playlistSongs.push(playlistSong);
				}
				console.log(`${message.author.username} tried to get a playlsit.`);
			}
			
			const song = await this.getSong(message, args, playlistSongs, playlistCache);
			this.checkQueue(message, args, config, song, voiceChannel, queue, queueLimit, serverQueue, playlistSongs);
		} catch (error) {
			console.log(error);
			message.channel.send(error.message);
		}
	},

	async play(message, song) {
		const queue = message.client.queue;
		const guild = message.guild;
		const serverQueue = queue.get(message.guild.id);

		if (!song) {
			message.channel.send('There are no more songs left in the queue! :worried:');
			await serverQueue.voiceChannel.leave();
			queue.delete(guild.id);
			return;
		}
		const queueBitrate = serverQueue.bitrate;

		const dispatcher = serverQueue.connection
			.play(ytdl(song.url), {bitrate: queueBitrate})
			.on('finish', () => {
				if (!serverQueue.loop && serverQueue.numberOfLoops <= 0) {
					serverQueue.songs.shift();
				}
				if (serverQueue.numberOfLoops > 0) {
					serverQueue.numberOfLoops--;
				}
				this.play(message, serverQueue.songs[0]);
			})
			.on('error', error => console.error(error));

		dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
		if (!serverQueue.loop) {
			serverQueue.textChannel.send(`:monkey_face: :musical_note: Start playing: **${song.title}**`);
		}
	},

	async getSong(message, args, playlistSongs, playlistCache) {
		let song = 0;
			if (!playlistSongs.length) {
				let firstLetter = null;
				let currentQuery = args.slice(1, args.length + 1).join([' ']); 
				if (currentQuery.length) {
					firstLetter = currentQuery[0].toUpperCase();
					if (playlistCache[`${firstLetter}`]) {
						for (previousQuery of playlistCache[`${firstLetter}`]) {
							if (stringSimilarity.compareTwoStrings(previousQuery.query, currentQuery) >= 0.80) {
								console.log(chalk.green(`MATCHING QUERY FOUND! for ${chalk.yellow(currentQuery)}`));
								song = {
									title: previousQuery.title,
									url: previousQuery.url,
									duration: previousQuery.duration
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
									return message.channel.send('Sorry, I could not find a result matching that query! :worried:');
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
							url: songInfo.videoDetails.video_url,
							duration: songInfo.videoDetails.lengthSeconds
						};
						playlistCache[`${firstLetter}`].push(song);
						const data = JSON.stringify(playlistCache, null, 2);
						fs.writeFile(cacheLocation, data, (err) => {
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
						url: songInfo.videoDetails.video_url,
						duration: songInfo.videoDetails.lengthSeconds
					};
				}
			}
			return song;
	},

	async checkQueue(message, args, config, song, voiceChannel, queue, queueLimit, serverQueue, playlistSongs) {
		// Construct the serverQueue if it does not already exist. 
		if (!serverQueue) {
			const queueConstruct = {
				textChannel: message.channel,
				voiceChannel: voiceChannel,
				connection: null,
				songs: [],
				volume: config.volume,
				bitrate: config.bitrate,
				loop: false,
				numberOfLoops: 0,
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
				return message.channel.send(`You have reached the maximum number of songs to have in queue (**${queueLimit}**) :worried:`);
			}
			if (!playlistSongs.length) {
				serverQueue.songs.push(song);
				return message.channel.send(`**${song.title}** has been added to the queue! :monkey_face: :thumbup:`);
			} else {
				serverQueue.songs = serverQueue.songs.concat(playlistSongs);
				return message.channel.send(`The **${args[2]}** playlist has been added to the queue! :monkey_face: :thumbup:`);
			}

		}
	}
};



