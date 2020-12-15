const fs = require('fs')
const Discord = require('discord.js');
const Client = require('./client/Client');
const { prefix, token } = require('./config.json');

const client = new Client();
client.commands = new Discord.Collection();

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

console.log(client.commands);

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
	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();
	const command = client.commands.get(commandName);

	if (message.author.bot) return;
	if (!message.content.startsWith(prefix)) return;

	try {
		if (commandsWithArgs.includes(commandName)) {
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