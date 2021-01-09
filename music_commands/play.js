const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
const ytpl = require('ytpl');
const fs = require('fs');
const chalk = require('chalk');
const convert = require('convert-seconds');
const Discord = require('discord.js');
const queueLimit = 250;

module.exports = {
	name: 'play',
	description: 'Play a song in your channel!',
	usage: '[play [link or query (song name)] **_also_** #play [playlist] [playlist name]',
	guildOnly: true,
	cooldown: 2,
	async execute(message) {
		try {
			
			const args = message.content.split(' ');
			const queue = message.client.queue;
			const serverQueue = message.client.queue.get(message.guild.id);
			const voiceChannel = message.member.voice.channel;
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

				if (!args[2]) return message.channel.send('Please specify which playlist you would like to add!');

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
			} else if (args[1] === 'ytplaylist') {
				if (!args[2]) return message.channel.send('Please enter the youtube playlist url or id!');
					const url = args[2];
					if (ytpl.validateID(url)) {
						const playlistInfo = await ytpl(url);
						for (playlistSong of playlistInfo.items) {
							constructPlaylistSong = {
								title: playlistSong.title,
								channel: playlistSong.author.name,
								thumbnail: playlistSong.thumbnails[0].url,
								url: playlistSong.url,
								duration: playlistSong.durationSec,
								isLivestream: playlistSong.isLive
							}
							playlistSongs.push(constructPlaylistSong);
						}
					} else {
						message.channel.send('Sorry, it seems like you entered an invalid playlist url!')
					}
			}
			const song = await this.getSong(message, args, playlistSongs);
			await this.checkQueue(message, args, config, song, voiceChannel, queue, queueLimit, serverQueue, playlistSongs);
		} catch (error) {
			console.log(error);
			return message.channel.send(error.message);
		}
	},

	async play(message, song) {
		const queue = message.client.queue;
		const serverQueue = queue.get(message.guild.id);

		if (!song) return;
		const queueBitrate = serverQueue.bitrate;
		let ID = null;
		try {
			ID = ytdl.getVideoID(song.url);
		} catch (error) {
			console.log(error)
			return message.channel.send('Sorry, something went wrong! :worried: Please try again.')
		}

	
		const dispatcher = serverQueue.connection
			.play(ytdl(ID, {quality: 'highestaudio', highWaterMark: 1<<25}), {bitrate: queueBitrate, highWaterMark: 1})
			.on('finish', () => {
				if (!serverQueue.loop && serverQueue.numberOfLoops <= 0) {
					serverQueue.songs.shift();
				}
				if (serverQueue.numberOfLoops > 0) {
					serverQueue.numberOfLoops--;
				}
				this.play(message, serverQueue.songs[0]);
			}).on('error', error => console.error(error));

		await dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
		if (!serverQueue.loop) {
			if (!message.client.config.silent) {
				let songDuration = song.duration;
				if (song.isLivestream) {
					songDuration = '∞'
				} else {
					songDuration = convert(parseInt(song.duration));
				}
				const songEmbed = new Discord.MessageEmbed()
				.setColor('#FF0000')
				.setTitle('Now Playing')
				.setURL(song.url)
				.setThumbnail(song.thumbnail)
				if (songDuration === '∞') {
					songEmbed.addFields(
						{ name: 'Song Title', value: song.title},
						{ name: 'Channel', value: song.channel, inline: true },
						{ name: 'Song Duration', value: `${songDuration}`, inline: true},
					);
				} else {
					songEmbed.addFields(
						{ name: 'Song Title', value: song.title},
						{ name: 'Channel', value: song.channel, inline: true },
						{ name: 'Song Duration', value: `${songDuration.hours}:${songDuration.minutes}:${songDuration.seconds}`, inline: true},
					);
				}
				message.channel.send(songEmbed);
			} else {
				message.react('🎵');
			}
		}
	},

	async getSong(message, args, playlistSongs) {
		let videoId = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstleyVEVO&ab'
		if (!playlistSongs.length) {
			currentQuery = args.slice(1, args.length + 1).join([' ']);
			if (!currentQuery.startsWith('http')) {
				console.log(`${chalk.yellow(`${message.author.username}`)} tried to query "${chalk.cyan(currentQuery)}"`);
				const results = await ytsr(currentQuery, {limit: 1, pages: 1});
				try {	
					videoId = results.items[0].id;
				} catch {
					console.log('no results found for query.')
				}
			} else {
				videoId = args[1]
			}
		}
		songInfo = await ytdl.getInfo(videoId);
		song = {
			title: songInfo.videoDetails.title,
			channel: songInfo.videoDetails.author.name,
			thumbnail: songInfo.videoDetails.thumbnails[0].url,
			url: songInfo.videoDetails.video_url,
			duration: songInfo.videoDetails.lengthSeconds,
			isLivestream: songInfo.videoDetails.isLive
		};
		return song
	},

	async checkQueue(message, args, config, song, voiceChannel, queue, queueLimit, serverQueue, playlistSongs) {
		if (!song && !playlistSongs.length) {
			return message.channel.send('An invalid song or playlist was entered! Please try again.');
		}
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
				if (song) {
					queueConstruct.songs.push(song);
				}
			} else {
				queueConstruct.songs = queueConstruct.songs.concat(playlistSongs);
			}

			try {
				let connection = await voiceChannel.join();
				queueConstruct.connection = connection;
				this.play(message, queueConstruct.songs[0]);
			} catch (err) {
				console.log(err);
				queue.delete(message.guild.id);
				return await message.channel.send(err);
			}
		} else {
			if (!serverQueue.songs[0]) {
				if (song) {
					serverQueue.songs.push(song);
					this.play(message, serverQueue.songs[0]);
				}
			} else if (serverQueue.songs.length >= queueLimit) {
				await message.channel.send(`You have reached the maximum number of songs to have in queue (**${queueLimit}**) :worried:`);
			} else if (!playlistSongs.length) {
				if (song) {
					serverQueue.songs.push(song);
				}
				if (!message.client.config.silent) {
					await message.channel.send(`**${song.title}** has been added to the queue! :monkey_face:`);
				} else {
					message.react('➕');
				}

			} else {
				serverQueue.songs = serverQueue.songs.concat(playlistSongs);
				if (!message.client.config.silent) {
					await message.channel.send(`The **${args[2]}** playlist has been added to the queue! :monkey_face:`);
				} else {
					await message.react('➕');
				}

			}

		}
	}
};



