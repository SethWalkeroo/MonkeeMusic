const fs = require('fs');

module.exports = {
	name: 'silence',
	description: 'Toggle the bot to only use reactions instead of sending messages. (error messages are not silenced)',
	usage: '[silence',
	guildOnly: true,
	cooldown: 3,
	async execute(message) {
        let config = message.client.config;
        if (config.silent) {
            config.silent = false;
            message.channel.send(':monkey_face: :loudspeaker: _The bot has been unsilenced!_ ')
        } else {
            message.react('🤫');
            config.silent = true;
        }
        const configLocation = `./server_configs/${message.guild.id}.json`
        const updatedConfig = JSON.stringify(config, null, 2);
        fs.writeFile(configLocation, updatedConfig, (err) => {
		    if (err) throw err;
		});

	},
};