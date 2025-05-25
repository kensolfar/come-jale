import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getImpuestos, createImpuesto, updateImpuesto, deleteImpuesto } from '../services/api';

const ImpuestosCrud = ({ token }: { token: string }) => {
  const { t } = useTranslation();
  const [impuestos, setImpuestos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<any | null>(null);
  const [form, setForm] = useState<any>({ nombre: '', codigo: '', tarifa: '', es_exento: false });
  const [error, setError] = useState<string | null>(null);

  const fetchImpuestos = async () => {
    setLoading(true);
    try {
      const data = await getImpuestos(token);
      setImpuestos(data);
    } catch (e) {
      setError('Error al cargar impuestos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchImpuestos(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleEdit = (imp: any) => {
    setEdit(imp);
    setForm({ ...imp });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar impuesto?')) return;
    await deleteImpuesto(id, token);
    fetchImpuestos();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (edit) {
      await updateImpuesto(edit.id, form, token);
    } else {
      await createImpuesto(form, token);
    }
    setEdit(null);
    setForm({ nombre: '', codigo: '', tarifa: '', es_exento: false });
    fetchImpuestos();
  };

  return (
    <div style={{ padding: 0 }}>
      <h3 style={{ color: '#8DAA91', fontWeight: 700, margin: '24px 0 18px 0' }}>{t('Impuestos')}</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <input name="nombre" value={form.nombre} onChange={handleChange} placeholder={t('Nombre')} required style={{ flex: 1, minWidth: 120 }} />
        <input name="codigo" value={form.codigo} onChange={handleChange} placeholder={t('Código')} required style={{ width: 80 }} />
        <input name="tarifa" value={form.tarifa} onChange={handleChange} placeholder={t('Tarifa %')} type="number" min="0" max="100" required style={{ width: 80 }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, margin: 0 }}>
          <input type="checkbox" name="es_exento" checked={form.es_exento} onChange={handleChange} /> {t('Exento')}
        </label>
        <button type="submit" style={{ background: '#8DAA91', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontWeight: 700, fontSize: 15, transition: 'background 0.2s', cursor: 'pointer' }}>{edit ? t('Actualizar') : t('Agregar')}</button>
        {edit && <button type="button" onClick={() => { setEdit(null); setForm({ nombre: '', codigo: '', tarifa: '', es_exento: false }); }} style={{ background: '#232428', color: '#fff', border: '1.5px solid #8DAA91', borderRadius: 8, padding: '7px 16px', fontWeight: 700, fontSize: 15, transition: 'background 0.2s', cursor: 'pointer' }}>{t('Cancelar')}</button>}
      </form>
      <table style={{ width: '100%', background: '#18191b', color: '#fff', borderRadius: 8, overflow: 'hidden', fontSize: 15 }}>
        <thead>
          <tr style={{ background: '#232428', color: '#8DAA91' }}>
            <th style={{ padding: '10px 8px' }}>{t('Nombre')}</th>
            <th style={{ padding: '10px 8px' }}>{t('Código')}</th>
            <th style={{ padding: '10px 8px' }}>{t('Tarifa')}</th>
            <th style={{ padding: '10px 8px' }}>{t('Exento')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {impuestos.map(imp => (
            <tr key={imp.id} style={{ borderBottom: '1px solid #232428' }}>
              <td style={{ padding: '8px 8px' }}>{imp.nombre}</td>
              <td style={{ padding: '8px 8px' }}>{imp.codigo}</td>
              <td style={{ padding: '8px 8px' }}>{imp.tarifa}%</td>
              <td style={{ padding: '8px 8px' }}>{imp.es_exento ? t('Sí') : t('No')}</td>
              <td style={{ padding: '8px 8px', display: 'flex', gap: 6 }}>
                <button onClick={() => handleEdit(imp)} style={{ background: '#8DAA91', color: '#fff', border: 'none', borderRadius: 8, padding: '5px 14px', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => (e.currentTarget.style.background = '#6e8c74')} onMouseOut={e => (e.currentTarget.style.background = '#8DAA91')}>{t('Editar')}</button>
                <button onClick={() => handleDelete(imp.id)} style={{ background: '#232428', color: '#ff6b6b', border: '1.5px solid #ff6b6b', borderRadius: 8, padding: '5px 14px', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => (e.currentTarget.style.background = '#2d1a1a')} onMouseOut={e => (e.currentTarget.style.background = '#232428')}>{t('Eliminar')}</button>
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
