module.exports = {
	name: 'join',
	description: 'Allow the bot to join the voice channel.',
	usage: '#join',
	guildOnly: true,
	cooldown: 2,
	async execute(message) {
		const voiceChannel = message.member.voice.channel;
		if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel for the bot to join.');
		voiceChannel.join();
	},
};






