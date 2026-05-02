import { fetchRecipientsIdentities, sendMessageCiphers, fetchMessageCiphers } from "../core/transport.js";
import { getBrowserPrivateKey } from "../core/storage.js";
import { generateEncryptionSalt, importPrivateKey, computeSharedSecret, deriveSharedSecret, encryptMessageForRecipient, decryptCipherForRecipient, decryptECDHPrivateKey, importRecipientPublicKey, generateECDHKeyPair, exportPublicKey } from "../core/encryption.js";
import { loadConfig, sleep } from "../core/utils.js";

let pollDelay = 2500; 
const MAX_DELAY = 10000; 
var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
var isBrave = (navigator.brave && await navigator.brave.isBrave() || false);

async function pollLoop(config, workerPort, chatId, messageOutputArea) {
    let lastMessageId = 0;
    workerPort.addEventListener('message', (event) => {  
        const { type, result, error } = event.data || {};  
        if (type === 'DECRYPT_RESULT') {    
            for(const message of result) {
                const date = new Date(message[2]);
                const formattedDate = new Intl.DateTimeFormat(navigator.language, {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }).format(date);
                messageOutputArea.value += formattedDate + " " + message[1] + " : " + message[0] + "\n";
            }      
        } else {
            console.log('Erreur :', error);   
        }
    });
    while (true) {
        lastMessageId = await pollMessages(config, workerPort, chatId, lastMessageId);
        await sleep(pollDelay);
    }
}

async function pollMessages(config, workerPort, chatId, lastMessageId) {
    // MESSAGE RETRIEVE
    let currentLastMessageId = lastMessageId;
    const ciphersToDecrypt = await fetchMessageCiphers(chatId, lastMessageId);
    const cipherObjects = ciphersToDecrypt.ciphertexts;
    if(cipherObjects.length != 0) {
        currentLastMessageId = cipherObjects[cipherObjects.length - 1].message_id;
        if(lastMessageId != currentLastMessageId) { // Présence de nouveaux messages
            // Decryption worker
            
            workerPort.postMessage({
                type: "DECRYPT",
                payload: {
                    config,
                    cipherObjects
                }
            });
            
        }
    }
    return currentLastMessageId;
}

document.addEventListener('DOMContentLoaded', async () => {
    const config = await loadConfig();
    const params = new URLSearchParams(window.location.search);
    const chatId = params.get("id");
    const plaintextField = document.getElementById("id_message_field");
    const sendButton = document.getElementById("id_send_button");
    const messageOutputArea = document.getElementById("id_message_output");
    //
    //const ids = await fetchRecipientsIdentities(chatId);
    //console.log(ids);
    //
    messageOutputArea.value += "\n";
    //vault worker
    const worker = new SharedWorker("/static/js/core/vault.js", {
        type: "module"
    });
    const port = worker.port;
    port.start();
    if(isBrave || isChrome) {
        var key = sessionStorage.getItem("vaultchat_key");
        const cryptoKeyObject = await importPrivateKey(config, key); 
        console.log(key);
        port.postMessage({
            type: "SET_PRIVATE_KEY",
            payload: cryptoKeyObject
        });
    }
    pollLoop(config, port, chatId, messageOutputArea);
    sendButton.addEventListener('click', async (e) => {
        const identities = await fetchRecipientsIdentities(chatId);
        //console.log(identities);
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
            const hash = await generateEncryptionSalt(ephemeralECDHPair.publicKey, recipientPublicKey);
            const cipherObject = await encryptMessageForRecipient(keyMaterial, plaintext, hash, config);
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
        plaintextField.value = ""; 

    });
    
});