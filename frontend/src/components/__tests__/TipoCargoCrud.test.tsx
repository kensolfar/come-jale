import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TipoCargoCrud from '../TipoCargoCrud';
import * as tipoCargoService from '../../services/tipoCargoService';

jest.mock('../../services/tipoCargoService');
const mockTipoCargoService = tipoCargoService as jest.Mocked<typeof tipoCargoService>;

const mockCargos = [
  { id: 1, nombre: 'Servicio', descripcion: 'Cargo por servicio', monto: 500, tipo: 'SERVICIO' },
  { id: 2, nombre: 'Embalaje', descripcion: 'Cargo por empaque', monto: 200, tipo: 'EMBALAJE' },
];
const DUMMY_TOKEN = 'test-token';

describe('TipoCargoCrud', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTipoCargoService.getTipoCargos.mockResolvedValue(mockCargos);
    mockTipoCargoService.createTipoCargo.mockImplementation(async (data) => ({ ...data, id: 3 }) as any);
    mockTipoCargoService.updateTipoCargo.mockImplementation(async (_id, data) => data as any);
    mockTipoCargoService.deleteTipoCargo.mockResolvedValue({ ok: true });
  });

  it('renderiza la lista de tipos de cargo con monto y tipo', async () => {
    render(<TipoCargoCrud token={DUMMY_TOKEN} />);
    expect(await screen.findByText('SERVICIO')).toBeInTheDocument();
    expect(screen.getByText('EMBALAJE')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  it('permite crear un nuevo tipo de cargo', async () => {
    render(<TipoCargoCrud token={DUMMY_TOKEN} />);
    await waitFor(() => expect(screen.queryByText('Servicio')).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText(/Nombre/i), { target: { value: 'Transporte' } });
    fireEvent.change(screen.getByPlaceholderText(/Monto/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/Tipo/i), { target: { value: 'TRANSPORTE' } });
    fireEvent.click(screen.getByText(/Agregar/i));
    await waitFor(() => expect(mockTipoCargoService.createTipoCargo).toHaveBeenCalled());
  });

  it('permite editar un tipo de cargo existente', async () => {
    render(<TipoCargoCrud token={DUMMY_TOKEN} />);
    await waitFor(() => expect(screen.queryByText('Servicio')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText(/Editar/i)[0]);
    fireEvent.change(screen.getByPlaceholderText(/Monto/i), { target: { value: '600' } });
    fireEvent.click(screen.getByText(/Actualizar/i));
    await waitFor(() => expect(mockTipoCargoService.updateTipoCargo).toHaveBeenCalled());
  });

  it('permite eliminar un tipo de cargo', async () => {
    window.confirm = jest.fn(() => true);
    render(<TipoCargoCrud token={DUMMY_TOKEN} />);
    await waitFor(() => expect(screen.queryByText('Servicio')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText(/Eliminar/i)[0]);
    await waitFor(() => expect(mockTipoCargoService.deleteTipoCargo).toHaveBeenCalled());
  });

  it('valida que nombre y monto sean obligatorios', async () => {
    render(<TipoCargoCrud token={DUMMY_TOKEN} />);
    await waitFor(() => expect(screen.queryByText('Servicio')).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText(/Nombre/i), { target: { value: '' } });
    fireEvent.change(screen.getByPlaceholderText(/Monto/i), { target: { value: '' } });
    fireEvent.click(screen.getByText(/Agregar/i));
    await waitFor(() => expect(mockTipoCargoService.createTipoCargo).not.toHaveBeenCalled());
  });

  it('muestra un mensaje de error si la carga de cargos falla', async () => {
    mockTipoCargoService.getTipoCargos.mockRejectedValueOnce(new Error('Network error'));
    render(<TipoCargoCrud token={DUMMY_TOKEN} />);
    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });
});
