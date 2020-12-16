const fs = require('fs');
const chalk = require('chalk');
const config = require('../config.json');
const ytsr = require('ytsr');
const ytdl = require('ytdl-core');
const playlistLimit = 25;
const songLimit = 250;
const supportDiscord = 'https://discord.gg/z7uq2rh7bQ';


module.exports = {
	name: 'playlists',
	description: 'Create a new playlist or add to an existing one.',
	usage: '#playlists [command]',
	guildOnly: true,
	cooldown: 2,
	async execute(message, args) {
		const playlistsLocation = `../MonkeeMusic/music_data/${message.guild.id}.json`;
		let rawData = await fs.readFileSync(playlistsLocation);
		let playlists = await JSON.parse(rawData);
		const command = args[0];
		switch (command) {
			case 'create':
				playlists_create(message, playlists, playlistsLocation, args);
				break;
			case 'add':
				playlists_add(message, playlists, playlistsLocation, args);
				break;
			case 'show':
				playlists_show(message, playlists, playlistsLocation, args);
				break;
			case 'remove':
				playlists_remove(message, playlists, playlistsLocation, args);
				break;
			case 'all':
				playlists_all(message, playlists, args);
				break;
			case 'delete':
				playlists_delete(message, playlists, playlistsLocation, args);
				break;
			default:
				message.reply('Invalid playlist command.');
		}
	},
};

async function playlists_add(message, playlists, playlistsLocation, args) {
	if (!args[1]) {
		message.reply('Please specify which playlist you want to add the song to.');
	} else {
		let videoId = args[2];
		if (!videoId) {
			return message.reply('Please make sure to specify a song to add to the playlist.');
		}

		let playlistName = null;
		for (playlist in playlists) {
			if (playlist === args[1]) {
				playlistName = args[1]
				break;
			}
		}
		if (!playlistName) {
			return message.reply('Sorry, that playlist doesn\'t seem to exist.');
		}

		if (playlists[`${playlistName}`].length >= songLimit) {
			return message.channel.send(
`You have reached the song limit of **${songLimit}** for the **${playlistName}** playlist!
 If you actually need more songs for your playlist, join the support discord **${supportDiscord}** for help.
 Or you can contact me via email at **sethrobertwalker@gmail.com**`
			);
		}

		// Gets url of first search result from a query if user does not provide a url.	
		if (!videoId.startsWith('https://')) {
			let query = [];
			if (args.length > 2) {
				query = args.slice(2, args.length + 1).join([' ']); 
			} else {
				query = args[2];
			}
			console.log(query);
			const results = await ytsr(query, {limit: 1, pages: 1});
			if (!results.items.length) {
				return message.reply('Sorry, I could not find a result matching that query! :worried:');
			}
			videoId = await results.items[0].id;
			let itemsIndex = 1;
			while (!videoId) {
				videoId = results.items[itemsIndex].id;
				itemsIndex++;
			}
		}

		// Grabs information about the video provided in the url.
		const songInfo = await ytdl.getInfo(videoId);
		const songPosition = playlists[`${playlistName}`].length + 1;
		const song = {
			title: songInfo.videoDetails.title,
			url: songInfo.videoDetails.video_url,
			position: songPosition
		};
		playlists[`${playlistName}`].push(song);
		let data = JSON.stringify(playlists, null, 2);
		await fs.writeFile(playlistsLocation, data, (err) => {
		    if (err) throw err;
		    message.reply(`**${song.title}** has been added to the ${playlistName} playlist!`);
		});
	}
}

async function playlists_create(message, playlists, playlistsLocation, args) {
	let count = 0;
	for (playlist in playlists) {
		count += 1;
	}
	if (count >= playlistLimit) {
		return message.channel.send(
`This server has reached the playlist limit of **${playlistLimit}**
 If you actually need more playlists join the support discord **${supportDiscord}** for help.
 You can also contact me via email at **sethrobertwalker@gmail.com**`
		);
	}

	if (!args[1]) {
		message.reply('Please provide a name when creating a playlist!');
	} else if (args.length > 2) {
		message.reply('Please provide a playlist name that does not contain spaces.');
	} else {
		playlistName = args[1];
		for (playlist in playlists) {
			if (playlist == playlistName) {
				return message.reply('That playlist already exists! Try a different name or delete the old playlist.');
			}
		}
		playlists[`${playlistName}`] = [];
		console.log(`
${chalk.magenta('PLAYLIST CREATED!')}
NAME: ${chalk.yellow(`${playlistName}`)}
SERVER: ${chalk.green(`${message.guild.name}`)}
LOCATION: ${chalk.green(`${playlistsLocation}`)}
		`);
		let data = JSON.stringify(playlists, null, 2);
		await fs.writeFile(playlistsLocation, data, (err) => {
		    if (err) throw err;
		    message.reply(`Playlist "**${playlistName}**" has been successfully created!`);
		});
	}
}

function playlists_show(message, playlists, playlistsLocation, args) {
	const playlistName = args[1];
	const songs = playlists[`${playlistName}`];
	if (!songs) {
		return message.reply('That playlist does not exist.');
	}
	let results = '';
	let count = 1;
	for (song of songs) {
		results += `**${count}:**  ${song.title}\n`;
		count++;
	}
	message.channel.send(results);
}

async function playlists_remove(message, playlists, playlistsLocation, args) {
	const playlistName = args[1];
	const songPosition = parseInt(args[2] - 1);
	let songs = playlists[`${playlistName}`];
	if (!songs) {
		return message.reply('That playlist does not exist!');
	}
	delete playlists[`${playlistName}`][songPosition];
	for (song of playlists[`${playlistName}`]) {
		if (song) {
			if (song.position > songPosition) {
				song.position--;
			}
		}
	}
	cleanedPlaylist = [];
	for (song of playlists[`${playlistName}`]) {
		if (song) {
			cleanedPlaylist.push(song);
		}
	}
	playlists[`${playlistName}`] = cleanedPlaylist;
	songs = JSON.stringify(playlists, null, 2);
	await fs.writeFile(playlistsLocation, songs, (err) => {
		if (err) throw err;
		message.reply(`Song at position **${songPosition + 1}** has been removed from the **${playlistName}** playlist! :thumbup:`);
	});
}

function playlists_all(message, playlists, args) {
	if (JSON.stringify(playlists) === '{}') {
		return message.reply('There are currently no playlists created for this server.');
	}
	let count = 1;
	let result = '';
	for (playlist in playlists) {
		result += `**${count}:** ${playlist}\n`;
		count++;
	}
	message.channel.send(result);
}

async function playlists_delete(message, playlists, playlistsLocation, args) {
	const playlistName = args[1];
	for (playlist in playlists) {
		if (playlist === playlistName) {
			delete playlists[playlistName];
			break;
		}
	}
	playlists = JSON.stringify(playlists, null, 2);
	await fs.writeFile(playlistsLocation, playlists, (err) => {
		if (err) throw err;
		message.channel.send(`The ${playlistName} playlist has been deleted! :thumbup:`);
	});
}

