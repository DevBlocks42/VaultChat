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

export function base64ToArrayBufferSafe(base64) {
    base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
    base64 = base64.replace(/\s/g, '');
    const pad = base64.length % 4;
    if (pad) {
        base64 += '='.repeat(4 - pad);
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

export function concatUint8Arrays(a, b) {
    const result = new Uint8Array(a.length + b.length);
    result.set(a, 0);
    result.set(b, a.length);
    return result;
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

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}