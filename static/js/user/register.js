import { generateECDHKeyPair, generateECDSAKeyPair, exportPublicKey, exportPrivateKey, encryptPrivateKey } from "../core/encryption.js";
import { loadConfig } from "../core/utils.js";
import { saveBrowserPrivateKey, downloadEncryptedKeyFile } from "../core/storage.js";

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('register_form');
    const public_key_field = document.getElementById('id_signing_public_key');
    const key_agreement_pk_field = document.getElementById("id_key_agreement_public_key");
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const config = await loadConfig();

        const usernameVal = document.getElementById('id_username').value;
        const passwordVal = document.getElementById('id_password1').value;
        const passphraseVal = document.getElementById('id_passphrase').value;

        // Génération clefs de signature ECDSA 
        const ecdsaKeyPair = await generateECDSAKeyPair(config);
        const exportedPublicKey = await exportPublicKey(ecdsaKeyPair.publicKey);
        const exportedPrivateKey = await exportPrivateKey(ecdsaKeyPair.privateKey);
        public_key_field.value = exportedPublicKey;

        // Génération clefs ECDH
       const ecdhKeyPair = await generateECDHKeyPair(config);
       const exportedECDHPublicKey = await exportPublicKey(ecdhKeyPair.publicKey);
       const exportedECDHPrivateKey = await exportPrivateKey(ecdhKeyPair.privateKey);
       key_agreement_pk_field.value = exportedECDHPublicKey;

        // Chiffrement clef privée ECDSA
        const encryptedECDSAPrivateKey = await encryptPrivateKey(exportedPrivateKey, passphraseVal, config);

        // Chiffrement clef privée ECDH
        const encryptedECDHPrivateKey = await encryptPrivateKey(exportedECDHPrivateKey, passphraseVal, config);
        
        if(passphraseVal.length >= config.passphrase.min_length && passphraseVal.length <= config.passphrase.max_length) {
            if(passphraseVal != passwordVal) {
                // Stockage IndexedDB clef privée ECDSA 
                downloadEncryptedKeyFile(usernameVal, encryptedECDSAPrivateKey, encryptedECDHPrivateKey); 
                const storageECDSA = await saveBrowserPrivateKey(config, usernameVal, encryptedECDSAPrivateKey, "ECDSA");
                const storageECDH = await saveBrowserPrivateKey(config, usernameVal, encryptedECDHPrivateKey, "ECDH"); 
                form.submit();
            } else {
                alert("Erreur, le mot de passe cryptographique doit être différent du mot de passe utilisateur.");
            }
        } else {
            alert("Erreur, la taille du mot de passe cryptographique doit être comprise entre " + config.passphrase.min_length + " et " + config.passphrase.max_length);
        }

    });
});