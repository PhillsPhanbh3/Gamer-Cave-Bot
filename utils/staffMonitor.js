const fs = require('fs');
const path = require('path');
const { generateStaffEmbed } = require('./staffEmbed');
const messagePath = path.join(__dirname, '../data/staffMessage.json');

const staffRoleId = '1334687755241787423';
const staffChannelId = '1305711589231562803';

function loadMessageData() {
    try {
        if (!fs.existsSync(messagePath)) fs.writeFileSync(messagePath, JSON.stringify([], null, 2));
        const raw = fs.readFileSync(messagePath, 'utf8');
        return raw.trim() ? JSON.parse(raw) : [];
    } catch (error) {
        LogError(error, 'Load Staff Message Data');
        console.error('Failed to load staffMessage.json, resetting...', error);
        fs.writeFileSync(messagePath, JSON.stringify([], null, 2));
        return [];
    }
}

function saveMessageData(data) {
    fs.writeFileSync(messagePath, JSON.stringify(data, null, 2));
}

/**
 * Updates the staff embed
 * @param {Client} client 
 * @param {boolean} forced - true if triggered by force command
 */
async function updateStaffEmbed(client, forced = false) {
    try {
        const guild = client.guilds.cache.first();
        if (!guild) return;

        await guild.members.fetch(); // Ensure members are cached

        const staffRole = guild.roles.cache.get(staffRoleId);
        const staffChannel = guild.channels.cache.get(staffChannelId);
        if (!staffRole || !staffChannel) return;

        const staffMembers = Array.from(staffRole.members.values());
        const embed = generateStaffEmbed(staffMembers);

        const data = loadMessageData();
        let record = data.find(r => r.guildId === guild.id && r.channelId === staffChannel.id);

        if (record?.messageId) {
            const msg = await staffChannel.messages.fetch(record.messageId).catch(() => null);
            if (msg) {
                await msg.edit({ embeds: [embed] });
                return;
            }
        }

        // If no valid message, send a new one
        const msg = await staffChannel.send({ embeds: [embed] });
        if (record) {
            record.messageId = msg.id;
        } else {
            data.push({
                guildId: guild.id,
                channelId: staffChannel.id,
                messageId: msg.id
            });
        }
        saveMessageData(data);

    } catch (error) {
        LogError(error, client);
        console.error('❌ Error updating staff embed:', error);
    }
}

function startStaffMonitor(client) {
    updateStaffEmbed(client); // run immediately on boot
    setInterval(() => updateStaffEmbed(client), 30_000); // run every 30 seconds
}

module.exports = { startStaffMonitor, updateStaffEmbed };
