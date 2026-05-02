import { arrayBufferToBase64, base64ToArrayBuffer, base64ToArrayBufferSafe, concatUint8Arrays } from "../core/utils.js"

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

export async function generateECDHKeyPair(config) {
    const keyPair = await crypto.subtle.generateKey(
        {
            name: "ECDH",
            namedCurve: config.asymmetric.curve
        },
        true,
        ["deriveKey", "deriveBits"]
    );
    return keyPair;
}

//format attendu pour clef pkcs8
export async function encryptPrivateKey(pkcs8PrivateKey, password, config) {
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
        pkcs8PrivateKey
    );
    return {
        salt: arrayBufferToBase64(salt),
        iv: arrayBufferToBase64(iv),
        ciphertext: arrayBufferToBase64(ciphertext)
    }
}

export async function decryptECDSAPrivateKey(privateKeyMaterials, passphrase, config) {
    const salt = base64ToArrayBuffer(privateKeyMaterials.salt);
    const iv = base64ToArrayBuffer(privateKeyMaterials.iv);
    const ciphertext = base64ToArrayBuffer(privateKeyMaterials.ciphertext);
    const aesKey = await deriveAESKey(passphrase, salt, config);
    const pkcs8 = await crypto.subtle.decrypt(
        {
            name: config.symmetric.algorithm,
            iv: iv
        },
        aesKey,
        ciphertext
    );

    return crypto.subtle.importKey(
        "pkcs8",
        pkcs8,
        {
            name: config.asymmetric.algorithm,
            namedCurve: config.asymmetric.curve
        },
        true,
        ["sign"]
    );
}

export async function decryptECDHPrivateKey(privateKeyMaterials, passphrase, config) {
    const salt = base64ToArrayBuffer(privateKeyMaterials.salt);
    const iv = base64ToArrayBuffer(privateKeyMaterials.iv);
    const ciphertext = base64ToArrayBuffer(privateKeyMaterials.ciphertext);
    const aesKey = await deriveAESKey(passphrase, salt, config);
    const pkcs8 = await crypto.subtle.decrypt(
        {
            name: config.symmetric.algorithm,
            iv: iv
        },
        aesKey,
        ciphertext
    );

    return crypto.subtle.importKey(
        "pkcs8",
        pkcs8,
        {
            name: config.asymmetric.algorithm2,
            namedCurve: config.asymmetric.curve
        },
        true,
        ["deriveKey", "deriveBits"]
    );
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

async function deriveAESKeyFromSecret(secret, salt, config) {
    const baseKey = await crypto.subtle.importKey(
        "raw",
        secret,
        config.kdf.algorithm2,
        false,
        ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
        {
            name: "HKDF",
            salt: salt,
            info: new TextEncoder().encode("VaultChat_Message"),
            hash: config.kdf.hash
        },
        baseKey,
        {
            name: config.symmetric.algorithm,
            length: config.symmetric.key_length
        },
        false,
        ["decrypt"]
    );
}

export async function signNonce(pkcs8PrivateKey, nonce, config) {
    const signature = await crypto.subtle.sign(
        { name: config.asymmetric.algorithm, hash: config.asymmetric.hash },
        pkcs8PrivateKey,
        new TextEncoder().encode(nonce)
    );
    const signatureB64 = btoa(
        String.fromCharCode(...new Uint8Array(signature))
    );
    return signatureB64;
}

export async function computeSharedSecret(issuerEphemeralSecretKey, recipientPublicKey) {
    const sharedSecret = await crypto.subtle.deriveBits(
        {
          name: "ECDH",
          public: recipientPublicKey
        },
        issuerEphemeralSecretKey,
        256
    );
    return sharedSecret;
}

export async function deriveSharedSecret(secret, config) {
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        secret,
        config.kdf.algorithm2, // HKDF
        false,
        ["deriveKey"]
    );
    return keyMaterial;
}

async function decryptAES(key, iv, ciphertext, config) {
    const plainBuffer = await crypto.subtle.decrypt(
        {
            name: config.symmetric.algorithm,
            iv
        },
        key,
        ciphertext
    );
    return new TextDecoder().decode(plainBuffer);
}

async function exportRawPublicKey(key) {
    return new Uint8Array(await crypto.subtle.exportKey("raw", key));
}

async function sha256(data) {
    const digest = await crypto.subtle.digest("SHA-256", data);
    return new Uint8Array(digest);
}

export async function generateEncryptionSalt(ephemeralPublicKey, recipientPublicKey) {
    const epkRaw = await exportRawPublicKey(ephemeralPublicKey);
    const recipientPkRaw = await exportRawPublicKey(recipientPublicKey);
    const hashMaterial = concatUint8Arrays(epkRaw, recipientPkRaw); 
    const hash = await sha256(hashMaterial);
    return hash;
}


export async function encryptMessageForRecipient(keyMaterial, plaintext, salt, config) {
    const aesKey = await crypto.subtle.deriveKey(
        {
            name: config.kdf.algorithm2,
            hash: config.kdf.hash,
            salt: salt,
            info: new TextEncoder().encode("VaultChat_Message")
        },
        keyMaterial,
        {
          name: config.symmetric.algorithm,
          length: config.symmetric.key_length
        },
        false,
        ["encrypt", "decrypt"]
    );
    const iv = crypto.getRandomValues(new Uint8Array(config.symmetric.iv_length));
    const ciphertextBuffer = await crypto.subtle.encrypt(
        {
            name: config.symmetric.algorithm,
            iv: iv
        },
        aesKey,
        new TextEncoder().encode(plaintext)
    );
    return {
        ciphertext: arrayBufferToBase64(ciphertextBuffer),
        nonce: arrayBufferToBase64(iv) 
    }
}


export async function decryptCipherForRecipient(config, cipherObjects, recipientSecretKey) {
    let plaintexts = [];
    for(const cipherObj of cipherObjects) {
        const epk = await importRecipientPublicKey(cipherObj.ephemeral_public_key, config);
        const nonce = base64ToArrayBuffer(cipherObj.nonce);
        const ciphertext = base64ToArrayBufferSafe(cipherObj.ciphertext);
        const secret = await computeSharedSecret(recipientSecretKey, epk);
        //salt
        const recipientPublicKeyB64SPKI = cipherObj.recipient_public_key;
        const recipientPublicKey = await importRecipientPublicKey(recipientPublicKeyB64SPKI, config);
        console.log(recipientPublicKeyB64SPKI);
        const salt = await generateEncryptionSalt(epk, recipientPublicKey);
        const aes = await deriveAESKeyFromSecret(secret, salt, config);
        const plaintext = await decryptAES(aes, nonce, ciphertext, config);
        plaintexts.push([plaintext, cipherObj.sender_username, cipherObj.created_at]);
    }
    return plaintexts;

}

export async function importRecipientPublicKey(base64Spki, config) {
    const spkiBuffer = base64ToArrayBufferSafe(base64Spki);

    return await crypto.subtle.importKey(
        "spki",
        spkiBuffer,
        {
            name: config.asymmetric.algorithm2,
            namedCurve: config.asymmetric.curve
        },
        true,//chgt
        []
    );
}

// BASE 64
export async function exportPublicKey(rawPublicKey) {
    const publicKeySpki = await crypto.subtle.exportKey(
        "spki",
        rawPublicKey
    );
    return arrayBufferToBase64(publicKeySpki);
}

// RAW BYTES
export async function exportPrivateKey(rawPrivateKey) {
    const privateKeyPkcs8 = await crypto.subtle.exportKey(
        "pkcs8",
        rawPrivateKey
    );
    return privateKeyPkcs8
}

export async function importPrivateKey(config, base64PrivateKey) {
    const binary = Uint8Array.from(atob(base64PrivateKey), c => c.charCodeAt(0));

    const key = await crypto.subtle.importKey(
        "pkcs8",
        binary.buffer,
        {
            name: config.asymmetric.algorithm2,
            namedCurve: config.asymmetric.curve
        },
        true,
        ["deriveBits"]
    );
    return key;
}