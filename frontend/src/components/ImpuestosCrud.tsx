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
    <div style={{ padding: 24 }}>
      <h3 style={{ color: '#8DAA91', fontWeight: 700 }}>{t('Impuestos')}</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <input name="nombre" value={form.nombre} onChange={handleChange} placeholder={t('Nombre')} required style={{ flex: 1, minWidth: 120 }} />
        <input name="codigo" value={form.codigo} onChange={handleChange} placeholder={t('Código')} required style={{ width: 80 }} />
        <input name="tarifa" value={form.tarifa} onChange={handleChange} placeholder={t('Tarifa %')} type="number" min="0" max="100" required style={{ width: 80 }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <input type="checkbox" name="es_exento" checked={form.es_exento} onChange={handleChange} /> {t('Exento')}
        </label>
        <button type="submit" style={{ background: '#8DAA91', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700 }}>{edit ? t('Actualizar') : t('Agregar')}</button>
        {edit && <button type="button" onClick={() => { setEdit(null); setForm({ nombre: '', codigo: '', tarifa: '', es_exento: false }); }} style={{ background: '#232428', color: '#fff', border: '1.5px solid #8DAA91', borderRadius: 8, padding: '8px 18px', fontWeight: 700 }}>{t('Cancelar')}</button>}
      </form>
      <table style={{ width: '100%', background: '#18191b', color: '#fff', borderRadius: 8, overflow: 'hidden' }}>
        <thead>
          <tr style={{ background: '#232428', color: '#8DAA91' }}>
            <th>{t('Nombre')}</th>
            <th>{t('Código')}</th>
            <th>{t('Tarifa')}</th>
            <th>{t('Exento')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {impuestos.map(imp => (
            <tr key={imp.id}>
              <td>{imp.nombre}</td>
              <td>{imp.codigo}</td>
              <td>{imp.tarifa}%</td>
              <td>{imp.es_exento ? t('Sí') : t('No')}</td>
              <td>
                <button onClick={() => handleEdit(imp)} style={{ marginRight: 8 }}>{t('Editar')}</button>
                <button onClick={() => handleDelete(imp.id)} style={{ color: '#ff6b6b' }}>{t('Eliminar')}</button>
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
