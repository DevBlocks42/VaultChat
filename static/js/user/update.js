import { updateBrowserUsername, getBrowserPrivateKey, downloadEncryptedKeyFile, getFileSystemPrivateKey } from "../core/storage.js";
import { loadConfig, createFileInput } from "../core/utils.js";


document.addEventListener('DOMContentLoaded', async () => {
    const updatedUsername = window.NEW_USERNAME;
    const oldUsername = window.OLD_USERNAME;
    const authType = window.AUTH_TYPE;
    const config = await loadConfig();
    const submitButton = document.getElementById("submit_button");
    const usernameField = document.getElementById("id_username");
    const form = document.getElementById("settings_form");
    let hasUsernameChanged = false;
    usernameField.addEventListener('change', async (e) => {
        hasUsernameChanged = true;
        const fileInput = createFileInput(submitButton);
        fileInput.setAttribute("required", "");
        fileInput.setAttribute("id", "id_auth_file");
        fileInput.setAttribute("class", "form-control");
        const lbl = document.createElement("label");
        lbl.textContent = "Fichier d'authentification * :";
        lbl.setAttribute("for", "id_auth_file");
        fileInput.parentElement.insertBefore(lbl, fileInput);
        if(authType == "AUXILIARY_AUTH") {
            fileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const text = await file.text();
                sessionStorage.setItem("recovery_file", text);
                console.log(text);
            });
        }
    });
    /*if(authType == "AUXILIARY_AUTH" && hasUsernameChanged) {
        const fileInput = createFileInput(submitButton);
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const text = await file.text();
            sessionStorage.setItem("recovery_file", text);
            console.log(text);
        });
    }*/
    ////////////
    /*const fileInput = document.getElementById("id_auth_file");

    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const text = await file.text();
        sessionStorage.setItem("recovery_file", text);
        console.log(text);
    });*/
    /////
    console.log("AUTH_TYPE : " + authType);
    console.log("OLD : " + oldUsername);
    console.log("NEW : " + updatedUsername);

    if (!updatedUsername) return;
    

    if(updatedUsername && oldUsername) {
        if(updatedUsername != oldUsername) {
            console.log("Mise à jour fichier");
            await updateBrowserUsername(config, oldUsername, updatedUsername); 
            if(authType == "LOCAL_AUTH") {
                const privateKeyECDSA = await getBrowserPrivateKey(config, updatedUsername, "ECDSA");
                const privateKeyECDH = await getBrowserPrivateKey(config, updatedUsername, "ECDH");
                alert("Le téléchargement du fichier d'authentification mis à jour a débuter.\nVeuillez fermer ce message.");
                downloadEncryptedKeyFile(updatedUsername, privateKeyECDSA, privateKeyECDH);
            } else {
                const recoveryFileText = sessionStorage.getItem("recovery_file");
                const data = JSON.parse(recoveryFileText);
                data.username = updatedUsername;
                const ecdsaPrivateKeyEncr = data.ECDSA;
                const ecdhPrivateKeyEncr = data.ECDH;
                const updated = JSON.stringify(data);
                alert("Le téléchargement du fichier d'authentification mis à jour va débuter.\nVeuillez fermer ce message.");
                downloadEncryptedKeyFile(updatedUsername, ecdsaPrivateKeyEncr, ecdhPrivateKeyEncr)
            }
        }
    }
});