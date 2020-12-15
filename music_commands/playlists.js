const fs = require('fs');
const config = require('../config.json');
const ytsr = require('ytsr');
const ytdl = require('ytdl-core');

const playlistsLocation = '../MonkeeMusic/music_data/playlists.json';
let data = fs.readFileSync(playlistsLocation);
let playlists = JSON.parse(data);

module.exports = {
	name: 'playlists',
	description: 'Create a new playlist or add to an existing one.',
	execute(message, args) {
		const command = args[0];
		switch (command) {
			case 'create':
				playlists_create(message, args);
				break;
			case 'add':
				playlists_add(message, args);
				break;
			case 'show':
				playlists_show(message, args);
				break;
			case 'remove':
				playlists_remove(message, args);
				break;
			case 'all':
				playlists_all(message, args);
				break;
			case 'delete':
				playlists_delete(message, args);
				break;
			default:
				message.reply('Invalid playlist command.');
		}
	},
};

async function playlists_add(message, args) {
	if (!args[1]) {
		message.reply('Please specify which playlist you want to add the song to.');
	} else {
		let playlistName = args[1];
		let videoId = args[2];
		if (!videoId) {
			return message.reply('Please make sure to specify a song to add to the playlist.');
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
			videoId = await results.items[0].id;
		}

		// Grabs information about the video provided in the url.
		const songInfo = await ytdl.getInfo(videoId);
		const songPosition = playlists[`${playlistName}`].length + 1;
		const song = {
			title: songInfo.videoDetails.title,
			url: songInfo.videoDetails.video_url,
			position: songPosition
		};
		await playlists[`${playlistName}`].push(song);
		let data = JSON.stringify(playlists, null, 2);
		fs.writeFile(playlistsLocation, data, (err) => {
		    if (err) throw err;
		    message.reply(`**${song.title}** has been added to the ${playlistName} playlist!`);
		});
	}
}

function playlists_create(message, args) {
	if (!args[1]) {
		message.reply('Please provide a name when creating a playlist!');
	} else if (args.length > 2) {
		message.reply('Please provide a playlist name that does not contain spaces.');
	} else {
		playlistName = args[1];
		playlists[`${playlistName}`] = [];
		let data = JSON.stringify(playlists, null, 2);
		fs.writeFile(playlistsLocation, data, (err) => {
		    if (err) throw err;
		    message.reply(`Playlist "**${playlistName}**" has been successfully created!`);
		});
	}
}

function playlists_show(message, args) {
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

function playlists_remove(message, args) {
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
	fs.writeFile(playlistsLocation, songs, (err) => {
		if (err) throw err;
		message.reply(`Song at position **${songPosition + 1}** has been removed from the **${playlistName}** playlist! :thumbup:`);
	});
}

function playlists_all(message, args) {;
	let data = fs.readFileSync(playlistsLocation);
	let playlists = JSON.parse(data);
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

function playlists_delete(message, args) {
	const playlistName = args[1];
	for (playlist in playlists) {
		if (playlist === playlistName) {
			delete playlists[playlistName];
			break;
		}
	}
	playlists = JSON.stringify(playlists, null, 2);
	fs.writeFile(playlistsLocation, playlists, (err) => {
		if (err) throw err;
		message.channel.send(`The ${playlistName} playlist has been deleted! :thumbup:`);
	});
}

