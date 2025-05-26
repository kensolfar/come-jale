import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCargos, createCargo, updateCargo, deleteCargo } from '../services/api';

const OrdenCargosCrud = ({ token }: { token: string }) => {
  const { t } = useTranslation();
  const [cargos, setCargos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<any | null>(null);
  const [form, setForm] = useState<any>({ nombre: '', descripcion: '', tipo: 'SERVICIO', monto: '' });
  const [error, setError] = useState<string | null>(null);

  const fetchCargos = async () => {
    setLoading(true);
    try {
      const data = await getCargos(token);
      setCargos(data);
    } catch (e) {
      setError('Error al cargar cargos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCargos(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ 
      ...form, 
      [name]: value 
    });
  };

  const handleEdit = (cargo: any) => {
    setEdit(cargo);
    setForm({ nombre: cargo.nombre, descripcion: cargo.descripcion || '', tipo: cargo.tipo, monto: cargo.monto });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar cargo?')) return;
    await deleteCargo(id, token);
    fetchCargos();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (edit) {
      await updateCargo(edit.id, form, token);
    } else {
      await createCargo(form, token);
    }
    setEdit(null);
    setForm({ nombre: '', descripcion: '', tipo: 'SERVICIO', monto: '' });
    fetchCargos();
  };

  return (
    <div style={{ padding: 0 }}>
      <h3 style={{ color: '#8DAA91', fontWeight: 700, margin: '24px 0 18px 0' }}>{t('Cargos')}</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <input name="nombre" value={form.nombre} onChange={handleChange} placeholder={t('Nombre')} required style={{ flex: 1, minWidth: 120 }} />
        <textarea name="descripcion" value={form.descripcion} onChange={handleChange} placeholder={t('Descripción')} style={{ flex: 2, minWidth: 180, resize: 'vertical', height: 32 }} />
        <label htmlFor="tipo" style={{ margin: 0 }}>{t('Tipo')}</label>
        <select id="tipo" name="tipo" value={form.tipo} onChange={handleChange} style={{ width: 120 }}>
          <option value="SERVICIO">{t('Servicio')}</option>
          <option value="EMBALAJE">{t('Embalaje')}</option>
          <option value="TRANSPORTE">{t('Transporte')}</option>
          <option value="OTRO">{t('Otro')}</option>
        </select>
        <input name="monto" value={form.monto} onChange={handleChange} placeholder={t('Monto')} type="number" min="0" required style={{ width: 80 }} />
        <button type="submit" style={{ background: '#8DAA91', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontWeight: 700, fontSize: 15, transition: 'background 0.2s', cursor: 'pointer' }}>{edit ? t('Actualizar') : t('Agregar')}</button>
        {edit && <button type="button" onClick={() => { setEdit(null); setForm({ nombre: '', descripcion: '', tipo: 'SERVICIO', monto: '' }); }} style={{ background: '#232428', color: '#fff', border: '1.5px solid #8DAA91', borderRadius: 8, padding: '7px 16px', fontWeight: 700, fontSize: 15, transition: 'background 0.2s', cursor: 'pointer' }}>{t('Cancelar')}</button>}
      </form>
      <table style={{ width: '100%', background: '#18191b', color: '#fff', borderRadius: 8, overflow: 'hidden', fontSize: 15 }}>
        <thead>
          <tr style={{ background: '#232428', color: '#8DAA91' }}>
            <th style={{ padding: '10px 8px' }}>{t('Nombre')}</th>
            <th style={{ padding: '10px 8px' }}>{t('Descripción')}</th>
            <th style={{ padding: '10px 8px' }}>{t('Tipo')}</th>
            <th style={{ padding: '10px 8px' }}>{t('Monto')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cargos.map(cargo => (
            <tr key={cargo.id} style={{ borderBottom: '1px solid #232428' }}>
              <td style={{ padding: '8px 8px' }}>{cargo.nombre}</td>
              <td style={{ padding: '8px 8px' }}>{cargo.descripcion || '-'}</td>
              <td style={{ padding: '8px 8px' }}>{t(cargo.tipo)}</td>
              <td style={{ padding: '8px 8px' }}>{cargo.monto}</td>
              <td style={{ padding: '8px 8px', display: 'flex', gap: 6 }}>
                <button onClick={() => handleEdit(cargo)} style={{ background: '#8DAA91', color: '#fff', border: 'none', borderRadius: 8, padding: '5px 14px', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => (e.currentTarget.style.background = '#6e8c74')} onMouseOut={e => (e.currentTarget.style.background = '#8DAA91')}>{t('Editar')}</button>
                <button onClick={() => handleDelete(cargo.id)} style={{ background: '#232428', color: '#ff6b6b', border: '1.5px solid #ff6b6b', borderRadius: 8, padding: '5px 14px', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => (e.currentTarget.style.background = '#2d1a1a')} onMouseOut={e => (e.currentTarget.style.background = '#232428')}>{t('Eliminar')}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {error && <div style={{ color: '#ff6b6b', marginTop: 12 }}>{error}</div>}
    </div>
  );
};

export default OrdenCargosCrud;
