# 🎧 Application RAVE Audio - React Native + Flask

Cette application mobile permet d’enregistrer un clip audio, de le transformer via un modèle nommé RAVE exécuté sur un serveur Python Flask, puis d’écouter à la fois le son original et la version transformée.

---

## 🚀 Prérequis

### Côté mobile (React Native)

- Node.js
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Application **Expo Go** installée sur ton téléphone
- Téléphone connecté au même réseau que l’ordinateur serveur

### Côté serveur (Python/Flask)

- Python 3.10 recommandé
- [Miniconda](https://docs.conda.io/en/latest/miniconda.html) (optionnel mais conseillé)
- Fichiers `server.py` et `requirements.txt` fournis

---

## 📦 Installation de l’application mobile

```bash
git clone https://github.com/Nassjet/RAVE.git
cd RAVE
npm install
npx expo start
```

Scanne ensuite le QR code avec **Expo Go** sur ton téléphone.

---

## ⚙️ Lancer le serveur Flask

> ⚠️ Le téléphone **doit être sur le même réseau Wi-Fi** que l’ordinateur serveur.

### Avec Miniconda (recommandé)

```bash
cd RAVE-ONNX-Server
pip install -r requirements.txt
python server.py
```


## 📱 Fonctionnalités de l’application

### 🏠 Écran Home

- Permet de saisir l’IP et le port du serveur Flask
- Vérifie la connexion via un appel `GET /`

### 🎙️ Écran Record

- Demande l'accès au micro de l'utilisateur
- Enregistrement audio via le micro du téléphone
- Attribution d’un nom personnalisé à chaque clip
- Stockage local des fichiers (`expo-file-system`)

### 🌀 Écran RAVE

> Vue avec onglets (tabs) :

1. **Son par défaut**
2. **Mes enregistrements**
3. **Fichier local**

Dans l’onglet "Mes enregistrements" :
- Sélection d’un clip enregistré
- Sélection d’un modèle RAVE (`GET /getmodels`)
- Lancement de la transformation (`POST /upload` puis `GET /download`)
- Écoute de l’original et du son transformé

Indicateur de chargement (`ActivityIndicator`) durant le traitement.

---

## 🌐 API Flask utilisée

| Méthode | Route                       | Description                              |
|--------|-----------------------------|------------------------------------------|
| GET    | `/`                         | Vérifie que le serveur est joignable     |
| GET    | `/getmodels`                | Liste des modèles RAVE disponibles       |
| GET    | `/selectModel/<modelName>` | Sélection du modèle utilisé              |
| POST   | `/upload`                   | Envoi du fichier audio à transformer     |
| GET    | `/download`                 | Récupère le fichier audio transformé     |

---

## 📁 Arborescence rapide

```
📁 components/
│   └── TypeSounds.js           ← Sélection du modèle
📁 screens/
│   ├── HomeScreen.js           ← Connexion serveur
│   ├── RecordScreen.js         ← Enregistrement audio
│   └── RaveScreen.js           ← Transformation audio
📁 store/
│   └── redux.js                ← Stockage Redux (IP, clips, etc.)
📄 App.js
📄 README.md
```

---

## 👨‍💻 Auteur

Projet développé par **Nassim Belkacem** — 2025  
Dans le cadre d'un projet pédagogique React Native x Flask.

