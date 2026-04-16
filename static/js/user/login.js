import { getBrowserPrivateKey, getFileSystemPrivateKey } from "../core/storage.js";
import { loadConfig, createFileInput, hideInput } from "../core/utils.js";
import { decryptECDSAPrivateKey, signNonce } from "../core/encryption.js"
import { fetchNonce } from "../core/transport.js";


document.addEventListener('DOMContentLoaded', async () => {
    let auxAuthState = false;
    const config = await loadConfig();
    const form = document.getElementById('login_form');
    const toggleAuxAuth = document.getElementById('id_aux_auth');
    const submitField = document.getElementById('login_button');
    let fileInput;
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
        try {
            if(auxAuthState) {
                privateKeyMaterials = await getFileSystemPrivateKey(fileInput.files[0]);
            } else {
                privateKeyMaterials = await getBrowserPrivateKey(config, username);
            }
            try {
                const pkcs8PrivateKey = await decryptECDSAPrivateKey(privateKeyMaterials, passphrase, config);
                const signatureB64 = await signNonce(pkcs8PrivateKey, nonce, config);
                signatureField.value = signatureB64;
                form.submit();
            } catch(err) {
                alert("Une erreur s'est produite lors du déchiffrement de votre clé, veuillez vérifier votre passphrase.");
            }
        } catch(err) {
            alert("Une erreur s'est produite lors de l'ouverture du coffre cryptographique. Détails : " + err);
        }
    });

});