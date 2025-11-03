// API Service for backend communication
import type { Team } from '../admin/LeaderboardPage';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL+"/api";
const SECRET_KEY = import.meta.env.VITE_SECRET_KEY || 'your-secret-key-here';

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

// --- Base64 Helper: Buffer to URL-Safe Base64 (No Padding) ---
function bufferToUrlSafeBase64(buffer: ArrayBuffer): string {
  let binary: string = '';
  const bytes: Uint8Array = new Uint8Array(buffer);
  const len: number = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-') // Convert to URL-safe
    .replace(/\//g, '_')
    .replace(/=+$/, ''); // Remove padding
}

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

// --- Encryption Function ---
async function encryptSecretCode(plainText: string): Promise<string> {
  if (!plainText) return "";
  try {
    const key: CryptoKey = await ENCRYPTION_KEY_PROMISE;
    const encoder: TextEncoder = new TextEncoder();

    // 2. Generate a new, random IV (nonce)
    const iv: Uint8Array = crypto.getRandomValues(new Uint8Array(IV_SIZE_BYTES));

    // 3. Encrypt the data
    const ciphertextBuffer: ArrayBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      encoder.encode(plainText)
    );

    // 4. Prepend the IV to the ciphertext
    const combined: Uint8Array = new Uint8Array(iv.length + ciphertextBuffer.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertextBuffer), iv.length);

    // 5. Return as URL-safe Base64
    return bufferToUrlSafeBase64(combined as unknown as ArrayBuffer);

  } catch (error) {
    console.error("Encryption error:", error);
    throw error;
  }
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
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decryptedBuffer);

  } catch (error) {
    console.error("Decryption failed. Wrong key, tampered data, or corrupt payload:", error);
    return ""; // Fail safely
  }
}

export interface Event {
  event_id: string;
  event_name: string;
  points: number;
  secret_code:string;
  expired: boolean;
  participants: number;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
}

export interface Volunteer {
  rollNumber: string;
  name: string;
  email: string;
  added_at?: string;
  added_by?: string;
}

export interface User {
  name: string;
  email: string;
  rollNumber: string;
  role: 'admin' | 'volunteer' | 'participant';
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || errorData.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.makeRequest('/health');
  }

  // User endpoints
  async getUserProfile(): Promise<User> {
    return this.makeRequest('/user/profile');
  }

  async logout(): Promise<void> {
    await this.makeRequest('/logout', { method: 'GET' });
  }

  // Event endpoints
  async getEvents(): Promise<{ events: Event[] }> {
    const response = await this.makeRequest<{ events: Event[] }>('/events');
    // Decrypt secret codes for all events
    const eventsWithDecryptedCodes = await Promise.all(
      response.events.map(async (event) => ({
        ...event,
        secret_code: await decryptSecretCode(event.secret_code),
      }))
    );
    return { events: eventsWithDecryptedCodes };
  }

  async createEvent(eventData: {
    event_name: string;
    points: number;
    secret_code?: string;
  }): Promise<{ message: string; event: Event }> {
    // Encrypt secret_code before sending
    const dataToSend = {
      ...eventData,
      secret_code: await encryptSecretCode(eventData.secret_code || ''),
    };
    
    const response = await this.makeRequest<{ message: string; event: Event }>('/events', {
      method: 'POST',
      body: JSON.stringify(dataToSend),
    });
    
    // Decrypt the secret_code in the response
    return {
      ...response,
      event: {
        ...response.event,
        secret_code: await decryptSecretCode(response.event.secret_code),
      },
    };
  }

  async updateEvent(
    eventId: string,
    eventData: {
      event_name?: string;
      points?: number;
      expired?: boolean;
      secret_code?: string;
    }
  ): Promise<{ message: string; event: Event }> {
    // Encrypt secret_code before sending
    const dataToSend = { ...eventData };
    if (eventData.secret_code !== undefined) {
      dataToSend.secret_code = await encryptSecretCode(eventData.secret_code);
    }
    
    const response = await this.makeRequest<{ message: string; event: Event }>(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(dataToSend),
    });
    
    // Decrypt the secret_code in the response
    return {
      ...response,
      event: {
        ...response.event,
        secret_code: await decryptSecretCode(response.event.secret_code),
      },
    };
  }

  async deleteEvent(eventId: string): Promise<{ message: string }> {
    return this.makeRequest(`/events/${eventId}`, {
      method: 'DELETE',
    });
  }

  // Volunteer endpoints
  async getVolunteers(): Promise<{ volunteers: Volunteer[] }> {
    return this.makeRequest('/volunteers');
  }

  async addVolunteer(volunteerData: {
    rollNumber: string;
    name: string;
    email: string;
  }): Promise<{ message: string; volunteer: Volunteer }> {
    return this.makeRequest('/volunteers', {
      method: 'POST',
      body: JSON.stringify(volunteerData),
    });
  }

  async removeVolunteer(rollNumber: string): Promise<{ message: string }> {
    return this.makeRequest(`/volunteers/${rollNumber}`, {
      method: 'DELETE',
    });
  }

  async getVolunteer(rollNumber: string): Promise<{ volunteer: Volunteer }> {
    return this.makeRequest(`/volunteers/${rollNumber}`);
  }
  async getLeaderboard(): Promise<{ volunteers: [] }> {
    return this.makeRequest("/leaderboard");
  }

  async getLeaderboardFull(): Promise<{ teams: Team[] }> {
    return this.makeRequest('/leaderboard/full');
  }
}


export const apiService = new ApiService();
