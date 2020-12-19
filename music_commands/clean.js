module.exports = {
	name: 'clean',
	description: 'Clear text channel of unwanted messages.',
	usage: '[clean [number of messages]',
	guildOnly: true,
	cooldown: 3,
	async execute(message, args) {
		const amount = parseInt(args[0]) + 1;

		if (isNaN(amount)) {
			return await message.channel.send('That doesn\'t seem to be a valid number.');
		} else if (amount <= 1 || amount > 100) {
			return await message.channel.send('You need to input a number between 1 and 99.');
		}

		message.channel.bulkDelete(amount, true).catch(err => {
			console.error(err);
			message.channel.send('There was an error trying to clear messages in this channel!');
		});
	},
};