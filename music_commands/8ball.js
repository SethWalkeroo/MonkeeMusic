module.exports = {
	name: '8ball',
	description: 'Magic eight ball stuff.',
	usage: '[8ball (message)',
	guildOnly: true,
	cooldown: 3,
	async execute(message, args) {
        if (!args.length) {
            return message.channel.send('Please ask the 8ball a question!');
        }
        const responses = [
            'Yes',
            'No',
            'Maybe',
            'For sure',
            'Of course',
            'It isn\'t possible',
            'Likely',
            'Probably',
            'Absolutely',
            'Absolutely not',
            'Maybe someday',
            'Possibly',
            'Hell no',
            'No response',
            'Unsure, try again',
            'Try again...'
        ]
        const choice = Math.floor(Math.random() * responses.length);  
        return message.channel.send(`**${responses[choice]}**`);
	},
};