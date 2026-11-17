import dotenv from 'dotenv';
dotenv.config();


const url = `https://discord.com/api/v10/applications/${process.env.APP_ID}/guilds/${process.env.GUILD_ID}/commands`;

const command = [{
    "name": "blep", "type": 1, "description": "Send a random adorable animal photo", "options":
        [
            {
                "name": "animal", "description": "The type of animal", "type": 3, "required": true, "choices":
                    [
                        { "name": "Dog", "value": "Good boy Puppy" }, { "name": "Cat", "value": "Kitten" },
                        {
                            "name": "Penguin", "value": "Birdy"
                        }, {
                            "name": "Owen", "value": "Owen pioupioupiou"
                        }
                        , {
                            "name": "Nicolas", "value": "Nicolas bark bark"
                        }
                        , {
                            "name": "Zoe", "value": "Zoe bipbipbip"
                        },
                        {
                            "name": "Mathis", "value": "Mathis miaou"
                        }
                    ]
                }
            ]
        },
        {
            name: "abc-defi-énoncé",
            type: 1,
            description: "Affiche un exercice de programmation Java"
        }
    


];
export async function registerCommands() {
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
    }); if (response.ok) {
        console.log('Commande /blep enregistrée !');
    }
    else {
        console.error('Erreur Discord :', await response.json());
    }


}