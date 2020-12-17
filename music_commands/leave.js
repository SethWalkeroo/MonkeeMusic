module.exports = {
	name: 'leave',
	description: 'Make the bot leave the voice channel.',
	usage: '#leave',
	guildOnly: true,
	cooldown: 2,
	async execute(message) {
		if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to stop the music.');
		await message.member.voice.channel.leave();
		message.channel.send('The bot has left the voice channel! :monkey_face: :thumbup:');
	},
};