✨ Services Proposés (Fonctionnalités)
🔐 Authentification Sécurisée : Inscription et connexion des utilisateurs basées sur des tokens JWT (JSON Web Tokens) avec rafraîchissement automatique de la session.

📂 Gestion de Fichiers Personnels : Chaque utilisateur dispose d'un espace personnel. Il ne peut voir et interagir qu'avec les fichiers qu'il a lui-même téléversés.

📤 Téléversement de Fichiers : Interface simple pour envoyer des fichiers (PDF, images, etc.) vers le serveur.

🖼️ Affichage Dynamique :
/home/bentaifour/Images/Captures d’écran/Capture d’écran du 2025-08-14 13-53-45.png
Prévisualisation des images directement dans la liste.

Liens de téléchargement pour les autres types de fichiers.

Mise à jour instantanée de la liste après un ajout ou une suppression, sans rechargement de la page.

🗑️ Suppression de Fichiers : Possibilité de supprimer des fichiers avec une demande de confirmation.

🛠️ Stack Technique
Ce projet est séparé en deux parties principales : un backend et un frontend.

Backend
Framework : Django

API : Django REST Framework

Authentification : Simple JWT for DRF

Base de données : SQLite 3 (par défaut pour le développement)

Frontend
Framework : React (créé avec Create React App)

Appels API : Axios

Styling : CSS simple (via index.css)

🚀 Installation et Lancement
Pour lancer le projet en local, suivez ces étapes :

Prérequis
Python (version 3.8+ recommandée)

Node.js et npm (version 14.0+ recommandée)

1. Configuration du Backend
Bash

# 1. Naviguez vers le dossier du backend
cd backend

# 2. Créez et activez un environnement virtuel
python3 -m venv env
source env/bin/activate
# Sur Windows : env\Scripts\activate

# 3. Installez les dépendances Python
# (Si vous n'avez pas de fichier requirements.txt, créez-le avec : pip freeze > requirements.txt)
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers

# 4. Appliquez les migrations de la base de données
python manage.py migrate

# 5. Lancez le serveur Django (par défaut sur http://127.0.0.1:8000)
python manage.py runserver
2. Configuration du Frontend
Bash

# 1. Ouvrez un nouveau terminal et naviguez vers le dossier du frontend
cd frontend

# 2. Installez les dépendances Node.js
npm install

# 3. Créez un fichier .env à la racine de /frontend
#    et ajoutez la ligne suivante :
REACT_APP_API_URL=http://127.0.0.1:8000/api

# 4. Lancez le serveur de développement React (par défaut sur http://localhost:3000)
npm start
Votre application est maintenant accessible à l'adresse http://localhost:3000.

Un gestionnaire de fichiers simple (backend + frontend)

🚀 Objectif du projet Dev Web
📁 Projet : Mini File Manager Web
Un site web simple qui permet de :

S’inscrire / se connecter (authentification)

Envoyer, voir et supprimer des fichiers (PDF, images…)

Afficher les fichiers d’un utilisateur

(Optionnel) Générer une vignette pour les images

