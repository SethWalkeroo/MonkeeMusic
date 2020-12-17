const fs = require('fs')
const Discord = require('discord.js')
const config = require('../config.json')

module.exports = {
	name: 'help',
	description: 'List all available music commands.',
	usage: '#help',
	guildOnly: true,
	cooldown: 2,
	execute(message) {
		let title1 = 'MonkeeMusic Commands!';
		let title2 = 'Playlist Commands!'
		const commandBoarder1 = '='.repeat(title1.length);
		const commandBoarder2 = '='.repeat(title2.length);
		let commands = `${commandBoarder1}\n**${title1}** :monkey_face:\n${commandBoarder1}\n`;
		const commandFiles = fs.readdirSync('./music_commands').filter(file => file.endsWith('.js'));

		let commandLengths = [];
		for (const file of commandFiles) {
			const command = require(`./${file}`);
			commandLengths.push(command.name.length);
		}
		const longestCommand = Math.max(...commandLengths);

		for (const file of commandFiles) {
			const command = require(`./${file}`);
			commands += `${command.name}${' '.repeat(longestCommand - command.name.length)}   **${command.usage}**   ${command.description}\n\n`;
		}

		commands += `${commandBoarder2}\n**${title2}** :monkey_face:\n${commandBoarder2}\n`;

		playlistCommands = [
			'create playlist',
		 	'delete playlist',
		  	'add song to playlist',
		   	'remove song from playlist',
		   	'show a certain playlist',
		   	'show all playlists'
		];

		playlistUsages = [
			'#playlists create [playlist name]',
			'#playlists delete [playlist name]',
			'#playlists add [playlist name] [link or query (song name)]',
			'#playlists remove [playlist name] [song position]',
			'#playlists show [playlist name]',
			'#playlists all'
		];

		playlistDescs = [
			'create a new playlist for the server. (max 25)',
			'delete a playlist from the server.',
			'add a song to a specified playlist.',
			'remove a song at a specific position from a specified playlist.',
			'show all of the songs in a specified playlist.',
			'show all of the playlists on the server.'
		];

		let playlistCommandLengths = [];
		for (playCommand of playlistCommands) {
			playlistCommandLengths.push(playCommand.length);
		}
		const longestPlaylistCommand = Math.max(...playlistCommandLengths);

		let commandsTwo = '';
		for (let i = 0; i < playlistCommands.length; i++) {
			commandsTwo += `${playlistCommands[i]}${' '.repeat(longestPlaylistCommand - playlistCommands[i].length)}    **${playlistUsages[i]}**    ${playlistDescs[i]}\n\n`;
		}

		message.channel.send(commands);
		message.channel.send(commandsTwo);

	},

};