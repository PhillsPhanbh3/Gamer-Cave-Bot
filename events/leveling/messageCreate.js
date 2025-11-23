const { EmbedBuilder, ChannelType } = require('discord.js');
const GCBLevel = require('../../Schemas/gcb_leveling');
const { LogError } = require('../../utils/LogError');

const cooldowns = new Set();

// Level-up reward roles
const levelRoles = {
  1: '1297310194669453343',
  5: '1311083298994262036',
  7: '1297310202843889736',
  10: '1311083951934410932',
  15: '1311083639915806780',
  20: '1297310203259125810',
  30: '1394409823461838978',
  40: '1394409946908721254',
  50: '1394410194229792798',
  75: '1394413661732212776',
  100: '1394413741851934800',
  150: '1394413851944157269',
};

// XP boost roles (roleId: multiplier)
const xpBoostRoles = {
  '123456789012345678': 1.5, // Booster
  '987654321098765432': 2.0  // VIP
};

// Forum channel ID placeholder for logging
const forumChannelId = '1400571521465843863';

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (
      !message.author ||
      !message.guild ||
      message.author.bot ||
      cooldowns.has(message.author.id)
    ) return;

    cooldowns.add(message.author.id);
    setTimeout(() => cooldowns.delete(message.author.id), 5000);

    // Fetch member and calculate boost
    const member = await message.guild.members.fetch(message.author.id);
    let xpToAdd = Math.floor(Math.random() * 10) + 5;

    let boostMultiplier = 1;
    for (const [roleId, multiplier] of Object.entries(xpBoostRoles)) {
      if (member.roles.cache.has(roleId) && multiplier > boostMultiplier) {
        boostMultiplier = multiplier;
      }
    }

    xpToAdd = Math.floor(xpToAdd * boostMultiplier);

    // Get or create user data
    let userData = await GCBLevel.findOne({ userId: message.author.id });
    if (!userData) {
      userData = new GCBLevel({
        userId: message.author.id,
        xp: 0,
        level: 1
      });
    }

    userData.xp += xpToAdd;

    const nextLevelXp = userData.level * 500;

    if (userData.xp >= nextLevelXp) {
      userData.level++;
      userData.xp = 0;

      // Ping + embed
      await message.channel.send(`${message.author}, congratulations! You've leveled up to **Level ${userData.level}**! 🎉`);

      const levelUpEmbed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('Level Up!')
        .setDescription(`🎉 Congrats, ${message.author}! You reached **Level ${userData.level}**!`)
        .setTimestamp()
        .setFooter({ text: 'Keep chatting to level up!' });

      await message.channel.send({ embeds: [levelUpEmbed] });

      // Assign reward role
      const roleId = levelRoles[userData.level];
      if (roleId && message.guild.roles.cache.has(roleId)) {
        const role = message.guild.roles.cache.get(roleId);
        if (role && !member.roles.cache.has(roleId)) {
          await member.roles.add(role);
          await message.channel.send(`${message.author}, you have earned the **${role.name}** role! 🆙`);
        }
      }

      // Log in forum channel
      const forum = message.guild.channels.cache.get(forumChannelId);
      if (forum && forum.type === ChannelType.GuildForum) {
        try {
          await forum.threads.create({
            name: `Level Up - ${message.author.tag} → Lvl ${userData.level}`,
            message: {
              content: `${message.author} just reached **Level ${userData.level}**! 🎉`,
              embeds: [levelUpEmbed]
            },
            appliedTags: [] // You can add tag IDs here if needed
          });
        } catch (err) {
          console.error('❌ Failed to log level-up in forum:', err);
          LogError(error, client);
        }
      }
    }

    // Save to database
    try {
      await userData.save();
    } catch (err) {
      console.error('❌ Failed to save user data:', err);
      LogError(error, client);
    }
  },
};
