const { EmbedBuilder } = require('discord.js');

const EMOTES = {
    online: '<:online:1408141985952305262>',
    idle: '<:IDLE:1408142017854177603>',
    dnd: '<:DND:1408142045406695535>',
    offline: '<:Offline:1408142171076563074>',
    // These emotes are emotes added to the bot on discord developer portal
};

/**
 * Generates a staff embed showing online status categories
 * @param {Array<GuildMember>} staffMembers - Array of staff members
 * @returns {EmbedBuilder}
 */
function generateStaffEmbed(staffMembers) {
    const categories = {
        online: [],
        idle: [],
        dnd: [],
        offline: [],
    };

    staffMembers.forEach(member => {
        const presenceStatus = member.presence?.status || 'offline';
        const mention = `<@${member.id}>`;

        switch (presenceStatus) {
            case 'online':
                categories.online.push(mention);
                break;
            case 'idle':
                categories.idle.push(mention);
                break;
            case 'dnd':
                categories.dnd.push(mention);
                break;
            default:
                categories.offline.push(member.user?.tag || member.id);
                break;
        }
    });

    // Sort members alphabetically in each category
    for (const key in categories) {
        categories[key].sort((a, b) => a.localeCompare(b));
    }

    const timestamp = Math.floor(Date.now() / 1000); // Discord timestamp in seconds

    const embed = new EmbedBuilder()
        .setTitle('👥 Staff Availability')
        .setColor(0x00AE86)
        .addFields(
            { name: `${EMOTES.online} Online`, value: categories.online.join('\n') || 'None', inline: true },
            { name: `${EMOTES.idle} Idle`, value: categories.idle.join('\n') || 'None', inline: true },
            { name: `${EMOTES.dnd} Do Not Disturb`, value: categories.dnd.join('\n') || 'None', inline: true },
            { name: `${EMOTES.offline} Offline`, value: categories.offline.join('\n') || 'None', inline: true },
            { name: 'Total Staff', value: `${staffMembers.length}`, inline: true },
            { name: 'Last Updated', value: `<t:${timestamp}:F>`, inline: true } // Discord timestamp
        )
        .setTimestamp();

    return embed;
}

module.exports = { generateStaffEmbed };