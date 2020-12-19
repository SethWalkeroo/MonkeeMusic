module.exports = {
	name: 'loop',
	description: 'Loop the current song.',
	usage: '[loop [number of loops (infinite if not set)]',
	guildOnly: true,
	cooldown: 2,
	async execute(message, args) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!serverQueue) return await message.channel.send('There is nothing playing.');
		if (args[0]) {
			const amount = parseInt(args[0]);
			if (isNaN(amount)) {
				return await message.channel.send('Please enter a valid number of loops.');
			} else if (amount <= 0) {
				return await message.channel.send('Please enter a value greater than 0.');
			} else {
				serverQueue.numberOfLoops = amount;
				return await message.channel.send(`**${serverQueue.songs[0].title}** will now loop **${amount}** time(s)! :monkey_face: :thumbup:`)
			}
		}
		let looping = serverQueue.loop;
		const isSilent = message.client.config.silent;
		if (!looping) {
			serverQueue.loop = true;
			if (!isSilent) {
				await message.channel.send(`**${serverQueue.songs[0].title}** is now on loop! Send the loop command again to cancel. :monkey_face:`);
			} else {
				await message.react('➿');
			}

		} else {
			serverQueue.loop = false;
			if (!isSilent) {
				await message.channel.send(`**${serverQueue.songs[0].title}** is now off loop! :monkey_face: :thumbup:`);
			} else {
				await message.react('🛑')
			}
		}
	},
};