module.exports = {
	name: 'help',
	description: 'directs users to other help commands.',
	execute(message, currency, args) {
		message.reply('Use the "music-help" command for music commands\nUse the "money-help" command for currency commands.');
	},
};