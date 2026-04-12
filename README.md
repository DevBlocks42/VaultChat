# VaultChat

**VaultChat** est une application web de messagerie sécurisée en cours de développement, conçue selon une architecture **chiffrée de bout en bout (E2EE)** et **zero-knowledge côté serveur (aucun accès au contenu des messages)**, assurant une **forward secrecy** limitée aux sessions de login.

---

# Objectif du projet

L’objectif de VaultChat est de permettre des échanges de messages privés où :

- le serveur ne peut pas lire le contenu des messages
- seuls les utilisateurs possèdent les clés de chiffrement
- la confidentialité est assurée même en cas de compromission du serveur
- résistance limitée à certains scénarios de compromission du client, dépendant du stockage local des clés et de leur chiffrement

---

# Principes techniques

Le projet repose sur une conception cryptographique moderne :

- Une paire de clef **Ed25519 (Edwards-curve Digital Signature Algorithm)** long-terme pour l’authentification des utilisateurs (signature d’identité)
- Une paire de clef **X25519 ECDH (Elliptic-curve Diffie–Hellman)** éphémère générée à chaque login pour l'établissement de secrets partagés entre utilisateurs actifs durant une session de login.
- Chiffrement authentifié **AEAD (Authenticated Encryption with Associated Data)** pour les messages
- Dérivation de clés via **HKDF (HMAC-based Key Derivation Function)** à partir du secret partagé ECDH.
- Stockage des clés privées côté client uniquement (IndexedDB) 

Note : Une session correspond à une période d’authentification active (login) durant laquelle une paire X25519 éphémère est utilisée.

---

# Principes théoriques
## Définitions
On donne :
$$\begin{aligned}&(U_A, U_B)\in \mathrm{User}\times\mathrm{User}\\&SK_A, SK_B:\ \mathrm{X25519\ Private}\\&PK_A, PK_B:\ \mathrm{X25519\ Public}\\&Chat_{\mathrm{AB}}:\ \text{Discussion entre }U_A\text{ et }U_B\end{aligned}$$
---
## Établissement d'un secret ECDH
Pour $U_A$ on a :
$$S_{AB}=\mathrm{ECDH}(SK_A,PK_B)$$
Pour $U_B$ on a :
$$S_{BA}=\mathrm{ECDH}(SK_B,PK_A)$$
---
### Propriété
$$S_{AB}=S_{BA}=S_{\mathrm{SHARED}}$$
Donc
$$S_{\mathrm{SHARED}}\in\{0,1\}^{256}\quad\text{(sortie binaire sur 256 bits)}$$
---
## Dérivation de la clé de discussion
$$K^{AB}_{\mathrm{CHAT}}=\mathrm{HKDF}\bigl(S_{\mathrm{SHARED}},\; \text{salt}=0,\; \text{info}=\text{"chat\_AEAD"}\bigr)$$
Note : le salt n'est pas nécessaire car l'input est déjà de haute entropie.
---
## Chiffrement d'un message
Soit :
- $M$ : message en clair  - $N$ : nonce de chiffrement unique  - $AAD$ : données authentifiées associées
Alors :
$$C=\mathrm{AEAD}\bigl(K^{AB}_{\mathrm{CHAT}},\;M,\;N,\;AAD\bigr)$$
## Transfert du message au serveur
```textMSG = {  chat\_id,  sender\_id,  ciphertext: C,  nonce: N,  aad: AAD}``


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

# Modèle conceptuel des données

![Modèle Conceptuel des données de l'application](MCD_VaultChat.jpg)

<small>Conçu avec looping https://www.looping-mcd.fr/</small>