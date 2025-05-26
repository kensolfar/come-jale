import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export interface TipoCargo {
  id: number;
  nombre: string;
  descripcion: string;
  monto: number;
  tipo: string;
}

export async function getTipoCargos(token: string): Promise<TipoCargo[]> {
  const response = await axios.get(`${API_BASE_URL}/tipocargo/`, { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
}
export async function createTipoCargo(data: Partial<TipoCargo>, token: string): Promise<TipoCargo> {
  const response = await axios.post(`${API_BASE_URL}/tipocargo/`, data, { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
}
export async function updateTipoCargo(id: number, data: Partial<TipoCargo>, token: string): Promise<TipoCargo> {
  const response = await axios.patch(`${API_BASE_URL}/tipocargo/${id}/`, data, { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
}
export async function deleteTipoCargo(id: number, token: string): Promise<{ ok: boolean }> {
  await axios.delete(`${API_BASE_URL}/tipocargo/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
  return { ok: true };
}
