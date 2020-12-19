const fs = require('fs');

module.exports = {
	name: 'volume',
	description: 'Change the server wide volume of the bot on a scale of 0 to 10.',
	usage: '[volume [value between 0 and 10]',
	guildOnly: true,
	cooldown: 3,
	async execute(message, args) {
		const configLocation = `../MonkeeMusic/server_configs/${message.guild.id}.json`;
		const rawData = fs.readFileSync(configLocation);
		let config = JSON.parse(rawData);
		const serverQueue = message.client.queue.get(message.guild.id);

		if (!message.member.voice.channel) return await message.channel.send('You have to be in a voice channel to change the bot volume!');
		if (!serverQueue) return await message.channel.send('The bot needs to be playing in order to change the volume!');
		const amount = parseInt(args[0]);

		if (isNaN(amount)) {
			return await message.channel.send('That doesn\'t seem to be a valid number.');
		} else if (amount < 0 || amount > 10) {
			return await message.channel.send('You need to input a decimal value between 0 and 10.');
		}

		serverQueue.volume = amount;
		serverQueue.connection.dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
		config.volume = amount;

		const data = JSON.stringify(config, null, 2);
		fs.writeFile(configLocation, data, (err) => {
		    if (err) throw err;
		    message.channel.send(`The bot volume is now set to ${amount}! :monkey_face: :thumbup:`);
		});
	},
};