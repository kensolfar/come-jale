import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// --- REFRESH TOKEN INTERCEPTOR ---
let isRefreshing = false;
let failedQueue: any[] = [];

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return axios(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const refresh = localStorage.getItem('jwt_refresh');
        if (!refresh) throw new Error('No refresh token');
        const { data } = await axios.post(`${API_BASE_URL}/token/refresh/`, { refresh });
        const newToken = data.access;
        localStorage.setItem('jwt_token', newToken);
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
        processQueue(null, newToken);
        isRefreshing = false;
        originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
        return axios(originalRequest);
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('jwt_refresh');
        window.location.reload();
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);
// --- END REFRESH TOKEN INTERCEPTOR ---

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

export async function getProductos(categoriaId?: number){
    const params = categoriaId ? { categoria: categoriaId } : undefined;
    const response = await axios.get(`${API_BASE_URL}/productos/`, params ? { params } : undefined);
    return response.data;
}

export async function createProducto(producto: Omit<Producto, 'id' | 'fecha_creacion'>) {
  const response = await axios.post(`${API_BASE_URL}/productos/`, producto);
  return response.data;
}

export async function updateProducto(id: number, producto: Partial<Producto>) {
  const response = await axios.patch(`${API_BASE_URL}/productos/${id}/`, producto);
  return response.data;
}

export async function deleteProducto(id: number) {
  const response = await axios.delete(`${API_BASE_URL}/productos/${id}/`);
  return response.data;
}

export async function uploadProductoImagen(file: File, productoId: number): Promise<{ imagen: string }> {
  const form = new FormData();
  form.append('imagen', file);
  const response = await axios.post(`${API_BASE_URL}/productos/${productoId}/upload/`, form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function updateConfiguracion(data: any, isForm: boolean): Promise<any> {
  const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  if (isForm) {
    const response = await axios.patch(`${API_BASE}/api/configuracion/1/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } else {
    const response = await axios.patch(`${API_BASE}/api/configuracion/1/`, data);
    return response.data;
  }
}

export interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    imagen?: string;
    disponible: boolean;
    categoria: string;
    cantidad: number;
    subcategoria: string;
    fecha_creacion: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface Subcategoria {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: number;
}

export interface UserProfile {
  id: number;
  user: number;
  imagen: string | null;
}

export async function getUserProfileMe(): Promise<UserProfile> {
  const response = await axios.get(`${API_BASE_URL}/perfiles/me/`);
  return response.data;
}

export async function getCategorias(): Promise<Categoria[]> {
  const response = await axios.get(`${API_BASE_URL}/categorias/`);
  return response.data;
}

export async function getSubcategorias(categoriaId?: number): Promise<Subcategoria[]> {
  const response = await axios.get(`${API_BASE_URL}/subcategorias/`, categoriaId ? { params: { categoria: categoriaId } } : undefined);
  return response.data;
}

// Puedes agregar más funciones para llamadas autenticadas aquí
// Ejemplo: export async function getProductos() { ... }
