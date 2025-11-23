const { Client, PermissionsBitField, Events } = require("discord.js");
const { LogError } = require("./utils/LogError.js");
const { blacklist } = require("./Schemas/blacklistuser.js");
const { connectToDb } = require("./utils/mongoconnect.js");
const client = new Client({ intents: ["Guilds", "GuildMembers", "GuildMessages", "GuildPresences", "DirectMessages"] });
client.config = require("./config.json");
client.cooldowns = new Map();
client.cache = new Map();

(async () => {
  try {
    await connectToDb();
    await Promise.all([require("./utils/ComponentLoader.js")(client), require("./utils/EventLoader.js")(client), require("./utils/RegisterCommands.js")(client)]);
    console.log(`Logging in...`);
    await client.login(client.config.TOKEN);
  } catch (error) {
    console.error("There was an error starting bot", error);
  }
})();

client.on("clientReady", function () {
  console.log(`Logged in as ${client.user.tag}!`);

  require("./utils/CheckIntents.js")(client);
});

client.on("messageCreate", () => {});

async function InteractionHandler(interaction, type) {
  const component = client[type].get(interaction.customId ?? interaction.commandName);
  if (!component) return;

  //ADD DEV IDS HERE
  const devs = ["1163939796767473698", "794228666518339604"];

  //command checking -> execution
  if (type === "commands") {
    try {
      if (component.devCommand && !devs.includes(interaction.user.id))
        return await interaction.reply({
          content: `Only **DEVELOPERS** can use this command`,
          flags: 64,
        });

      const data = await blacklist.findOne({ User: interaction.user.id });

      console.log(data);
      if (data) {
        return await interaction.reply({
          content: `⚠️ You have been **BLACKLISTED** from using this bot!\nTo appeal, join the support server linked in my bio.`,
          flags: 64,
        });
      }
    } catch (error) {
      console.error("Error checking blacklist:", error);
    }
  }
  try {
    console.log(`[INTERACTION] ${interaction.user.tag} in ${interaction.guild ? interaction.guild.name : "DMs"} triggered ${type} ${interaction.customId ?? interaction.commandName}`);
    //command properties
    if (component.admin) {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: `⚠️ Only administrators can use this command!`, flags: 64 });
    }

    if (component.owner) {
      if (interaction.user.id !== "1163939796767473698") return await interaction.reply({ content: `⚠️ Only bot owners can use this command!`, flags: 64 });
    }

    await component.execute(interaction, client);
  } catch (error) {
    console.error(error);
    // If there is already a response, say after a deferReply(), we override the response with an error message.
    await interaction.deferReply({ flags: 64 }).catch(() => {});
    await interaction
      .editReply({
        content: `There was an error while executing this command!`,
        embeds: [],
        components: [],
        files: [],
      })
      .catch(() => {});
    LogError(error, client, `${type} ${interaction.customId ?? interaction.commandName}`);
  }
}

client.on("interactionCreate", async function (interaction) {
  if (!interaction.isChatInputCommand()) return;
  await InteractionHandler(interaction, "commands");
});

client.on("interactionCreate", async function (interaction) {
  if (!interaction.isButton()) return;
  await InteractionHandler(interaction, "buttons");
});

client.on("interactionCreate", async function (interaction) {
  if (!interaction.isStringSelectMenu()) return;
  await InteractionHandler(interaction, "dropdowns");
});

client.on("interactionCreate", async function (interaction) {
  if (!interaction.isModalSubmit()) return;
  await InteractionHandler(interaction, "modals");
});