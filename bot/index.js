import dotenv from 'dotenv'
dotenv.config()



import { Client, GatewayIntentBits } from 'discord.js';
import express from "express";
import { registerCommands } from './command.js';
const client = new Client({
    intents: [
        //fait par mathis : yèlughè_iyught-oghèji
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent, // Indispensable pour lire le contenu des messages
    ],
});

client.on("ready", async () => {
    console.log(`Connecté en tant que ${client.user.tag} !`);
    // Enregistrer les commandes dès que le bot est prêt
    await registerCommands();
});

client.on("messageCreate", async (message) => {
    console.log(`Message reçu de ${message.author.tag} : ${message.content}`);
});

client.on("interactionCreate", async (interaction) => {
    // Vérifier si c'est bien une commande slash
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'blep') {
        const animal = interaction.options.getString('animal');

        // Répondre à l'utilisateur pour éviter l'erreur "L'application ne répond pas"
        await interaction.reply(`Voici votre animal choisi : **${animal}** ! 🐾`);
    }
     if (interaction.commandName === "abc-defi-énoncé") {
            await interaction.reply(
                "Écris un programme en Java qui génère un nombre aléatoire entre 1 et 100 et demande à l'utilisateur de le deviner avec Scanner, en utilisant une boucle while et des conditions if/else pour afficher « Trop petit », « Trop grand » ou « Bravo, tu as trouvé ! », tout en comptant le nombre de tentatives."
            );
        }

})

const app = express();

app.get("/discord-call-back", (req, res) => {

    res.send("balbalb");


})

app.listen(8080, () => {
    client.login(process.env.DISCORD_TOKEN);
    console.log("demarer serv");
})

