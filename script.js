require("dotenv").config();

const express = require("express");
var cors = require("cors");
const PORT = 4040;

const app = express();
app.use(express.json());
app.use(cors());
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
    const resposta = await run(reason);

    interaction.reply(resposta);
  }
});

client.login(process.env.TOKEN);

app.listen(PORT, function (err) {
  if (err) console.log(err);
  console.log("Server listening on PORT ", PORT);
});
