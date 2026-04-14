import { arrayBufferToBase64 } from "../core/utils.js"

export async function generateECDSAKeyPair(config) {
    const keyPair = await crypto.subtle.generateKey(
        {
            name: config.asymmetric.algorithm,
            namedCurve: config.asymmetric.curve
        },
        true,
        ["sign", "verify"]
    ); 
    return keyPair;
}

export async function encryptECDSAPrivateKey(ecdsaPrivateKey, password, config) {
    const salt = crypto.getRandomValues(
        new Uint8Array(config.kdf.salt_length)
    );
    const iv = crypto.getRandomValues(
        new Uint8Array(config.symmetric.iv_length)
    );
    const aesKey = await deriveAESKey(password, salt, config);
    const ciphertext = await crypto.subtle.encrypt(
        {
            name: config.symmetric.algorithm,
            iv: iv
        },
        aesKey,
        ecdsaPrivateKey
    );
    return {
        salt: arrayBufferToBase64(salt),
        iv: arrayBufferToBase64(iv),
        ciphertext: arrayBufferToBase64(ciphertext)
    }
}


async function deriveAESKey(password, salt, config) {
    const enc = new TextEncoder();
    const baseKey = await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        config.kdf.algorithm,
        false,
        ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
        {
            name: config.kdf.algorithm,
            salt: salt,
            iterations: config.kdf.iterations,
            hash: config.kdf.hash
        },
        baseKey,
        {
            name: config.symmetric.algorithm,
            length: config.symmetric.key_length
        },
        false,
        ["encrypt", "decrypt"]
    );
}

// BASE 64
export async function exportECDSAPublicKey(rawPublicKey) {
    const publicKeySpki = await crypto.subtle.exportKey(
        "spki",
        rawPublicKey
    );
    return arrayBufferToBase64(publicKeySpki);
}

// RAW BYTES
export async function exportECDSAPrivateKey(rawPrivateKey) {
    const privateKeyPkcs8 = await crypto.subtle.exportKey(
        "pkcs8",
        rawPrivateKey
    );
    return privateKeyPkcs8
}