import { fetchRecipientsIdentities, sendMessageCiphers } from "../core/transport.js";
import { computeSharedSecret, deriveSharedSecret, encryptMessageForRecipient, importRecipientPublicKey, generateECDHKeyPair, exportPublicKey } from "../core/encryption.js";
import { loadConfig } from "../core/utils.js";

document.addEventListener('DOMContentLoaded', async () => {
    const config = await loadConfig();
    const params = new URLSearchParams(window.location.search);
    const chatId = params.get("id");
    const identities = await fetchRecipientsIdentities(chatId);
    const plaintextField = document.getElementById("id_message_field");
    const sendButton = document.getElementById("id_send_button");
    sendButton.addEventListener('click', async (e) => {
        const plaintext = plaintextField.value;
        var payload = {
            chat: Number(chatId),
            ciphertexts: []
        };
        for(const identity of identities) {
            const ephemeralECDHPair = await generateECDHKeyPair(config);
            console.log(identity.key_agreement_public_key);
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