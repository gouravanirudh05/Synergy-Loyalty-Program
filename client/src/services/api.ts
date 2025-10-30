// API Service for backend communication
import type { Team } from '../admin/LeaderboardPage';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL+"/api";

// Encryption/Decryption utilities for secret codes
// Note: The SECRET_KEY must match the one used on the backend
const SECRET_KEY = import.meta.env.VITE_SECRET_KEY || 'your-secret-key-here';

async function sha256(text: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  return await crypto.subtle.digest('SHA-256', data);
}

async function getEncryptionKey(): Promise<CryptoKey> {
  const keyBytes = await sha256(SECRET_KEY);
  return crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binaryString = '';
  for (let i = 0; i < bytes.length; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  return btoa(binaryString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function encryptSecretCode(plainText: string): Promise<string> {
  if (!plainText) return '';
  
  try {
    const key = await getEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit nonce
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);
    
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    // Combine iv + ciphertext
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(ciphertext), iv.length);
    
    return uint8ArrayToBase64(combined);
  } catch (error) {
    console.error('Encryption error:', error);
    return plainText;
  }
}

export async function decryptSecretCode(encryptedText: string): Promise<string> {
  if (!encryptedText) return '';
  
  try {
    const key = await getEncryptionKey();
    const combined = base64ToUint8Array(encryptedText);
    
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText;
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
    // Encrypt secret_code before sending to backend (backend stores plain, sends encrypted back)
    const dataToSend = {
      ...eventData,
      secret_code: eventData.secret_code || '',
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
    // Encrypt secret_code before sending to backend
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
