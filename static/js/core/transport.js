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