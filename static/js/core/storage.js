// ================================================ IndexedDB Storage ================================================ //
function openDB(config) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(config.storage.db_name, 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(config.storage.store_name)) {
                db.createObjectStore(config.storage.store_name, { keyPath: ["username", "context"] });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function saveBrowserPrivateKey(config, username, encryptedKey, context) {
    const db = await openDB(config);
    return new Promise((resolve, reject) => {
        const tx = db.transaction(config.storage.store_name, "readwrite");
        const store = tx.objectStore(config.storage.store_name);
        const request = store.put({
            context,
            username,
            ...encryptedKey
        });
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}

export async function getBrowserPrivateKey(config, username, context) {
    const db = await openDB(config);
    return new Promise((resolve, reject) => {
        const tx = db.transaction(config.storage.store_name, "readonly");
        const store = tx.objectStore(config.storage.store_name);
        //const index = store.index("context");
        //const request = index.get([username, context]);
        const request = store.get([username, context]);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function updateBrowserUsername(config, oldUsername, newUsername) {
    const db = await openDB(config);

    return new Promise((resolve, reject) => {
        const tx = db.transaction(config.storage.store_name, "readwrite");
        const store = tx.objectStore(config.storage.store_name);

        const request = store.openCursor();

        request.onerror = () => reject(request.error);

        request.onsuccess = (event) => {
            const cursor = event.target.result;

            if (!cursor) {
                resolve(true);
                return;
            }

            const value = cursor.value;

            // On cible uniquement les entrées de l'ancien username
            if (value.username === oldUsername) {

                const updatedValue = {
                    ...value,
                    username: newUsername
                };

                // suppression ancienne entrée
                cursor.delete();

                // réinsertion avec nouveau username
                store.put(updatedValue);
            }

            cursor.continue();
        };
    });
}

// ================================================ FileSystem Storage =============================================== //

export function downloadEncryptedKeyFile(username, encryptedECDSAKey, encryptedECDHKey) {
    const payload = {
        username,
        ECDSA: encryptedECDSAKey,
        ECDH: encryptedECDHKey,
        version: 1,
        exported_at: new Date().toISOString()
    };
    const blob = new Blob(
        [JSON.stringify(payload, null, 2)],
        { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${username}-encrypted-key.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export async function getFileSystemPrivateKey(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            return reject(new Error("Aucun fichier fourni"));
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const json = JSON.parse(content);
            resolve(json);
        };
        reader.onerror = () => {
            reject(reader.error);
        };
        reader.readAsText(file);
    });
}