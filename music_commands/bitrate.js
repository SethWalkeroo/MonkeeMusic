const fs = require('fs');

module.exports = {
	name: 'bitrate',
	description: 'Adjust the bot\'s bitrate.',
	usage: '[bitrate [value]',
	guildOnly: true,
	cooldown: 2,
	async execute(message, args) {
		let config = message.client.config;
		const configLocation = `../MonkeeMusic/server_configs/${message.guild.id}.json`;
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!message.member.voice.channel) return await message.channel.send('You have to be in a voice channel to change the bot\'s bitrate!');
		if (!args[0]) return await message.channel.send('Please specify a value for the bitrate!')

		const amount = parseInt(args[0]);
		if (isNaN(amount)) {
			return await message.channel.send('Please enter a valid bitrate amount.');
		} else if (amount <= 0 || amount > 128) {
			return await message.channel.send('Please enter a value between 0 and 128 kps.');
		}
		if (serverQueue) {
			serverQueue.bitrate = amount;
		}
		config.bitrate = amount;

		const data = JSON.stringify(config, null, 2);
		fs.writeFile(configLocation, data, (err) => {
			if (err) throw err;
			if (!message.client.config.silent) {
				message.channel.send(`The bot's bitrate is now set to **${amount} kps**! :monkey_face: :thumbup:`);
			} else {
				message.react('👍');
			}

		});
		
	},
};