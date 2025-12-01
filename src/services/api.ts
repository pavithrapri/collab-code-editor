import axios from 'axios';

// Debug logging
console.log('=== API CONFIGURATION ===');
console.log('VITE_API_URL from env:', import.meta.env.VITE_API_URL);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
console.log('Using API_BASE_URL:', API_BASE_URL);

export interface RoomResponse {
  room_id: string;
  code: string;
  language: string;
  created_at: string;
}

export interface AutocompleteResponse {
  suggestion: string;
  confidence: number;
  context?: string;
}

// Test function to check backend connection
export const testBackendConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing backend connection...');
    const response = await axios.get(API_BASE_URL.replace('/api', ''), {
      timeout: 5000
    });
    console.log('Backend connection successful:', response.data);
    return true;
  } catch (error) {
    console.error('Backend connection failed:', error);
    return false;
  }
};

export const createRoom = async (language: string = 'python'): Promise<RoomResponse> => {
  console.log('=== CREATE ROOM REQUEST ===');
  console.log('URL:', `${API_BASE_URL}/rooms`);
  console.log('Data:', { language });
  
  try {
    // First test if backend is reachable
    const isBackendAlive = await testBackendConnection();
    
    if (!isBackendAlive) {
      console.warn('Backend not reachable, using mock response');
      return getMockRoom(language);
    }
    
    const response = await axios.post(`${API_BASE_URL}/rooms`, { 
      language 
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('=== CREATE ROOM RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    
    if (!response.data || !response.data.room_id) {
      throw new Error('Invalid response format from server');
    }
    
    return response.data;
    
  } catch (error: any) {
    console.error('=== CREATE ROOM ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received. Request:', error.request);
    }
    
    console.error('Config:', error.config);
    
    // Return mock data for development
    return getMockRoom(language);
  }
};

// Helper function for mock room data
const getMockRoom = (language: string): RoomResponse => {
  const mockRoom: RoomResponse = {
    room_id: `room_mock_${Math.random().toString(36).substr(2, 9)}`,
    code: `# Welcome to CodeSync Pro\n# Language: ${language}\n# Mock room for testing\n\nprint("Hello, collaborative coding!")\n`,
    language: language,
    created_at: new Date().toISOString()
  };
  
  console.log('Generated mock room:', mockRoom);
  return mockRoom;
};

export const getRoom = async (roomId: string): Promise<RoomResponse> => {
  console.log(`Getting room ${roomId} from ${API_BASE_URL}/rooms/${roomId}`);
  
  try {
    const response = await axios.get(`${API_BASE_URL}/rooms/${roomId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting room:', error);
    return getMockRoom('python');
  }
};

export const getAutocomplete = async (
  code: string,
  cursorPosition: number,
  language: string
): Promise<AutocompleteResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/autocomplete`, {
      code,
      cursor_position: cursorPosition,
      language,
    });
    return response.data;
  } catch (error) {
    console.error('Autocomplete error:', error);
    return {
      suggestion: '',
      confidence: 0,
      context: 'error'
    };
  }
};