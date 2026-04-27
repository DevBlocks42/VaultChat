# VaultChat

**VaultChat** est une application web de messagerie sécurisée en cours de développement, conçue selon une architecture **chiffrée de bout en bout (E2EE)**, **zero-knowledge côté serveur (aucun accès au contenu des messages)**, et assurant une **forward secrecy** par message.

---

# Objectif du projet

L’objectif de VaultChat est de permettre des échanges de messages privés où :

- le serveur ne peut pas lire le contenu des messages
- seuls les utilisateurs possèdent les clés de chiffrement
- la confidentialité est assurée même en cas de compromission du serveur
- résistance à certains scénarios de compromission du client, dépendant du stockage local des clés et de leur chiffrement

---

# Principes techniques

Le projet repose sur une conception cryptographique moderne :

- Une paire de clef **ECDSA (Elliptic Curve Digital Signature Algorithm )** long-terme pour l’authentification des utilisateurs (signature d’identité)
- Une paire de clef **X25519 ECDH (Elliptic-curve Diffie–Hellman)** permanente pour l'établissement de secrets partagés entre utilisateurs.
- Le serveur n'est qu'un relai de ciphertext, aucune clef privée n'est stockée côté serveur.
- Stockage des clés privées côté client uniquement (IndexedDB / Fichier de restauration) 

---

# Architecture globale

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


# Fonctionnalités développées 

- Inscription (Génération de clefs ECDSA + ECDH).
- Authentification (Django backend + signature de nonce via clef de signature).
- Création de discussion.
- Participation à une discussion + contrôles d'accès.
- Envoi de messages chiffrés non signés (AES-GCM).

---

# Fonctionnalités en attente

- Signature des messages chiffrés avant envoi.
- Déchiffrement des messages + vérification de la signature à la récéption.
- Pagination des messages (+ efficace pour les discussions verbeuses).
- Intégrer l'export des clefs permanentes dans un fichier chiffré, sur demande de l'utilisateur (déjà implémenté à l'inscription).


# Modèle conceptuel des données

![Modèle Conceptuel des données de l'application](MCD_VaultChat.jpg)

<small>Conçu avec looping https://www.looping-mcd.fr/</small>


# Flux de chiffrement d'un message 

Note : on n'aborde pas encore la signature des messages pour simplifier le problème.


```
A souhaite discuter avec B, C, D ... Z dans une discussion D; 

A ouvre la discussion D : 

	A reçoit la clef publique ECDH de B, C, D, ... Z :
		
		A écrit un message plaintext déstiné à B, C, D, .... Z : 

			ciphertexts = []

			Pour chaque destinataire :

				(ESK_A, EPK_A) = generateECDHKeyPair() // On génère une paire de clef ECDH éphémère

				S = ECDH(ESK_A, destinataire.PK) // Calcul du secret partagé

				salt = hash(EPK_A || destinataire.PK) 

				K = HKDF(S, salt, info="VaultChat_Message") // Dérivation de clef

				nonce = secure_random(16) // 16 bytes (128 bits)

				MSG(n) = AES-ENCRYPT(K, plaintext, nonce) // Chiffrement du message via AES-GCM.

				ciphertexts <- MSG(n)   

		ENVOIE DE ciphertexts AU SERVEUR
```


--- 

# Screens de l'existant 

![Enregistrement de nouveaux comptes](screens/register_0.png)

<small>Enregistrement de compte</small>

![Fichier de restauration](screens/register_restore_file.png)

<small>Aperçu du fichier de restauration crypté</small>

![Connexion](screens/login.png)

<small>Authentification (mot de passe + passphrase crypto)</small>

![Discussions](screens/chats-index.png)

<small>Index des discussions</small>

![Zone de discussion](screens/Chat_zone.png)

<small>Zone de discussion (en cours)</small>