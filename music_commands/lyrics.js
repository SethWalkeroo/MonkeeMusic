const getLyrics = require("@allvaa/get-lyrics");
const Discord = require('discord.js');
const chalk = require('chalk');

module.exports = {
	name: 'lyrics',
	description: 'Fetch the lyrics for a specified song.',
	usage: '[lyrics [song name]',
	guildOnly: true,
	cooldown: 5,
	async execute(message, args) {
        if (!args.length) return message.channel.send('Please provide the name of the song you want lyrics for!');
        const lyricsEmbed = new Discord.MessageEmbed().setColor('#FF0000');
        const backupEmbed = new Discord.MessageEmbed().setColor('#FF0000');
        const query = args.slice(0, args.length).join([' ']);
        const lyrics = await getLyrics(query);
        try {
            let songLyrics = lyrics.lyrics;
            if (songLyrics.length > 2048) {
                const middle = Math.floor(songLyrics.length / 2);
                let songLyrics1 = songLyrics.substring(0, middle);
                let songLyrics2 = songLyrics.substring(middle, songLyrics.length + 1);
                lyricsEmbed.setTitle(lyrics.title);
                lyricsEmbed.setThumbnail(lyrics.image);
                lyricsEmbed.setDescription(songLyrics1);
                backupEmbed.setDescription(songLyrics2);
                await message.channel.send(lyricsEmbed);
                await message.channel.send(backupEmbed);
            } else {
                lyricsEmbed.setTitle(lyrics.title);
                lyricsEmbed.setDescription(songLyrics);
                lyricsEmbed.setThumbnail(lyrics.image);
                await message.channel.send(lyricsEmbed);
            }
        } catch (error) {
            await message.channel.send('There was an error fetching the lyrics for that song! :worried:\nTry searching something else.');
            console.log(chalk.red(`Failed getting lyrics for ${chalk.yellow(query)}`));
        }
	},
};