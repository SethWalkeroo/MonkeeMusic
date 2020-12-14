module.exports = {
	name: 'leaderboard',
	description: 'Compare your bananas with everyone else on the server.',
	execute(message, currency, client) {
		message.reply('Sorry, the leaderboard is currently broken. Try again later.');
		// return message.channel.send(
		// 	currency.sort((a, b) => b.balance - a.balance)
		// 		.filter(user => client.users.cache.has(user.user_id))
		// 		.first(10)
		// 		.map((user, position) => `(${position + 1}) ${(client.users.cache.get(user.user_id).tag)}: ${user.balance} :banana:`)
		// 		.join('\n'),
		// 	{ code: true }
		// );
	},
};