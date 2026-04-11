# VaultChat

**VaultChat** est une application web de messagerie sécurisée en cours de développement, conçue selon une architecture **chiffrée de bout en bout (E2EE)**, **zero-knowledge côté serveur** et assurant une **confidentialité persistante** au niveau de la session.

---

## Objectif du projet

L’objectif de VaultChat est de permettre des échanges de messages privés où :

- le serveur ne peut pas lire le contenu des messages
- seuls les utilisateurs possèdent les clés de chiffrement
- la confidentialité est assurée même en cas de compromission du serveur
- la confidentialité est partiellement assurée en cas de compromission du client

---

## Principes techniques

Le projet repose sur une conception cryptographique moderne :

- **Ed25519 (Edwards-curve Digital Signature Algorithm)** immuable pour l’authentification des utilisateurs (signature d’identité)
- **X25519 ECDH (Elliptic-curve Diffie–Hellman)** dynamique pour l’établissement de secrets partagés, généré à l'authentification pour une confidentialité persistente partielle
- Chiffrement symétrique **AEAD (Authenticated Encryption with Associated Data)** pour les messages
- Dérivation de clés via **HKDF (HMAC-based Key Derivation Function)**
- Stockage des clés privées côté client uniquement (IndexedDB)

---

## Architecture globale

- **Backend (Django)** :
  - gestion des utilisateurs
  - gestion des chats et des messages chiffrés
  - stockage des clés publiques uniquement
  - aucune capacité de déchiffrement

- **Frontend (JavaScript)** :
  - génération et gestion des clés cryptographiques
  - chiffrement et déchiffrement des messages
  - stockage local sécurisé des secrets (IndexedDB ou Système de fichiers)

---

## Modèle de données

![Modèle Conceptuel des données de l'application](MCD_VaultChat.jpg)

<small>Conçu avec looping https://www.looping-mcd.fr/</small>