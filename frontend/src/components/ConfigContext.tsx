import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

export interface Configuracion {
  idioma: string;
  nombre_restaurante: string;
  direccion: string;
  telefono: string;
  logo?: string;
  descripcion?: string;
}

interface ConfigContextProps {
  config: Configuracion | null;
  setConfig: (c: Configuracion) => void;
  loading: boolean;
  idioma: string;
  setIdioma: (lang: string) => void;
}

const ConfigContext = createContext<ConfigContextProps>({
  config: null,
  setConfig: () => {},
  loading: true,
  idioma: 'es',
  setIdioma: () => {},
});

export const ConfigProvider: React.FC<{ children: React.ReactNode; token?: string }> = ({ children, token }) => {
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [loading, setLoading] = useState(true);
  const { i18n } = useTranslation();

  useEffect(() => {
    async function fetchConfig() {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get('/api/configuracion/', { headers });
        setConfig(res.data);
        if (res.data.idioma) {
          i18n.changeLanguage(res.data.idioma);
        }
      } catch {
        setConfig(null);
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
    // eslint-disable-next-line
  }, [token]);

  const setIdioma = (lang: string) => {
    i18n.changeLanguage(lang);
    setConfig((prev) => prev ? { ...prev, idioma: lang } : prev);
    localStorage.setItem('i18nextLng', lang);
  };

  return (
    <ConfigContext.Provider value={{ config, setConfig, loading, idioma: i18n.language, setIdioma }}>
      {children}
    </ConfigContext.Provider>
  );
};

export function useConfig() {
  return useContext(ConfigContext);
}
