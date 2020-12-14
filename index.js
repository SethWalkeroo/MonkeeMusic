const fs = require('fs')
const Discord = require('discord.js');
const Client = require('./client/Client');
const { prefix, token } = require('./config.json');
const {Users, CurrencyShop } = require('./dbObjects');
const { Op } = require('sequelize');

const currency = new Discord.Collection();
const client = new Client();
client.commands = new Discord.Collection();

const musicCommandFiles = fs.readdirSync('./music_commands').filter(file => file.endsWith('.js'));
const cashCommandFiles = fs.readdirSync('./cash_commands').filter(file => file.endsWith('.js'));

for (const file of musicCommandFiles) {
	const command = require(`./music_commands/${file}`);
	client.commands.set(command.name, command);
}

for (const file of cashCommandFiles) {
	const command = require(`./cash_commands/${file}`);
	client.commands.set(command.name, command);
}

const commandsWithArgs = [
	'clean',
	'volume',
];

const commandsForFinance = [
	'balance',
	'transfer',
	'leaderboard',
];

console.log(client.commands);


Reflect.defineProperty(currency, 'add', {
	value: async function add(id, amount) {
		const user = currency.get(id);
		if (user) {
			user.balance += Number(amount);
			return user.save();
		}
		const newUser = await Users.create({ user_id: id, balance: amount });
		currency.set(id, newUser);
		return newUser;
	},
});

Reflect.defineProperty(currency, 'getBalance', {
	value: function getBalance(id) {
		const user = currency.get(id);
		return user ? user.balance : 0;
	},
});


client.once('ready', async () => {
	console.log('Connected!');
  	const storedBalances = await Users.findAll();
	storedBalances.forEach(b => currency.set(b.user_id, b));
	console.log(`Logged in as ${client.user.tag}!`);
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
	currency.add(message.author.id, 1);

	if (!message.content.startsWith(prefix)) return;

	try {
		if (commandsWithArgs.includes(commandName)) {
			command.execute(message, args);
		} else if (commandsForFinance.includes(commandName)) {
			command.execute(message, currency, args);
		} else if (commandName === 'buy') {
			command.execute(message, currency, CurrencyShop, Op, Users, args);
		} else if (commandName === 'shop') {
			command.execute(message, CurrencyShop);
		} else if (commandName === 'inventory') {
			command.execute(message, currency, Users, args);
		} else if (commandName === 'leaderboard') {
			command.execute(message, currency, client);
		} else {
			command.execute(message);
		}
	} catch (error) {
		console.error(error);
		message.reply('There was an error trying to execute that command!');
	}
});


client.login(token);