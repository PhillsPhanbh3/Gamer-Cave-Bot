const { ActivityType, Events } = require('discord.js');
const mongoose = require('mongoose');
const mongoURL = process.env.mongoURL;
const { startStaffMonitor } = require('../utils/staffMonitor'); // adjust path if needed
const { LogError } = require('../utils/LogError');

const statuses = [
    { name: 'with server members', type: ActivityType.Playing },
    { name: 'for NSFW content', type: ActivityType.Watching },
    { name: "to the PhillsPhanbh3's gamer cave", type: ActivityType.Streaming, url: 'https://www.twitch.tv/phillsphanbh3' }
];

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        try {
            console.log(`[Bot] Logged in as ${client.user.tag}!`);

            // Start the staff embed monitor
            startStaffMonitor(client);

            // Rotate statuses every 30 seconds (no console logs)
            let i = 0;
            setInterval(() => {
                const status = statuses[i];
                client.user.setActivity(status.name, { type: status.type, url: status.url || undefined });
                i = (i + 1) % statuses.length;
            }, 30_000);

        } catch (error) {
            console.error('Error during bot ready event:', error);
            LogError(error, client, 'Ready Event');
        }
    }
};
