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
