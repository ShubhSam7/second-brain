import axios from 'axios';
import type {
  SignupData,
  SigninData,
  CreateContentData,
  Content,
  ContentResponse,
  CategoriesResponse,
  CategoryType,
  ContentType
} from './types';

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// ============= AUTHENTICATION =============

export const signup = async (data: SignupData) => {
  const response = await api.post('/signup', data);
  return response.data;
};

export const signin = async (data: SigninData) => {
  const response = await api.post('/signin', data);
  if (response.data.success && response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('username', response.data.username);
  }
  return response.data;
};

export const signout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  window.location.href = '/signin';
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

export const getCurrentUser = (): string | null => {
  return localStorage.getItem('username');
};

// ============= CONTENT =============

export const createContent = async (data: CreateContentData): Promise<{ success: boolean; content: Content; message: string }> => {
  const response = await api.post('/content', data);
  return response.data;
};

export const getContent = async (filters?: {
  type?: ContentType;
  category?: CategoryType;
  limit?: number;
  offset?: number;
}): Promise<ContentResponse> => {
  const response = await api.get('/content', { params: filters });
  return response.data;
};

export const deleteContent = async (contentId: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete('/content', { data: { contentId } });
  return response.data;
};

export const getCategories = async (): Promise<CategoriesResponse> => {
  const response = await api.get('/content/categories');
  return response.data;
};

// ============= SHARING =============

export const createShareLink = async (): Promise<{ success: boolean; hash: string; message: string }> => {
  const response = await api.post('/brain/share', { share: true });
  return response.data;
};

export const removeShareLink = async (): Promise<{ success: boolean; message: string }> => {
  const response = await api.post('/brain/share', { share: false });
  return response.data;
};

export const getSharedBrain = async (shareLink: string): Promise<{ success: boolean; username: string; content: Content[] }> => {
  const response = await axios.get(`${API_BASE_URL}/brain/${shareLink}`);
  return response.data;
};

export default api;
