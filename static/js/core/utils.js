export function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

export async function loadConfig() {
    const res = await fetch("/static/js/config/crypto.json");
    return await res.json();
}

export function createFileInput(submitField) { 
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("class", "form-control mb-3");
    input.setAttribute("id", "private_key_file");
    const parent = submitField.parentElement;
    parent.insertBefore(input, submitField);
    return input;
}

export function hideInput(input) {
    input.remove();
}

export function getCSRFToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]').value;
}