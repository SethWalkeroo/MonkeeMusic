const fs = require('fs');

module.exports = {
	name: 'prefix',
	description: 'Change the command prefix for the bot.',
	usage: '[prefix',
	guildOnly: true,
	cooldown: 10,
	async execute(message, args) {
        if (!args[0]) {
            return message.channel.send('Please provide a new prefix to change to!');
        }
        const newPrefix = args[0];
        const configLocation = `./server_configs/${message.guild.id}.json`
        let rawData = fs.readFileSync(configLocation);
        let customConfig = JSON.parse(rawData);
        customConfig.prefix = newPrefix;
        const newConfig = JSON.stringify(customConfig);
        fs.writeFile(configLocation, newConfig, (err) => {
		    if (err) throw err;
		    message.channel.send(`Command prefix has been changed to **${newPrefix}**`);
		});
	},
};