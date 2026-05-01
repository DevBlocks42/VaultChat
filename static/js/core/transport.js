import { getCSRFToken } from "./utils.js";


export async function fetchNonce(username) {
    const response = await fetch("/api/users/challenge", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken()
        },
        body: JSON.stringify({ username })
    });
    const data = await response.json();
    return data.nonce;
}

export async function fetchRecipientsIdentities(chatID) {
    const response = await fetch("/api/chats/identities", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken()
        },
        body: JSON.stringify({'chat_id': chatID})
    });
    const data = await response.json();
    return data.identities;
}

export async function sendMessageCiphers(payload) {
    const response = await fetch("/api/chats/send", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken()
        },
        body: JSON.stringify(payload)
    });
    const data = await response.json();
    return {
        'chat_id' : data.chat_id,
        'ciphertexts_count': data.ciphertexts_count
    }
}

export async function fetchMessageCiphers(chatId, afterId=0) {
    const url = `/api/chats/retrieve?chat_id=${encodeURIComponent(chatId)}&after_id=${encodeURIComponent(afterId)}`
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    const data = await response.json();
    return data;
}