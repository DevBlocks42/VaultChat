import { getBrowserPrivateKey, getFileSystemPrivateKey } from "../core/storage.js";
import { loadConfig, createInput, hideInput } from "../core/utils.js";
import { decryptECDSAPrivateKey } from "../core/encryption.js"


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
            fileInput = createInput(submitField);
        } else {
            hideInput(fileInput);
            auxAuthState = false;
        }
    });
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('id_username').value;
        const passphrase = document.getElementById('id_passphrase').value;
        let privateKeyMaterials;
        if(auxAuthState) {
            privateKeyMaterials = await getFileSystemPrivateKey(fileInput.files[0]);
        } else {
            privateKeyMaterials = await getBrowserPrivateKey(config, username);
        }
        const pkcs8PrivateKey = await decryptECDSAPrivateKey(privateKeyMaterials, passphrase, config);
        console.log(pkcs8PrivateKey);
    });

});