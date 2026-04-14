import { generateECDSAKeyPair, exportECDSAPublicKey, exportECDSAPrivateKey, encryptECDSAPrivateKey } from "../core/encryption.js";
import { loadConfig } from "../core/utils.js";
import { saveBrowserPrivateKey, getBrowserPrivateKey, downloadEncryptedKeyFile } from "../core/storage.js";

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('register_form');
    const public_key_field = document.getElementById('id_signing_public_key');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const config = await loadConfig();

        const usernameVal = document.getElementById('id_username').value;
        const passwordVal = document.getElementById('id_password1').value;

        // Génération clef de signature ECDSA 
        const ecdsaKeyPair = await generateECDSAKeyPair(config);
        const exportedPublicKey = await exportECDSAPublicKey(ecdsaKeyPair.publicKey);
        const exportedPrivateKey = await exportECDSAPrivateKey(ecdsaKeyPair.privateKey);
        public_key_field.value = exportedPublicKey;

        // Chiffrement clef privée ECDSA
        const encryptedECDSAPrivateKey = await encryptECDSAPrivateKey(exportedPrivateKey, passwordVal, config);
        
        // Stockage IndexedDB clef privée ECDSA 
        downloadEncryptedKeyFile(usernameVal, encryptedECDSAPrivateKey); 
        const storage = await saveBrowserPrivateKey(config, usernameVal, encryptedECDSAPrivateKey); 
        
        form.submit();
        

    });
});