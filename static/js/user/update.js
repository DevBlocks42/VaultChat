import { updateBrowserUsername } from "../core/storage.js";
import { loadConfig } from "../core/utils.js";


document.addEventListener('DOMContentLoaded', async () => {
    const updatedUsername = window.NEW_USERNAME;
    const oldUsername = window.OLD_USERNAME;
    const config = await loadConfig();

    console.log("OLD : " + oldUsername);
    console.log("NEW : " + updatedUsername);

    if (!updatedUsername) return;
    await updateBrowserUsername(config, oldUsername, updatedUsername);

    // nettoyage optionnel côté client
    window.USERNAME_UPDATED = null;
});