module.exports = {
	name: 'inspire',
	description: 'Inspire yourself.',
	usage: '[inspire',
	guildOnly: true,
	cooldown: 3,
	async execute(message) {
        const responses = [
            '“Anyone who has ever made anything of importance was disciplined.” — Andrew Hendrixson',
            '“Don’t spend time beating on a wall, hoping to transform it into a door.” — Coco Chanel',
            '“Creativity is intelligence having fun.” — Albert Einstein',
            '“Optimism is the one quality more associated with success and happiness than any other.” — Brian Tracy',
            '“Always keep your eyes open. Keep watching. Because whatever you see can inspire you.” — Grace Coddington',
            '“What you get by achieving your goals is not as important as what you become by achieving your goals.” — Henry David Thoreau',
            '“If the plan doesn’t work, change the plan, but never the goal.” — Author Unknown',
            '“I destroy my enemies when I make them my friends.” — Abraham Lincoln',
            '“Don’t live the same year 75 times and call it a life.” — Robin Sharma',
            '“You cannot save people, you can just love them.” — Anaïs Nin',
            '“It wasn’t raining when Noah built the ark.” — Howard Ruff',
            '“Take your dreams seriously.” — Author Unknown',
            '“There is no way to happiness. Happiness is the way.” — Thich Nhat Hanh',
            '“Holding onto anger is like drinking poison and expecting the other person to die.”',
            '“Champions keep playing until they get it right.” — Billie Jean King',
            '“You will succeed because most people are lazy.” — Shahir Zag',
            '“Genius is 1% inspiration, 99% perspiration.” — Thomas Edison',
            '“A comfort zone is a beautiful place, but nothing ever grows there.” — Author Unknown',
            '“You must be the change you wish to see in the world.” — Mahatma Gandhi',
            ' “Numbing the pain for a while will only make it worse when you finally feel it.” — Albus Dumbledore',
            '“Do it with passion, or not at all.” — Rosa Nouchette Carey',
            '“If you want to live a happy life, tie it to a goal, not to people or objects.” — Albert Einstein',
            '“The grass is greener where you water it.” — Neil Barringham',
            '“Never give up on a dream just because of the time it will take to accomplish it. The time will pass anyway.” — Earl Nightingale',
            '“Instead of wondering when your next vacation is, maybe you should set up a life you don’t need to escape from.” — Seth Godin',
            '“If it scares you, it might be a good thing to try.” — Seth Godin',
            '“Sometimes you win, sometimes you learn.” — John Maxwell',
            '“Never apologize for having high standards. People who really want to be in your life will rise up to meet them.” — Ziad K. Abdelnour',
            '“I never dream of success. I worked for it.” — Estee Lauder',
            '“Avoiding failure is to avoid progress.” — Author Unknown'
        ]
        const choice = Math.floor(Math.random() * responses.length);  
        return message.channel.send(`_${responses[choice]}_`);
	},
};