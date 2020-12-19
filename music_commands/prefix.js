const fs = require('fs');

module.exports = {
	name: 'prefix',
	description: 'Change the command prefix for the bot.',
	usage: '[prefix',
	guildOnly: true,
	cooldown: 3,
	async execute(message, args) {
        const configLocation = `./server_configs/${message.guild.id}.json`
        const rawData = fs.readFileSync(configLocation);
        let customConfig = JSON.parse(rawData);
        if (!args[0]) {
            const prefix = customConfig.prefix;
            return message.channel.send(
                `Current prefix: **${prefix}**
                \nType **${prefix}prefix [new prefix]** to change the command prefix. :monkey_face:`
            );
        }
        const newPrefix = args[0];
        customConfig.prefix = newPrefix;
        const newConfig = JSON.stringify(customConfig, null, 2);
        fs.writeFile(configLocation, newConfig, (err) => {
		    if (err) throw err;
		    message.channel.send(`Command prefix has been changed to **${newPrefix}**`);
		});
	},
};