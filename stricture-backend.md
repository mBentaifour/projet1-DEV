projet1-DEV/
├── backend/
│   ├── manage.py
│   ├── backend/        # Dossier de configuration du projet Django
│   ├── files/          # App pour la gestion des fichiers
│   └── users/          # App pour l’authentification
├── frontend/           # On y viendra après (React ou HTML simple)
├── README.md


backend/
├── manage.py
└── config/
    ├── __init__.py
    ├── settings.py
    ├── urls.py
    ├── wsgi.py
    └── asgi.py


A
A
A
A
A
A
A
A
A
A
A
A
A
A
A
B
B
B
B
B
B
B
B
B
B
B
B
B
B
B
B
B
B
A
A
A
A
A
A
A
A
A
A
A
A
A
A
A
A
A
A
A
A
A
A
A
A
A
A
B
B
B
B
B
B
B
B
B
A
A
A
A
A
A
A
A
A
A
A
A
B
B
B
B
B
B
B
B
B
B
B
B


# Depuis ton dossier projet
cd ~/projet1-DEV

# Créer un dossier pour le backend
mkdir backend
cd backend

# Créer un environnement virtuel
python3 -m venv env
source env/bin/activate

# Installer Django
pip install django djangorestframework

