import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ConfigTabs from '../ConfigTabs';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Helper to get tab button by its label
function getTabButton(label: string) {
  return screen.getAllByText(new RegExp(label, 'i')).find(
    el => el.tagName === 'BUTTON'
  );
}

describe('ConfigTabs', () => {
  const config = { nombre_restaurante: 'Test', direccion: 'Dir', telefono: '123', idioma: 'es', logo: '', descripcion: '' };
  const setConfig = jest.fn();
  const setIdioma = jest.fn();
  const token = 'fake-token';

  it('renders tabs and switches between them', async () => {
    render(<ConfigTabs config={config} setConfig={setConfig} setIdioma={setIdioma} loading={false} token={token} />);
    expect(getTabButton('General')).toBeInTheDocument();
    expect(getTabButton('Impuestos')).toBeInTheDocument();
    expect(getTabButton('Cargos')).toBeInTheDocument();
    // General tab by default
    expect(screen.getByLabelText(/Nombre del restaurante/i)).toBeInTheDocument();
    // Switch to Impuestos
    const impuestosBtn = getTabButton('Impuestos');
    expect(impuestosBtn).toBeDefined();
    fireEvent.click(impuestosBtn!);
    // Esperar a que el contenido de la pestaña Impuestos esté visible (por ejemplo, un input o label único)
    await waitFor(() => expect(screen.getByRole('heading', { name: /Impuestos/i })).toBeInTheDocument());
    // Switch to Cargos
    const cargosBtn = getTabButton('Cargos');
    expect(cargosBtn).toBeDefined();
    fireEvent.click(cargosBtn!);
    await waitFor(() => expect(screen.getByRole('heading', { name: /Cargos/i })).toBeInTheDocument());
  });
});
