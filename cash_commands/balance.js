module.exports = {
	name: 'balance',
	description: 'View your balance of bananas on the server.',
	execute(message, currency, args) {
		const target = message.mentions.users.first() || message.author;
		return message.channel.send(`${target.tag} has ${currency.getBalance(target.id)} :banana:`);
	},
};