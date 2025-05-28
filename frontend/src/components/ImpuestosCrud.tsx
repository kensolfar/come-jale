import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getImpuestos, createImpuesto, updateImpuesto, deleteImpuesto } from '../services/api';
import type { Impuesto } from '../services/tipoOrdenService';

export interface ImpuestoForm {
  nombre: string;
  codigo: string;
  tarifa: string | number;
  es_exento: boolean;
}

const initialForm: ImpuestoForm = { nombre: '', codigo: '', tarifa: '', es_exento: false };

const ImpuestosCrud = ({ token }: { token: string }) => {
  const { t } = useTranslation();
  const [impuestos, setImpuestos] = useState<Impuesto[]>([]);
  const [edit, setEdit] = useState<Impuesto | null>(null);
  const [form, setForm] = useState<ImpuestoForm>(initialForm);
  const [error, setError] = useState<string | null>(null);

  const fetchImpuestos = useCallback(async () => {
    try {
      const data = await getImpuestos(token);
      setImpuestos(data);
    } catch {
      setError('Error al cargar impuestos');
    }
  }, [token]);

  useEffect(() => { fetchImpuestos(); }, [fetchImpuestos]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleEdit = (imp: Impuesto) => {
    setEdit(imp);
    setForm({ ...imp, tarifa: imp.tarifa.toString() });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar impuesto?')) return;
    await deleteImpuesto(id, token);
    fetchImpuestos();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, tarifa: Number(form.tarifa) };
    if (edit) {
      await updateImpuesto(edit.id, payload, token);
    } else {
      await createImpuesto(payload, token);
    }
    setEdit(null);
    setForm(initialForm);
    fetchImpuestos();
  };

  return (
    <div style={{ padding: 0 }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <input name="nombre" value={form.nombre} onChange={handleChange} placeholder={t('name')} required style={{ flex: 1, minWidth: 120 }} />
        <input name="codigo" value={form.codigo} onChange={handleChange} placeholder={t('impuestos_code')} required style={{ width: 80 }} />
        <input name="tarifa" value={form.tarifa} onChange={handleChange} placeholder={t('impuestos_porcentage')} type="number" min="0" max="100" required style={{ width: 80 }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, margin: 0 }}>
          <input type="checkbox" name="es_exento" checked={form.es_exento} onChange={handleChange} /> {t('impuestos_exento')}
        </label>
        <button type="submit" style={{ background: '#8DAA91', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontWeight: 700, fontSize: 15, transition: 'background 0.2s', cursor: 'pointer' }}>{edit ? t('update') : t('add')}</button>
        {edit && <button type="button" onClick={() => { setEdit(null); setForm(initialForm); }} style={{ background: '#232428', color: '#fff', border: '1.5px solid #8DAA91', borderRadius: 8, padding: '7px 16px', fontWeight: 700, fontSize: 15, transition: 'background 0.2s', cursor: 'pointer' }}>{t('cancel')}</button>}
      </form>
      <table style={{ width: '100%', background: '#18191b', color: '#fff', borderRadius: 8, overflow: 'hidden', fontSize: 15 }}>
        <thead>
          <tr style={{ background: '#232428', color: '#8DAA91' }}>
            <th style={{ padding: '10px 8px' }}>{t('name')}</th>
            <th style={{ padding: '10px 8px' }}>{t('impuestos_code')}</th>
            <th style={{ padding: '10px 8px' }}>{t('impuestos_porcentage')}</th>
            <th style={{ padding: '10px 8px' }}>{t('impuestos_exento')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {impuestos.map(imp => (
            <tr key={imp.id} style={{ borderBottom: '1px solid #232428' }}>
              <td style={{ padding: '8px 8px' }}>{imp.nombre}</td>
              <td style={{ padding: '8px 8px' }}>{imp.codigo}</td>
              <td style={{ padding: '8px 8px' }}>{imp.tarifa}%</td>
              <td style={{ padding: '8px 8px' }}>{imp.es_exento ? t('yes') : t('no')}</td>
              <td style={{ padding: '8px 8px', display: 'flex', gap: 6 }}>
                <button onClick={() => handleEdit(imp)} style={{ background: '#8DAA91', color: '#fff', border: 'none', borderRadius: 8, padding: '5px 14px', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => (e.currentTarget.style.background = '#6e8c74')} onMouseOut={e => (e.currentTarget.style.background = '#8DAA91')}>{t('edit')}</button>
                <button onClick={() => handleDelete(imp.id)} style={{ background: '#232428', color: '#ff6b6b', border: '1.5px solid #ff6b6b', borderRadius: 8, padding: '5px 14px', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => (e.currentTarget.style.background = '#2d1a1a')} onMouseOut={e => (e.currentTarget.style.background = '#232428')}>{t('remove')}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {error && <div style={{ color: '#ff6b6b', marginTop: 12 }}>{error}</div>}
    </div>
  );
};

export default ImpuestosCrud;
