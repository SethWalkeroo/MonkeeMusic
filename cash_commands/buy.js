module.exports = {
	name: 'buy',
	description: 'Spend those hard earned bananas!.',
	async execute(message, currency, CurrencyShop, Op, Users, args) {
		const item = await CurrencyShop.findOne({ where: { name: { [Op.like]: args[0] } } });
		if (!item) return message.channel.send('That item doesn\'t exist.');
		if (item.cost > currency.getBalance(message.author.id)) {
			return message.channel.send(`You don't have enough currency, ${message.author}`);
		}

		const user = await Users.findOne({ where: { user_id: message.author.id } });
		currency.add(message.author.id, -item.cost);
		await user.addItem(item);

		message.channel.send(`You've bought a ${item.name}`);
	},
};