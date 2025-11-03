import axios from "axios";

const API_BASE = import.meta.env.VITE_BACKEND_URL+"/api";
const SECRET_KEY = import.meta.env.VITE_SECRET_KEY || 'your-secret-key-here';

axios.defaults.withCredentials = true;

const IV_SIZE_BYTES: number = 12; // Standard nonce size for AES-GCM

// 1. Derive a stable 32-byte (256-bit) key from the secret (as a promise)
const ENCRYPTION_KEY_PROMISE: Promise<CryptoKey> = (async () => {
  const encoder: TextEncoder = new TextEncoder();
  const keyData: Uint8Array = encoder.encode(SECRET_KEY);
  const hashBuffer: ArrayBuffer = await crypto.subtle.digest('SHA-256', keyData as BufferSource);
  return crypto.subtle.importKey(
    'raw',
    hashBuffer,
    'AES-GCM',
    false, // not extractable
    ['encrypt', 'decrypt']
  );
})();


// --- Base64 Helper: URL-Safe Base64 to Buffer ---
function urlSafeBase64ToBuffer(base64: string): ArrayBuffer {
  let b64: string = base64.replace(/-/g, '+').replace(/_/g, '/'); // Revert URL-safe
  const padding: number = b64.length % 4; // Re-add padding
  if (padding) b64 += '='.repeat(4 - padding);

  const binaryString: string = atob(b64);
  const buffer: Uint8Array = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    buffer[i] = binaryString.charCodeAt(i);
  }
  return buffer as unknown as ArrayBuffer;
}

// --- Decryption Function ---
async function decryptSecretCode(encryptedText: string): Promise<string> {
  if (!encryptedText) return "";
  try {
    const key: CryptoKey = await ENCRYPTION_KEY_PROMISE;

    // 1. Decode from URL-safe Base64
    const combined: ArrayBuffer = urlSafeBase64ToBuffer(encryptedText);

    // 2. Extract the IV and the ciphertext
    const iv: ArrayBuffer = combined.slice(0, IV_SIZE_BYTES);
    const ciphertext: ArrayBuffer = combined.slice(IV_SIZE_BYTES);

    // 3. Decrypt and verify the authentication tag
    const decryptedBuffer: ArrayBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decryptedBuffer);

  } catch (error) {
    console.error("Decryption failed. Wrong key, tampered data, or corrupt payload:", error);
    return ""; // Fail safely
  }
}

export const getEvents = async () => {
  const res = await axios.get(`${API_BASE}/events`);
  console.log(res.data);
  
  // Decrypt secret codes for all events (backend sends encrypted)
  const eventsWithDecryptedCodes = await Promise.all(
    res.data.events.map(async (event: any) => ({
      ...event,
      secret_code: await decryptSecretCode(event.secret_code),
    }))
  );
  
  return eventsWithDecryptedCodes;
};

export const authorizeVolunteer = async (eventId: string, secretCode: string, token: string) => {
  const res = await axios.post(`${API_BASE}/volunteer/authorize`, {
    event_id: eventId,
    secret_code: secretCode  // Send plain text (volunteer types it)
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const scanTeamQR = async (teamId: string, eventToken: string) => {
  const res = await axios.post(`${API_BASE}/volunteer/scan`, {
    team_id: teamId
  }, {
    headers: { Authorization: `Bearer ${eventToken}` }
  });
  return res.data;
};
