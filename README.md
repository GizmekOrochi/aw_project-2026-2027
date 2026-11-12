# AW_Project-2026-2027

Les ptits idées de conception:

On veut mettre, un menu pour aller sur les autres pages, Une page pour le défi du jour, une page pour le classement du jour, un bouton pour se connecter avec Discord.

Page d'accueil
C'est la première page qu'on voit quand on arrive sur le site. Il y a une explication / un teasing du defi du jour.

Page du défi du jour
Sur cette page, on pourra, voir le titre du défi, lire les consignes du défi, voir la date du défi.
Déclarer si on a réussi ou non quand on est connecté.
Indiquer combien de temps on a passé sur le défi.
Page de connexion
Pour se connecter, on utilisera Discord.
On ne veut pas créer de système avec des mots de passe.
Quand une personne se connecte, on pourra savoir qui elle est grâce à son compte Discord.
Page de classement
On veut afficher les participants avec leurs scores.

On pourra regarder :
Le classement du jour.
Le classement de la semaine.
Le classement général.
On pourra aussi cliquer sur un participant pour voir ses défis réalisés, ses résultats et sa dernière modification.
Page pour modifier ses résultats

Quand on est connecté, on pourra :
Ajouter son résultat pour un défi.
Dire si on a réussi ou non.
Indiquer son temps.
Corriger un résultat si on s'est trompé.
Chaque personne pourra modifier seulement ses propres résultats.
Page admin
Il faudra aussi une page pour les admin.

L'admin pourra :
Ajouter et publier le défi du jour.
Modifier les résultats des participants.
Déconnecter un utilisateur.
Voir les classements.


Le bot Discord:

On veut aussi créer un bot Discord pour utiliser le projet sans forcément aller sur le site.
Pour commencer, on veut faire ces commandes :

/tri-defi : voir le défi du jour.
/tri-classement : voir le classement.
/tri-resultat : envoyer ou modifier son résultat.

Le tri sera remplacé par notre trigramme de groupe.
Le bot et le site utiliseront les mêmes données pour avoir les mêmes résultats partout.


Technos:

React: pour faire les pages du site.
Vite: pour lancer notre projet React.
Node.js: pour faire fonctionner le serveur.
Express: pour créer notre API.
Discord API: pour la connexion avec Discord.
discord.js: pour créer notre bot.
Spreadsheet: pour enregistrer les données du projet.
SQLite: pour enregistrer les sessions des utilisateurs.
CSS: pour faire le design du site.


Partie client:

client/pages/ : les différentes pages du site.
client/components/ : les éléments qu'on utilise plusieurs fois, comme les boutons, les cartes et le menu.
client/services/ : les fichiers qui permettent de communiquer avec le serveur.


Partie serveur:

server/routes/ : les chemins de notre API.
server/controllers/ : les fichiers qui reçoivent les demandes du site et renvoient les réponses.
server/services/ : les règles de fonctionnement du projet.
server/repositories/ : les fichiers pour lire et modifier les données.
server/middleware/ : les fichiers qui vérifient si une personne est connectée et si elle a le droit de faire une action.
server/bot/ : les commandes du bot Discord.
server/db/ : la configuration de SQLite pour les sessions.
server/utils/ : les petites fonctions utiles à plusieurs endroits, comme les calculs et les dates.

Le fonctionnement sera assez simple.
Un administrateur publie le défi du jour.
Les étudiants peuvent voir le défi sur le site ou Discord.
Un étudiant essaie de résoudre le défi.
Il se connecte avec Discord pour enregistrer son résultat.
Il indique son temps et s'il a réussi.
Le serveur enregistre le résultat.
Le classement se met à jour en fonction des résultats.
Le calcul du score sera fait avec les règles données par le professeur.
Ptit regle de securité et de dois

3 role: visiteur, utilisateur, admin
visiteur = pas loged
utilisateur = pas loged
admin = role de chef 

Action                      Visiteur        Participant          Admin

Voir défi / classement        Oui               Oui               Oui 
Voir le profil public         Oui               Oui               Oui 
Déclarer sa résolution        Non               Oui               Oui 
Modifier autrui               Non               Non               Oui 
Publier un défi               Non               Non               Oui 
Révoquer des sessions         Non               Non               Oui 


Ce qu'on doit encore récupérer

Le professeur doit encore nous donner certaines informations :
Le spreadsheet de départ.
Les informations pour le serveur Discord de test.
Les règles pour calculer les scores et départager les égalités.
Les scénarios à présenter pendant la soutenance.


Dans quel ordre on va travailler

On pense avancer petit à petit.

Étape 1 : faire les maquettes et réfléchir aux données qu'on doit enregistrer.
Étape 2 : créer le site React, la connexion Discord et le classement.
Étape 3 : développer le bot Discord et ses commandes.
Étape 4 : créer la partie administrateur, vérifier la sécurité et tester le projet.

UML de totalement moi
```text
codearena/
│
├── client/                                  # Site web React
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx                     # Page d'accueil
│   │   │   ├── Challenge.jsx                # Défi du jour
│   │   │   ├── Leaderboard.jsx              # Classement
│   │   │   ├── Profile.jsx                  # Profil d'un participant
│   │   │   ├── MyResolutions.jsx            # Modifier ses résultats
│   │   │   └── Admin.jsx                    # Page administrateur
│   │   │
│   │   ├── components/                      # Menu, boutons, cartes...
│   │   ├── services/                        # Appels à l'API Express
│   │   ├── App.jsx                          # Navigation entre les pages
│   │   └── main.jsx                         # Démarrage React
│   │
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                                  # Serveur Node.js / Express
│   ├── src/
│   │   ├── routes/                          # Routes de l'API
│   │   ├── controllers/                     # Gestion des requêtes
│   │   ├── services/
│   │   │   ├── challengeService.js
│   │   │   ├── resolutionService.js
│   │   │   ├── rankingService.js
│   │   │   └── sessionService.js
│   │   │
│   │   ├── repositories/
│   │   │   └── spreadsheetRepository.js
│   │   │
│   │   ├── middleware/                      # Connexion et permissions
│   │   ├── db/                              # Sessions SQLite
│   │   ├── app.js                           # Configuration Express
│   │   └── index.js                         # Démarrage du serveur
│   │
│   └── package.json
│
├── bot/                                    # Bot Discord
│   ├── src/
│   │   ├── commands/
│   │   │   ├── defi.js                     # /tri-defi
│   │   │   ├── classement.js               # /tri-classement
│   │   │   └── resultat.js                 # /tri-resultat
│   │   │
│   │   └── index.js                        # Démarrage du bot
│   │
│   └── package.json
│
├── package.json                            # Configuration générale
├── .env.example                            # Variables d'environnement
├── .gitignore
└── README.md                               # Présentation du projet
```