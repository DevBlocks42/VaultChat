import { decryptCipherForRecipient, signCanonicalMessage } from "./encryption.js";
import { arrayBufferToBase64, serializeObject } from "./utils.js";

let privateKey = null;
let identityPrivateKey = null;

const ports = new Set();

console.log("VAULT WORKER LOADED");

function serializeError(err) {
    return {
        message: err?.message || String(err),
        name: err?.name,
        stack: err?.stack
    };
}

onconnect = function (e) {
    const port = e.ports[0];
    console.log("Worker démarré");
    ports.add(port);

    port.onmessage = async (event) => {
        const { type, payload } = event.data;
        switch (type) {
            case "SET_PRIVATE_KEY":
                privateKey = payload.ECDH;
                identityPrivateKey = payload.ECDSA;
                port.postMessage({ type: "ACK" });
                break;

            case "HAS_KEY":
                port.postMessage({ type: "HAS_KEY", value: privateKey !== null });
                break;

            case "DECRYPT":
                if (!privateKey && !(isChrome || isBrave)) {
                    port.postMessage({ type: "ERROR", error: "NO_KEY" });
                    return;
                }
                try {
                    const { config, cipherObjects } = payload;
                    const result = await decryptCipherForRecipient(config, cipherObjects, privateKey);
                    port.postMessage({ type: "DECRYPT_RESULT", result:result });
                } catch (err) {
                    port.postMessage({ type: "ERROR", error: serializeError(err) });
                }
                break;

            case "SIGN_MESSAGE":
                try {
                    const { config, message } = payload;
                    const canonicalMessage = serializeObject(message);
                    const signature = await signCanonicalMessage(canonicalMessage, identityPrivateKey, config);
                
                    port.postMessage({
                        type: "SIGN_RESULT",
                        signature: signature
                    });
                
                } catch (err) {
                    port.postMessage({ type: "ERROR", error: serializeError(err) });
                }
                break;

            case "CLEAR":
                privateKey = null;
                port.postMessage({ type: "CLEARED" });
                break;
        }
  };

port.start();

port.onclose = () => {
        ports.delete(port);
    };
};