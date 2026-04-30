import { fetchRecipientsIdentities, sendMessageCiphers, fetchMessageCiphers } from "../core/transport.js";
import { getBrowserPrivateKey } from "../core/storage.js";
import { computeSharedSecret, deriveSharedSecret, encryptMessageForRecipient, decryptCipherForRecipient, decryptECDHPrivateKey, importRecipientPublicKey, generateECDHKeyPair, exportPublicKey } from "../core/encryption.js";
import { loadConfig } from "../core/utils.js";

document.addEventListener('DOMContentLoaded', async () => {
    const config = await loadConfig();
    const params = new URLSearchParams(window.location.search);
    const chatId = params.get("id");
    const identities = await fetchRecipientsIdentities(chatId);
    const plaintextField = document.getElementById("id_message_field");
    const sendButton = document.getElementById("id_send_button");
    //vault worker
    const worker = new SharedWorker("/static/js/core/vault.js", {
        type: "module"
    });
    const port = worker.port;
    port.start();
    // MESSAGE RETRIEVE
    const ciphersToDecrypt = await fetchMessageCiphers(chatId);
    const cipherObjects = ciphersToDecrypt.ciphertexts;
    // Decryption worker
    port.postMessage({
        type: "DECRYPT",
        payload: {
            config,
            cipherObjects
        }
    });
    port.addEventListener('message', (event) => {  
        const { type, result, error } = event.data || {};  
        if (type === 'DECRYPT_RESULT') {    
            console.log('Résultat de décryptage :', result);      
        } else {
            console.log('Erreur :', error);   
        }
    });
    
     //
    sendButton.addEventListener('click', async (e) => {
        const plaintext = plaintextField.value;
        var payload = {
            chat: Number(chatId),
            ciphertexts: []
        };
        const ephemeralECDHPair = await generateECDHKeyPair(config);
        for(const identity of identities) {
            const recipientPublicKey = await importRecipientPublicKey(identity.key_agreement_public_key, config);
            const sharedSecret = await computeSharedSecret(ephemeralECDHPair.privateKey, recipientPublicKey);
            const keyMaterial = await deriveSharedSecret(sharedSecret, config);
            const cipherObject = await encryptMessageForRecipient(keyMaterial, plaintext, config);
            const ephemeralPublicKeyExported = await exportPublicKey(ephemeralECDHPair.publicKey);
            const messageCipher = {
                'ciphertext': cipherObject.ciphertext,
                'nonce': cipherObject.nonce,
                'ephemeral_public_key': ephemeralPublicKeyExported,
                'identity': Number(identity.id)
            }
            payload.ciphertexts.push(messageCipher);
        }
        const res = await sendMessageCiphers(payload); 
        console.log(res);

    });
    
});