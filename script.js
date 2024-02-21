require("dotenv").config();
const {
  Client,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
} = require("discord.js");

const { SlashCommandBuilder } = require("@discordjs/builders");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function run(param) {
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const result = await model.generateContent(param);
  const response = await result.response;
  const text = response.text();
  return text;
}

const commands = [
  {
    name: "muras",
    description: "Te ajudo, irmão!",
    options: [
      {
        name: "input",
        description: "Sua Pergunta",
        type: 3,
        required: true,
      },
    ],
  },
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

try {
  console.log("Started refreshing application (/) commands.");

  rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
    body: commands,
  });

  console.log("Successfully reloaded application (/) commands.");
} catch (error) {
  console.error(error);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName("muras")
    .setDescription("Eu te ajudo, irmão!")
    .addStringOption((option) =>
      option.setName("input").setDescription("Sua pergunta").setRequired(true)
    ),
};
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "muras") {
    const reason = interaction.options.getString("input");
    interaction.reply("Me da um segundo, to pensando na resposta...");
    let resposta = "";
    try {
      resposta = await run(reason);
      if (resposta.length > 2000) {
        resposta = resposta.substring(0, 1999);
      }
    } catch {
      resposta =
        "Nem tudo eu posso te falar né irmão. Pergunta outra coisa ai!";
    }

    interaction.followUp(resposta);
  }
});

client.login(process.env.TOKEN);
