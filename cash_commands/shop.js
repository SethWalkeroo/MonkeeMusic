module.exports = {
	name: 'shop',
	description: 'Displays the shop for spending bananas.',
	async execute(message, CurrencyShop) {
		const items = await CurrencyShop.findAll();
		return message.channel.send(items.map(i => `${i.name}: ${i.cost} bananas`).join('\n'), { code: true });
	},
};