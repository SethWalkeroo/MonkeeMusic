const fs = require('fs');
const chalk = require('chalk');
const Discord = require('discord.js');
const Client = require('./client/Client');
const config = require('./config.json');
const token = config.token;

const client = new Client();
client.commands = new Discord.Collection();
client.config = config;
const cooldowns = new Discord.Collection();
const musicCommandFiles = fs.readdirSync('./music_commands').filter(file => file.endsWith('.js'));

for (const file of musicCommandFiles) {
	const command = require(`./music_commands/${file}`);
	client.commands.set(command.name, command);
}

const commandsWithArgs = [
	'clean',
	'volume',
	'playlists',
	'bitrate',
	'loop',
	'save',
	'duration',
	'skipto',
	'move',
	'prefix',
	'remove',
	'lyrics',
	'def',
	'syn',
	'ant'
];

client.once('ready', async () => {
	const prefix = config.prefix;
	client.user.setActivity(`${prefix}help for commands`, { type: 'WATCHING' });
	console.log(chalk.green('Connected to Discord!'));
	let serverCount = 0;
	client.guilds.cache.forEach(guild => {
		serverCount++;
	});
	console.log(chalk.green(`Connected to ${chalk.cyan(serverCount)} different servers!`));
});

client.on("guildCreate", (guild) => {

	// function to generate server specific config file and playlist file if they dont already exist.
	generateServerFiles(guild);

	console.log(`
${chalk.magenta('JOINED NEW SERVER!')}
GUILD-NAME: ${chalk.yellow(`${guild.name}`)}
GUILD-ID: ${chalk.green(`${guild.id}`)}
	`);
});

client.once('reconnecting', () => {
  console.log('Reconnecting!');
});

client.once('disconnect', () => {
  console.log('Disconnect!');
});


client.on('message', async (message) => {
	
	generateServerFiles(message.guild);

	const rawData = fs.readFileSync(`./server_configs/${message.guild.id}.json`);
	const customConfig = JSON.parse(rawData);
	client.config = customConfig;
	const prefix = customConfig.prefix;

	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();
	const command = client.commands.get(commandName);

	if (message.author.bot) return;
	if (!message.content.startsWith(prefix)) return;

	if (!command) {
		return await message.reply('Sorry, that was an invalid command.');
	}

	if (command.guildOnly && message.channel.type === 'dm') {
		return await message.reply('I can\'t execute that command inside DMs!');
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
				return await message.reply('You did not specify any arguments!');
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

client.on('voiceStateUpdate', (oldState, newState) => {
  // if nobody left the channel in question, return.
  if (oldState.channelID !==  oldState.guild.me.voice.channelID || newState.channel)
    return;

  // otherwise, check how many people are in the channel now
  if (!oldState.channel.members.size - 1) 
    setTimeout(() => { // if 1 (you), wait five minutes
      if (!oldState.channel.members.size - 1) // if there's still 1 member, 
         oldState.channel.leave(); // leave
     }, 6000000); // (60 minutes)
});

client.on('error', (error) => {
	console.log(error);
});

function generateServerFiles(guild) {

	const playlistFileExists = fs.existsSync(`./music_data/${guild.id}.json`);
	if (!playlistFileExists) {
		const playlistFiles = fs.readdirSync('./music_data').filter(file => file.endsWith('.json'));
		let localPlaylistLocation = `./music_data/${guild.id}.json`;
		if (!playlistFiles.includes(`${guild.id}.json`)) {
			fs.writeFileSync(localPlaylistLocation, '{}');
		}
	}

	const configFileExists = fs.existsSync(`./server_configs/${guild.id}.json`);
	if (!configFileExists) {
		const configFiles = fs.readdirSync('./server_configs').filter(file => file.endsWith('.json'));
		let localConfigLocation = `./server_configs/${guild.id}.json`;
		if (!configFiles.includes(`${guild.id}.json`)) {
			delete config.token;
			delete config.playlistLocation;
			fs.writeFileSync(localConfigLocation, JSON.stringify(config, null, 2));
		}
	}
}


client.login(token);