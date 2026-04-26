import { fetchRecipientsIdentities } from "../core/transport.js";

document.addEventListener('DOMContentLoaded', async () => {
    //FETCH PUBLIC KEYS
    const params = new URLSearchParams(window.location.search);
    const chatId = params.get("id");
    console.log(chatId);
    const identities = await fetchRecipientsIdentities(chatId);
    console.log(identities);
    const plaintextField = document.getElementById("id_message_field");
    const sendButton = document.getElementById("id_send_button");
    sendButton.addEventListener('click', async (e) => {
        const plaintext = plaintextField.value;

    });
    
});