import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export interface TipoOrden {
  id: number;
  nombre: string;
  descripcion: string;
  cargos: number[];
  impuestos: number[];
}
export interface Cargo {
  id: number;
  nombre: string;
  descripcion: string;
  monto: number;
  tipo: string;
}
export interface Impuesto {
  id: number;
  nombre: string;
  codigo: string;
  tarifa: number;
  es_exento: boolean;
}

export async function getTiposOrden(token: string): Promise<TipoOrden[]> {
  const response = await axios.get(`${API_BASE_URL}/tipoorden/`, { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
}
export async function getCargos(token: string): Promise<Cargo[]> {
  const response = await axios.get(`${API_BASE_URL}/tipocargo/`, { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
}
export async function getImpuestos(token: string): Promise<Impuesto[]> {
  const response = await axios.get(`${API_BASE_URL}/impuestos/`, { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
}
export async function createTipoOrden(data: Partial<TipoOrden>, token: string): Promise<TipoOrden> {
  const response = await axios.post(`${API_BASE_URL}/tipoorden/`, data, { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
}
export async function updateTipoOrden(id: number, data: Partial<TipoOrden>, token: string): Promise<TipoOrden> {
  const response = await axios.patch(`${API_BASE_URL}/tipoorden/${id}/`, data, { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
}
export async function deleteTipoOrden(id: number, token: string): Promise<{ ok: boolean }> {
  await axios.delete(`${API_BASE_URL}/tipoorden/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
  return { ok: true };
}
