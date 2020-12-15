const fs = require('fs')
const Discord = require('discord.js');
const Client = require('./client/Client');
const config = require('./config.json');
const prefix = config.prefix;
const token = config.token;

const client = new Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

const musicCommandFiles = fs.readdirSync('./music_commands').filter(file => file.endsWith('.js'));

for (const file of musicCommandFiles) {
	const command = require(`./music_commands/${file}`);
	client.commands.set(command.name, command);
}

const commandsWithArgs = [
	'clean',
	'volume',
	'playlists'
];


client.once('ready', async () => {
	console.log('Connected!');
});

client.once('reconnecting', () => {
  console.log('Reconnecting!');
});

client.once('disconnect', () => {
  console.log('Disconnect!');
});


client.on('message', async message => {
	const playlistFiles = fs.readdirSync('./music_data').filter(file => file.endsWith('.json'));
	let localPlaylistLocation = `./music_data/${message.guild.id}.json`;
	if (!playlistFiles.includes(`${message.guild.id}.json`)) {
		fs.writeFileSync(localPlaylistLocation, '{}');
	}


	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();
	const command = client.commands.get(commandName);


	if (message.author.bot) return;
	if (!message.content.startsWith(prefix)) return;

	if (!command) {
		return message.reply('Sorry, that was an invalid command.');
	}

	if (command.guildOnly && message.channel.type === 'dm') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}
	
	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
		if (commandsWithArgs.includes(commandName)) {
			if (!args) {
				return message.reply('You did not specify any arguments!');
			}
			command.execute(message, args);
		} else {
			command.execute(message);
		}
	} catch (error) {
		console.error(error);
		message.reply('There was an error trying to execute that command!');
	}
});


client.login(token);