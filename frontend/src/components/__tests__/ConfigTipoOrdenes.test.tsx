import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConfigTipoOrdenes from '../ConfigTipoOrdenes';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockTiposOrden = [
  { id: 1, nombre: 'Salón', descripcion: 'Pedidos en salón', cargos: [1], impuestos: [1, 2] },
  { id: 2, nombre: 'Para llevar', descripcion: 'Pedidos para llevar', cargos: [], impuestos: [2] },
];
const mockCargos = [
  { id: 1, nombre: 'Servicio', descripcion: '' },
  { id: 2, nombre: 'Embalaje', descripcion: '' },
];
const mockImpuestos = [
  { id: 1, nombre: 'IVA', codigo: '01', tarifa: 13.0, es_exento: false },
  { id: 2, nombre: 'Exento', codigo: '02', tarifa: 0.0, es_exento: true },
];
const DUMMY_TOKEN = 'test-token';

describe('ConfigTipoOrdenes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mockear las respuestas de axios para cada endpoint
    mockedAxios.get.mockImplementation(url => {
      if (url.includes('/tipoorden/')) return Promise.resolve({ data: mockTiposOrden });
      if (url.includes('/ordenes-cargos/')) return Promise.resolve({ data: mockCargos });
      if (url.includes('/impuestos/')) return Promise.resolve({ data: mockImpuestos });
      return Promise.reject(new Error('not found'));
    });
    mockedAxios.post.mockResolvedValue({ data: { id: 3, nombre: 'Express', descripcion: 'Pedidos express', cargos: [], impuestos: [] } });
    mockedAxios.patch.mockImplementation((url, data) => {
      const id = parseInt(url.split('/').slice(-2)[0]);
      const found = mockTiposOrden.find(t => t.id === id);
      const base = found && typeof found === 'object' ? found : {};
      return Promise.resolve({ data: Object.assign({}, base, data) });
    });
    mockedAxios.delete.mockResolvedValue({ data: {} });
  });

  it('renderiza la lista de Tipos de Orden', async () => {
    render(<ConfigTipoOrdenes token={DUMMY_TOKEN} />);
    expect(await screen.findByText('Salón')).toBeInTheDocument();
    expect(screen.getByText('Para llevar')).toBeInTheDocument();
  });

  it('muestra los cargos e impuestos asociados correctamente', async () => {
    render(<ConfigTipoOrdenes token={DUMMY_TOKEN} />);
    expect(await screen.findByText('Servicio')).toBeInTheDocument();
    expect(screen.getByText(/IVA/)).toBeInTheDocument();
  });

  it('permite agregar un nuevo Tipo de Orden', async () => {
    render(<ConfigTipoOrdenes token={DUMMY_TOKEN} />);
    await waitFor(() => expect(screen.queryByText('Cargando...')).not.toBeInTheDocument());
    fireEvent.click(screen.getByText(/Agregar Tipo de Orden/i));
    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'Express' } });
    fireEvent.change(screen.getByLabelText(/Descripción/i), { target: { value: 'Pedidos express' } });
    fireEvent.click(screen.getByText(/Guardar/i));
    // Esperar a que el formulario desaparezca
    await waitFor(() => expect(screen.queryByLabelText(/Nombre/i)).not.toBeInTheDocument());
    // Buscar 'Express' en la lista de tipos de orden (no en el input)
    expect(screen.getByText('Express')).toBeInTheDocument();
  });

  it('permite editar cargos e impuestos asociados', async () => {
    render(<ConfigTipoOrdenes token={DUMMY_TOKEN} />);
    fireEvent.click(await screen.findByTestId('edit-tipoorden-1'));
    fireEvent.click(screen.getByLabelText('Embalaje'));
    fireEvent.click(screen.getByText(/Guardar/i));
    await waitFor(() => expect(screen.getByText('Embalaje')).toBeInTheDocument());
  });

  it('muestra errores de validación y de API', async () => {
    mockedAxios.post.mockRejectedValueOnce({ response: { data: { nombre: ['Campo requerido'] } } });
    render(<ConfigTipoOrdenes token={DUMMY_TOKEN} />);
    await waitFor(() => expect(screen.queryByText('Cargando...')).not.toBeInTheDocument());
    fireEvent.click(screen.getByText(/Agregar Tipo de Orden/i));
    fireEvent.click(screen.getByText(/Guardar/i));
    expect(await screen.findByText('Campo requerido')).toBeInTheDocument();
  });

  it('solo permite acceso a usuarios admin', async () => {
    mockedAxios.get.mockRejectedValueOnce({ response: { data: { detail: 'Acceso restringido' } } });
    render(<ConfigTipoOrdenes token={DUMMY_TOKEN} />);
    expect(await screen.findByText(/Acceso restringido/i)).toBeInTheDocument();
  });
});
