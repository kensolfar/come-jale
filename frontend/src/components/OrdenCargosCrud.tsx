import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCargos, createCargo, updateCargo, deleteCargo } from '../services/api';

const OrdenCargosCrud = ({ token }: { token: string }) => {
  const { t } = useTranslation();
  const [cargos, setCargos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<any | null>(null);
  const [form, setForm] = useState<any>({ nombre: '', tipo: 'SERVICIO', monto: '', porcentaje: '', es_impuesto: false });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm({ 
      ...form, 
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value 
    });
  };

  const handleEdit = (cargo: any) => {
    setEdit(cargo);
    setForm({ ...cargo });
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
    setForm({ nombre: '', tipo: 'SERVICIO', monto: '', porcentaje: '', es_impuesto: false });
    fetchCargos();
  };

  return (
    <div style={{ padding: 24 }}>
      <h3 style={{ color: '#8DAA91', fontWeight: 700 }}>{t('Cargos')}</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <input name="nombre" value={form.nombre} onChange={handleChange} placeholder={t('Nombre')} required style={{ flex: 1, minWidth: 120 }} />
        <select name="tipo" value={form.tipo} onChange={handleChange} style={{ width: 120 }}>
          <option value="SERVICIO">{t('Servicio')}</option>
          <option value="EMBALAJE">{t('Embalaje')}</option>
          <option value="TRANSPORTE">{t('Transporte')}</option>
          <option value="OTRO">{t('Otro')}</option>
        </select>
        <input name="monto" value={form.monto} onChange={handleChange} placeholder={t('Monto')} type="number" min="0" required style={{ width: 80 }} />
        <input name="porcentaje" value={form.porcentaje} onChange={handleChange} placeholder={t('Porcentaje')} type="number" min="0" max="100" style={{ width: 80 }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <input type="checkbox" name="es_impuesto" checked={form.es_impuesto} onChange={handleChange} /> {t('¿Es impuesto?')}
        </label>
        <button type="submit" style={{ background: '#8DAA91', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700 }}>{edit ? t('Actualizar') : t('Agregar')}</button>
        {edit && <button type="button" onClick={() => { setEdit(null); setForm({ nombre: '', tipo: 'SERVICIO', monto: '', porcentaje: '', es_impuesto: false }); }} style={{ background: '#232428', color: '#fff', border: '1.5px solid #8DAA91', borderRadius: 8, padding: '8px 18px', fontWeight: 700 }}>{t('Cancelar')}</button>}
      </form>
      <table style={{ width: '100%', background: '#18191b', color: '#fff', borderRadius: 8, overflow: 'hidden' }}>
        <thead>
          <tr style={{ background: '#232428', color: '#8DAA91' }}>
            <th>{t('Nombre')}</th>
            <th>{t('Tipo')}</th>
            <th>{t('Monto')}</th>
            <th>{t('Porcentaje')}</th>
            <th>{t('¿Es impuesto?')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cargos.map(cargo => (
            <tr key={cargo.id}>
              <td>{cargo.nombre}</td>
              <td>{t(cargo.tipo)}</td>
              <td>{cargo.monto}</td>
              <td>{cargo.porcentaje || '-'}</td>
              <td>{cargo.es_impuesto ? t('Sí') : t('No')}</td>
              <td>
                <button onClick={() => handleEdit(cargo)} style={{ marginRight: 8 }}>{t('Editar')}</button>
                <button onClick={() => handleDelete(cargo.id)} style={{ color: '#ff6b6b' }}>{t('Eliminar')}</button>
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
