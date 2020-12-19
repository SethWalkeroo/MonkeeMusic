const fs = require('fs');
const chalk = require('chalk');
const ytsr = require('ytsr');
const ytdl = require('ytdl-core');
const playlistLimit = 25;
const songLimit = 250;
const supportDiscord = 'https://discord.gg/z7uq2rh7bQ';


module.exports = {
	name: 'playlists',
	description: 'Create a new playlist or add to an existing one.',
	usage: '[playlists [command]',
	guildOnly: true,
	cooldown: 2,
	async execute(message, args) {
		const playlistsLocation = `../MonkeeMusic/music_data/${message.guild.id}.json`;
		let rawData = fs.readFileSync(playlistsLocation);
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
				playlists_show(message, playlists, args);
				break;
			case 'remove':
				playlists_remove(message, playlists, playlistsLocation, args);
				break;
			case 'all':
				playlists_all(message, playlists);
				break;
			case 'delete':
				playlists_delete(message, playlists, playlistsLocation, args);
				break;
			default:
				await message.channel.send('Invalid playlist command.');
		}
	},
};

async function playlists_add(message, playlists, playlistsLocation, args) {
	if (!args[1]) {
		await message.channel.send('Please specify which playlist you want to add the song to.');
	} else {
		let videoId = args[2];
		if (!videoId) {
			return await message.channel.send('Please make sure to specify a song to add to the playlist.');
		}

		let playlistName = null;
		for (playlist in playlists) {
			if (playlist === args[1]) {
				playlistName = args[1]
				break;
			}
		}
		if (!playlistName) {
			return await message.channel.send('Sorry, that playlist doesn\'t seem to exist.');
		}

		if (playlists[`${playlistName}`].length >= songLimit) {
			return await message.channel.send(
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
			console.log(chalk.red(`${message.author.username} tried to add ${query} to a playlist`));
			const results = await ytsr(query, {limit: 1, pages: 1});
			if (!results.items.length) {
				return await message.channel.send('Sorry, I could not find a result matching that query! :worried:');
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
			duration: songInfo.videoDetails.lengthSeconds,
			position: songPosition
		};
		playlists[`${playlistName}`].push(song);
		let data = JSON.stringify(playlists, null, 2);
		fs.writeFile(playlistsLocation, data, (err) => {
		    if (err) throw err;
		    message.channel.send(`**${song.title}** has been added to the ${playlistName} playlist!`);
		});
	}
}

async function playlists_create(message, playlists, playlistsLocation, args) {
	let count = 0;
	for (playlist in playlists) {
		count += 1;
	}
	if (count >= playlistLimit) {
		return await message.channel.send(
`This server has reached the playlist limit of **${playlistLimit}**
 If you actually need more playlists join the support discord **${supportDiscord}** for help.
 You can also contact me via email at **sethrobertwalker@gmail.com**`
		);
	}

	if (!args[1]) {
		await message.channel.send('Please provide a name when creating a playlist!');
	} else if (args.length > 2) {
		await message.channel.send('Please provide a playlist name that does not contain spaces.');
	} else {
		playlistName = args[1];
		for (playlist in playlists) {
			if (playlist == playlistName) {
				return await message.channel.send('That playlist already exists! Try a different name or delete the old playlist.');
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
		fs.writeFile(playlistsLocation, data, (err) => {
		    if (err) throw err;
		    message.channel.send(`Playlist "**${playlistName}**" has been successfully created!`);
		});
	}
}

async function playlists_show(message, playlists, args) {
	const playlistName = args[1];
	const songs = playlists[`${playlistName}`];
	if (!songs) {
		return await message.channel.send('That playlist does not exist.');
	}
	let results = '';
	let count = 1;
	for (song of songs) {
		results += `**${count}:**  ${song.title}\n`;
		count++;
	}
	await message.channel.send(results);
}

async function playlists_remove(message, playlists, playlistsLocation, args) {
	const playlistName = args[1];
	const songPosition = parseInt(args[2] - 1);
	let songs = playlists[`${playlistName}`];
	if (!songs) {
		return await message.channel.send('That playlist does not exist!');
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
		message.channel.send(`Song at position **${songPosition + 1}** has been removed from the **${playlistName}** playlist! :thumbup:`);
	});
}

async function playlists_all(message, playlists) {
	if (JSON.stringify(playlists) === '{}') {
		return await message.channel.send('There are currently no playlists created for this server.');
	}
	let count = 1;
	let result = '';
	for (playlist in playlists) {
		result += `**${count}:** ${playlist}\n`;
		count++;
	}
	await message.channel.send(result);
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
	fs.writeFile(playlistsLocation, playlists, (err) => {
		if (err) throw err;
		message.channel.send(`The **${playlistName}** playlist has been deleted! :thumbup:`);
	});
}

