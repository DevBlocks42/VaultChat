import { getBrowserPrivateKey, getFileSystemPrivateKey } from "../core/storage.js";
import { loadConfig, createFileInput, hideInput } from "../core/utils.js";
import { decryptECDSAPrivateKey, decryptECDHPrivateKey, signNonce } from "../core/encryption.js"
import { fetchNonce } from "../core/transport.js"; 


document.addEventListener('DOMContentLoaded', async () => {
    let auxAuthState = false;
    const config = await loadConfig();
    const form = document.getElementById('login_form');
    const toggleAuxAuth = document.getElementById('id_aux_auth');
    const submitField = document.getElementById('login_button');
    let fileInput;
    //init worker
    const worker = new SharedWorker("/static/js/core/vault.js", {
        type: "module"
    });
    const port = worker.port;
    port.start();
    //
    toggleAuxAuth.addEventListener('click', async () => {
        if(!auxAuthState) {
            auxAuthState = true;
            fileInput = createFileInput(submitField);
        } else {
            hideInput(fileInput);
            auxAuthState = false;
        }
    });
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('id_username').value;
        const passphrase = document.getElementById('id_passphrase').value;
        const signatureField = document.getElementById('id_signature');
        // fetch nonce
        const nonce = await fetchNonce(username);
        let privateKeyMaterials;
        let privateKeyMaterialsECDH;
        try {
            if(auxAuthState) {
                privateKeyMaterials = await getFileSystemPrivateKey(fileInput.files[0]);
                privateKeyMaterials = privateKeyMaterials.ECDSA;
                privateKeyMaterialsECDH = privateKeyMaterials.ECDH; // WARNING peut-être pas implémenté CORRECTEMENT ? 

            } else {
                privateKeyMaterials = await getBrowserPrivateKey(config, username, "ECDSA");
                privateKeyMaterialsECDH = await getBrowserPrivateKey(config, username, "ECDH");
            }
            try {
                const pkcs8PrivateKey = await decryptECDSAPrivateKey(privateKeyMaterials, passphrase, config);
                const pkcs8ECDHPrivateKey = await decryptECDHPrivateKey(privateKeyMaterialsECDH, passphrase, config);
                const signatureB64 = await signNonce(pkcs8PrivateKey, nonce, config);
                signatureField.value = signatureB64;
                
                port.postMessage({
                    type: "SET_PRIVATE_KEY",
                    payload: pkcs8ECDHPrivateKey
                });
                //
                form.submit();
            } catch(err) {
                alert("Une erreur s'est produite lors du déchiffrement de votre clé, veuillez vérifier votre passphrase.");
            }
        } catch(err) {
            alert("Une erreur s'est produite lors de l'ouverture du coffre cryptographique. Détails : " + err);
        }
    });

});