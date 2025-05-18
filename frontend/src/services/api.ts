import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export interface LoginResponse {
  access: string;
  refresh: string;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const response = await axios.post(`${API_BASE_URL}/token/`, { username, password });
  return response.data;
}

export function setAuthToken(token: string | null) {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
}

export async function refreshToken(refresh: string): Promise<LoginResponse> {
  const response = await axios.post(`${API_BASE_URL}/token/refresh/`, { refresh });
  return response.data;
}

export async function getProductos(){
    const response = await axios.get(`${API_BASE_URL}/productos/`);
    return response.data;
}

export interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    imagen?: string;
    disponible: boolean;
    categoria: string;
    subcategoria: string;
    fecha_creacion: string;
}

// Puedes agregar más funciones para llamadas autenticadas aquí
// Ejemplo: export async function getProductos() { ... }
