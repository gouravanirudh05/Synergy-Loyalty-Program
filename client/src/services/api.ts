// API Service for backend communication
const API_BASE_URL = 'http://localhost:8000/api';

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
    return this.makeRequest('/events');
  }

  async createEvent(eventData: {
    event_name: string;
    points: number;
    secret_code?: string;
  }): Promise<{ message: string; event: Event }> {
    return this.makeRequest('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
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
    return this.makeRequest(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
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
}

export const apiService = new ApiService();