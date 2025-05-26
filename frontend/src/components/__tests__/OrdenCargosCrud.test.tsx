import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import OrdenCargosCrud from '../OrdenCargosCrud';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockCargos = [
  { id: 1, nombre: 'Servicio', descripcion: 'Cargo por servicio', monto: 500, tipo: 'SERVICIO' },
  { id: 2, nombre: 'Embalaje', descripcion: 'Cargo por empaque', monto: 200, tipo: 'EMBALAJE' },
];
const DUMMY_TOKEN = 'test-token';

describe('OrdenCargosCrud', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockResolvedValue({ data: mockCargos });
    mockedAxios.post.mockImplementation((_url, data) => {
      const obj = typeof data === 'object' ? data : {};
      return Promise.resolve({ data: { ...obj, id: 3 } });
    });
    mockedAxios.patch.mockImplementation((_url, data) => {
      const obj = typeof data === 'object' ? data : {};
      return Promise.resolve({ data: obj });
    });
    mockedAxios.delete.mockResolvedValue({ data: {} });
  });

  it('renderiza la lista de cargos con monto y tipo', async () => {
    render(<OrdenCargosCrud token={DUMMY_TOKEN} />);
    expect(await screen.findByText('Servicio')).toBeInTheDocument();
    expect(screen.getByText('Embalaje')).toBeInTheDocument();
    // Espera a que la tabla tenga filas
    await waitFor(() => expect(screen.getAllByRole('row').length).toBeGreaterThan(1));
    // Busca los montos en el DOM por texto, no por role
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  it('permite crear un nuevo cargo con nombre, monto y tipo', async () => {
    render(<OrdenCargosCrud token={DUMMY_TOKEN} />);
    await waitFor(() => expect(screen.queryByText('Servicio')).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText(/Nombre/i), { target: { value: 'Transporte' } });
    fireEvent.change(screen.getByPlaceholderText(/Monto/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/Tipo/i), { target: { value: 'TRANSPORTE' } });
    fireEvent.click(screen.getByText(/Agregar/i));
    await waitFor(() => expect(mockedAxios.post).toHaveBeenCalled());
  });

  it('permite editar un cargo existente', async () => {
    render(<OrdenCargosCrud token={DUMMY_TOKEN} />);
    await waitFor(() => expect(screen.queryByText('Servicio')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText(/Editar/i)[0]);
    fireEvent.change(screen.getByPlaceholderText(/Monto/i), { target: { value: '600' } });
    fireEvent.click(screen.getByText(/Actualizar/i));
    await waitFor(() => expect(mockedAxios.patch).toHaveBeenCalled());
  });

  it('permite eliminar un cargo', async () => {
    window.confirm = jest.fn(() => true);
    render(<OrdenCargosCrud token={DUMMY_TOKEN} />);
    await waitFor(() => expect(screen.queryByText('Servicio')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText(/Eliminar/i)[0]);
    await waitFor(() => expect(mockedAxios.delete).toHaveBeenCalled());
  });

  it('valida que nombre y monto sean obligatorios', async () => {
    render(<OrdenCargosCrud token={DUMMY_TOKEN} />);
    await waitFor(() => expect(screen.queryByText('Servicio')).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText(/Nombre/i), { target: { value: '' } });
    fireEvent.change(screen.getByPlaceholderText(/Monto/i), { target: { value: '' } });
    fireEvent.click(screen.getByText(/Agregar/i));
    // Espera a que no se haga el post
    await waitFor(() => expect(mockedAxios.post).not.toHaveBeenCalled());
  });
});
