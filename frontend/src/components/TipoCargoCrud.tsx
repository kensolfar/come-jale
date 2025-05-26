import React, { useEffect, useState } from 'react';
import { getTipoCargos, createTipoCargo, updateTipoCargo, deleteTipoCargo } from '../services/tipoCargoService';
import type { TipoCargo } from '../services/tipoCargoService';

const initialForm = { nombre: '', descripcion: '', monto: '', tipo: 'SERVICIO' };

const TipoCargoCrud = ({ token }: { token: string }) => {
  const [cargos, setCargos] = useState<TipoCargo[]>([]);
  const [form, setForm] = useState<any>(initialForm);
  const [edit, setEdit] = useState<TipoCargo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCargos = async () => {
    try {
      const data = await getTipoCargos(token);
      setCargos(data);
      setError(null);
    } catch (e) {
      setError('Error al cargar cargos');
    }
  };

  useEffect(() => { fetchCargos(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.monto) {
      setError('Nombre y monto son obligatorios');
      return;
    }
    if (edit) {
      await updateTipoCargo(edit.id, { ...form, monto: Number(form.monto) }, token);
    } else {
      await createTipoCargo({ ...form, monto: Number(form.monto) }, token);
    }
    setEdit(null);
    setForm(initialForm);
    setError(null);
    fetchCargos();
  };

  const handleEdit = (cargo: TipoCargo) => {
    setEdit(cargo);
    setForm({ ...cargo, monto: cargo.monto.toString() });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar cargo?')) return;
    await deleteTipoCargo(id, token);
    fetchCargos();
  };

  const handleCancel = () => {
    setEdit(null);
    setForm(initialForm);
    setError(null);
  };

  return (
    <div style={{ padding: 0 }}>
      <h3 style={{ color: '#8DAA91', fontWeight: 700, margin: '24px 0 18px 0' }}>Cargos</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" required style={{ flex: 1, minWidth: 120 }} />
        <input name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Descripción" style={{ flex: 2, minWidth: 180 }} />
        <label htmlFor="tipo" style={{ margin: 0 }}>Tipo</label>
        <select id="tipo" name="tipo" value={form.tipo} onChange={handleChange} style={{ width: 120 }}>
          <option value="SERVICIO">Servicio</option>
          <option value="EMBALAJE">Embalaje</option>
          <option value="TRANSPORTE">Transporte</option>
          <option value="OTRO">Otro</option>
        </select>
        <input name="monto" value={form.monto} onChange={handleChange} placeholder="Monto" type="number" min="0" required style={{ width: 80 }} />
        <button type="submit" style={{ background: '#8DAA91', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontWeight: 700, fontSize: 15, transition: 'background 0.2s', cursor: 'pointer' }}>{edit ? 'Actualizar' : 'Agregar'}</button>
        {edit && <button type="button" onClick={handleCancel} style={{ background: '#232428', color: '#fff', border: '1.5px solid #8DAA91', borderRadius: 8, padding: '7px 16px', fontWeight: 700, fontSize: 15, transition: 'background 0.2s', cursor: 'pointer' }}>Cancelar</button>}
      </form>
      <table style={{ width: '100%', background: '#18191b', color: '#fff', borderRadius: 8, overflow: 'hidden', fontSize: 15 }}>
        <thead>
          <tr style={{ background: '#232428', color: '#8DAA91' }}>
            <th style={{ padding: '10px 8px' }}>Nombre</th>
            <th style={{ padding: '10px 8px' }}>Descripción</th>
            <th style={{ padding: '10px 8px' }}>Tipo</th>
            <th style={{ padding: '10px 8px' }}>Monto</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cargos.length === 0 ? (
            <tr><td colSpan={5} style={{ textAlign: 'center', color: '#bdbdbd', padding: 16 }}>No hay cargos</td></tr>
          ) : (
            cargos.map(cargo => (
              <tr key={cargo.id} style={{ borderBottom: '1px solid #232428' }}>
                <td style={{ padding: '8px 8px' }}>{cargo.nombre}</td>
                <td style={{ padding: '8px 8px' }}>{cargo.descripcion || '-'}</td>
                <td style={{ padding: '8px 8px' }}>{cargo.tipo}</td>
                <td style={{ padding: '8px 8px' }}>{cargo.monto}</td>
                <td style={{ padding: '8px 8px', display: 'flex', gap: 6 }}>
                  <button onClick={() => handleEdit(cargo)} style={{ background: '#8DAA91', color: '#fff', border: 'none', borderRadius: 8, padding: '5px 14px', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'background 0.2s' }}>Editar</button>
                  <button onClick={() => handleDelete(cargo.id)} style={{ background: '#232428', color: '#ff6b6b', border: '1.5px solid #ff6b6b', borderRadius: 8, padding: '5px 14px', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'background 0.2s' }}>Eliminar</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {error && <div style={{ color: '#ff6b6b', marginTop: 12 }}>{error}</div>}
    </div>
  );
};

export default TipoCargoCrud;
