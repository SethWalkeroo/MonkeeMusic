
module.exports = {
	name: 'ping',
	description: 'Test your latency to the bot.',
	usage: `[ping`,
	guildOnly: true,
	cooldown: 3,
	execute(message) {
        message.channel.send(`**${Math.round(message.client.ws.ping)}**ms`);
	},
};