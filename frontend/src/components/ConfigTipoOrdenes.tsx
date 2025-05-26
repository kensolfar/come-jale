import React, { useEffect, useState } from 'react';
import {
  getTiposOrden,
  getCargos,
  getImpuestos,
  createTipoOrden,
  updateTipoOrden,
  deleteTipoOrden,
} from '../services/tipoOrdenService';

interface TipoOrden {
  id: number;
  nombre: string;
  descripcion: string;
  cargos: number[];
  impuestos: number[];
}
interface Cargo {
  id: number;
  nombre: string;
  descripcion: string;
  monto: number;
  tipo: string;
}
interface Impuesto {
  id: number;
  nombre: string;
  codigo: string;
  tarifa: number;
  es_exento: boolean;
}

interface ConfigTipoOrdenesProps {
  token: string;
}

const ConfigTipoOrdenes: React.FC<ConfigTipoOrdenesProps> = ({ token }) => {
  const [tiposOrden, setTiposOrden] = useState<TipoOrden[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [impuestos, setImpuestos] = useState<Impuesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<TipoOrden>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [to, c, i] = await Promise.all([
          getTiposOrden(token),
          getCargos(token),
          getImpuestos(token),
        ]);
        setTiposOrden(to);
        setCargos(c);
        setImpuestos(i);
        setIsAdmin(true);
      } catch (e: any) {
        // Mejor manejo de error para tests y axios
        const detail = e?.detail || e?.response?.data?.detail;
        if (detail && detail.includes('Acceso restringido')) {
          setIsAdmin(false);
        } else {
          setError('Error al cargar datos');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  const handleAdd = () => {
    setForm({ nombre: '', descripcion: '', cargos: [], impuestos: [] });
    setEditId(null);
    setShowForm(true);
    setFormError(null);
  };
  const handleEdit = (tipo: TipoOrden) => {
    setForm({ ...tipo });
    setEditId(tipo.id);
    setShowForm(true);
    setFormError(null);
  };
  const handleDelete = async (id: number) => {
    await deleteTipoOrden(id, token);
    setTiposOrden(tiposOrden.filter(t => t.id !== id));
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleMultiSelect = (name: 'cargos' | 'impuestos', id: number) => {
    const arr = form[name] as number[] || [];
    setForm({ ...form, [name]: arr.includes(id) ? arr.filter(i => i !== id) : [...arr, id] });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      if (editId) {
        const updated = await updateTipoOrden(editId, form, token);
        setTiposOrden(tiposOrden.map(t => t.id === editId ? updated : t));
      } else {
        const nuevo = await createTipoOrden(form, token);
        setTiposOrden([...tiposOrden, nuevo]);
      }
      setShowForm(false);
    } catch (err: any) {
      // Mejor manejo de error para tests y axios
      const data = err?.response?.data || err;
      setFormError(data.nombre?.[0] || data.detail || 'Error al guardar');
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!isAdmin) return <div>Acceso restringido</div>;
  if (error) return <div>{error}</div>;

  // Evitar errores si los datos no están listos
  if (!tiposOrden || !cargos || !impuestos) return null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h3 style={{ color: '#8DAA91', fontWeight: 700, margin: 0, fontSize: 20 }}>
          Configuración de Tipos de Orden
        </h3>
        <button
          onClick={handleAdd}
          style={{
            background: '#8DAA91', color: '#fff', border: 'none', borderRadius: 16, padding: '10px 22px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.10)', display: 'flex', alignItems: 'center', gap: 8, marginLeft: 16, marginRight: 0
          }}
        >
          <span style={{ fontSize: 22, fontWeight: 900, marginRight: 6 }}>+</span> Agregar Tipo de Orden
        </button>
      </div>
      {/* Lista de Tipos de Orden o mensaje vacío */}
      {tiposOrden.length === 0 ? (
        <div style={{ color: '#bdbdbd', fontSize: 17, textAlign: 'center', marginTop: 64 }}>
          No hay tipos de orden configurados.<br />
          Usa el botón <span style={{ fontWeight: 700, color: '#8DAA91' }}>Agregar Tipo de Orden</span> para crear uno nuevo.
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {tiposOrden.map(tipo => (
            <li key={tipo.id} style={{ background: '#18191b', borderRadius: 12, marginBottom: 18, padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.10)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ color: '#fff', fontSize: 17 }}>{tipo.nombre}</strong>
                  <span style={{ color: '#bdbdbd', marginLeft: 12 }}>{tipo.descripcion}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button data-testid={`edit-tipoorden-${tipo.id}`} onClick={() => handleEdit(tipo)} style={{ background: '#232428', color: '#8DAA91', border: '1.5px solid #8DAA91', borderRadius: 8, padding: '6px 14px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Editar</button>
                  <button onClick={() => handleDelete(tipo.id)} style={{ background: '#232428', color: '#ff6b6b', border: '1.5px solid #ff6b6b', borderRadius: 8, padding: '6px 14px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Eliminar</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 24, marginTop: 4 }}>
                <div>
                  <span style={{ color: '#bdbdbd', fontWeight: 600 }}>Cargos: </span>
                  {cargos.length > 0 && tipo.cargos.length > 0 ? (
                    cargos.filter(c => tipo.cargos.includes(c.id)).map(c => (
                      <span key={c.id} style={{ background: '#232428', color: '#8DAA91', borderRadius: 8, padding: '2px 10px', marginRight: 6, fontSize: 14 }}>{c.nombre}</span>
                    ))
                  ) : (
                    <span style={{ color: '#bdbdbd' }}>Ninguno</span>
                  )}
                </div>
                <div>
                  <span style={{ color: '#bdbdbd', fontWeight: 600 }}>Impuestos: </span>
                  {impuestos.length > 0 && tipo.impuestos.length > 0 ? (
                    impuestos.filter(i => tipo.impuestos.includes(i.id)).map(i => (
                      <span key={i.id} style={{ background: '#232428', color: '#8DAA91', borderRadius: 8, padding: '2px 10px', marginRight: 6, fontSize: 14 }}>{i.nombre}</span>
                    ))
                  ) : (
                    <span style={{ color: '#bdbdbd' }}>Ninguno</span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {/* Formulario flotante */}
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(24,25,27,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={handleSubmit} style={{ background: '#232428', borderRadius: 16, padding: 36, minWidth: 340, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative' }}>
            <h3 style={{ color: '#8DAA91', fontWeight: 700, margin: 0, fontSize: 19, marginBottom: 8 }}>{editId ? 'Editar Tipo de Orden' : 'Nuevo Tipo de Orden'}</h3>
            <div>
              <label style={{ color: '#bdbdbd', fontWeight: 600 }}>Nombre
                <input name="nombre" autoFocus value={form.nombre || ''} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid #8DAA91', background: '#18191b', color: '#fff', fontSize: 16, marginTop: 4 }} />
              </label>
            </div>
            <div>
              <label style={{ color: '#bdbdbd', fontWeight: 600 }}>Descripción
                <textarea name="descripcion" value={form.descripcion || ''} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid #8DAA91', background: '#18191b', color: '#fff', fontSize: 16, marginTop: 4, minHeight: 60 }} />
              </label>
            </div>
            <div>
              <label style={{ color: '#bdbdbd', fontWeight: 600, marginBottom: 4 }}>Cargos</label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 10,
                  marginTop: 4,
                  marginBottom: 8,
                }}
              >
                {cargos.map(c => {
                  const checked = !!(form.cargos || []).includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleMultiSelect('cargos', c.id)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        background: checked ? '#232428' : 'transparent',
                        color: checked ? '#8DAA91' : '#bdbdbd',
                        border: checked ? '1.5px solid #8DAA91' : '1.5px solid #232428',
                        borderRadius: 8,
                        padding: '6px 14px',
                        fontWeight: 700,
                        fontSize: 15,
                        cursor: 'pointer',
                        boxShadow: checked ? '0 2px 8px rgba(0,0,0,0.10)' : 'none',
                        outline: 'none',
                        transition: 'all 0.15s',
                        minWidth: 0,
                        minHeight: 40,
                      }}
                      data-testid={`cargo-btn-${c.id}`}
                    >
                      <span data-testid={`cargo-nombre-${c.id}`} style={{ fontWeight: 700 }}>{c.nombre}</span>
                      <span data-testid={`cargo-monto-${c.id}`} style={{ color: '#bdbdbd', fontSize: 12 }}>₡{Number(c.monto).toFixed(0)}</span>
                      <span data-testid={`cargo-tipo-${c.id}`} style={{ color: '#bdbdbd', fontSize: 12 }}>{c.tipo}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label style={{ color: '#bdbdbd', fontWeight: 600, marginBottom: 4 }}>Impuestos</label>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 10,
                  marginTop: 4,
                }}
              >
                {impuestos.map(i => {
                  const checked = !!(form.impuestos || []).includes(i.id);
                  return (
                    <button
                      key={i.id}
                      type="button"
                      onClick={() => handleMultiSelect('impuestos', i.id)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        background: checked ? '#232428' : 'transparent',
                        color: checked ? '#8DAA91' : '#bdbdbd',
                        border: checked ? '1.5px solid #8DAA91' : '1.5px solid #232428',
                        borderRadius: 8,
                        padding: '6px 14px',
                        fontWeight: 700,
                        fontSize: 15,
                        cursor: 'pointer',
                        boxShadow: checked ? '0 2px 8px rgba(0,0,0,0.10)' : 'none',
                        outline: 'none',
                        transition: 'all 0.15s',
                        minWidth: 0,
                        minHeight: 40,
                      }}
                      data-testid={`impuesto-btn-${i.id}`}
                    >
                      <span style={{ fontWeight: 700 }}>{i.nombre}</span>
                      <span style={{ color: '#bdbdbd', fontSize: 12 }}>Tarifa: {i.tarifa}% {i.es_exento ? '(Exento)' : ''}</span>
                      <span style={{ color: '#bdbdbd', fontSize: 12 }}>Código: {i.codigo}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            {formError && <div style={{ color: '#ff6b6b', fontWeight: 600, marginTop: 2 }}>{formError}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 8 }}>
              <button type="submit" style={{ background: '#8DAA91', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 28px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>Guardar</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: '#232428', color: '#8DAA91', border: '1.5px solid #8DAA91', borderRadius: 12, padding: '10px 28px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ConfigTipoOrdenes;
