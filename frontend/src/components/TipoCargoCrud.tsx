import React, { useEffect, useState, useCallback } from 'react';
import { getTipoCargos, createTipoCargo, updateTipoCargo, deleteTipoCargo } from '../services/tipoCargoService';
import type { TipoCargo } from '../services/tipoCargoService';
import { useTranslation } from 'react-i18next';

export interface TipoCargoForm {
  nombre: string;
  descripcion: string;
  monto: string | number;
  tipo: string;
}

const initialForm: TipoCargoForm = { nombre: '', descripcion: '', monto: '', tipo: 'SERVICIO' };

const TipoCargoCrud = ({ token }: { token: string }) => {
  const { t } = useTranslation();
  const [cargos, setCargos] = useState<TipoCargo[]>([]);
  const [form, setForm] = useState<TipoCargoForm>(initialForm);
  const [edit, setEdit] = useState<TipoCargo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCargos = useCallback(async () => {
    try {
      const data = await getTipoCargos(token);
      setCargos(data);
      setError(null);
    } catch {
      setError(t('error_fetching'));
    }
  }, [token, t]);

  useEffect(() => { fetchCargos(); }, [fetchCargos]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.monto) {
      setError('cargos_mandatory_name_ammount');
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
    if (!window.confirm(t('cargos_confirm_delete'))) return;
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
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <input name="nombre" value={form.nombre} onChange={handleChange} placeholder={t('name')} required style={{ flex: 1, minWidth: 120 }} />
        <input name="descripcion" value={form.descripcion} onChange={handleChange} placeholder={t('description')} style={{ flex: 2, minWidth: 180 }} />
        <label htmlFor="tipo" style={{ margin: 0 }}>Tipo</label>
        <select id="tipo" name="tipo" value={form.tipo} onChange={handleChange} style={{ width: 120 }}>
          <option value="SERVICIO">{t('service')}</option>
          <option value="EMBALAJE">{t('packaging')}</option>
          <option value="TRANSPORTE">{t('delivery')}</option>
          <option value="PROPINA">{t('tip')}</option>
          <option value="OTRO">{t('other')}</option>
        </select>
        <input name="monto" value={form.monto} onChange={handleChange} placeholder={t('charge')} type="number" min="0" required style={{ width: 100 }} />
        <button type="submit" style={{ background: '#8DAA91', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontWeight: 700, fontSize: 15, transition: 'background 0.2s', cursor: 'pointer' }}>{edit ? t('update') : t('add')}</button>
        {edit && <button type="button" onClick={handleCancel} style={{ background: '#232428', color: '#fff', border: '1.5px solid #8DAA91', borderRadius: 8, padding: '7px 16px', fontWeight: 700, fontSize: 15, transition: 'background 0.2s', cursor: 'pointer' }}>{t('cancel')}</button>}
      </form>
      <table style={{ width: '100%', background: '#18191b', color: '#fff', borderRadius: 8, overflow: 'hidden', fontSize: 15 }}>
        <thead>
          <tr style={{ background: '#232428', color: '#8DAA91' }}>
            <th style={{ padding: '10px 8px' }}>{t('name')}</th>
            <th style={{ padding: '10px 8px' }}>{t('description')}</th>
            <th style={{ padding: '10px 8px' }}>{t('type')}</th>
            <th style={{ padding: '10px 8px' }}>{t('charge')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cargos.length === 0 ? (
            <tr><td colSpan={5} style={{ textAlign: 'center', color: '#bdbdbd', padding: 16 }}>{t('no_cargos')}</td></tr>
          ) : (
            cargos.map(cargo => (
              <tr key={cargo.id} style={{ borderBottom: '1px solid #232428' }}>
                <td style={{ padding: '8px 8px' }}>{cargo.nombre}</td>
                <td style={{ padding: '8px 8px' }}>{cargo.descripcion || '-'}</td>
                <td style={{ padding: '8px 8px' }}>{cargo.tipo}</td>
                <td style={{ padding: '8px 8px' }}>{cargo.monto}</td>
                <td style={{ padding: '8px 8px', display: 'flex', gap: 6 }}>
                  <button onClick={() => handleEdit(cargo)} style={{ background: '#8DAA91', color: '#fff', border: 'none', borderRadius: 8, padding: '5px 14px', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'background 0.2s' }}>{t('edit')}</button>
                  <button onClick={() => handleDelete(cargo.id)} style={{ background: '#232428', color: '#ff6b6b', border: '1.5px solid #ff6b6b', borderRadius: 8, padding: '5px 14px', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'background 0.2s' }}>{t('remove')}</button>
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
