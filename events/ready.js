const { ActivityType } = require('discord.js');
const mongoose = require('mongoose');
const mongoURL = process.env.mongoURL;

const statuses = [
    { name: 'with server members', type: ActivityType.Playing },
    { name: 'for NSFW content', type: ActivityType.Watching},
    { name: "to the PhillsPhanbh3's gamer cave", type: ActivityType.Streaming, url: 'https://www.twitch.tv/phillsphanbh3'}
];

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`${client.user.tag} is online!`);

        // Initial status
        let i = 0;
        client.user.setActivity({ name: statuses[i].name, type: statuses[i].type, url: statuses[i].url });

        // Rotate status every 10 seconds
        setInterval(() => {
            i = (i + 1) % statuses.length; // Loop through the statuses
            client.user.setActivity({ name: statuses[i].name, type: statuses[i].type, url: statuses[i].url });
        }, 10000); // 10 seconds
    },
};
