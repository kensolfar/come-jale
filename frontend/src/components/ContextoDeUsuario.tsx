import React, { createContext, useContext, useMemo } from 'react';
import { parseJwt } from "./utiles/utilesAuth";

export interface InformacionUsuario {
  first_name: string;
  last_name: string;
  username?: string;
  email?: string;
  is_superuser?: boolean;
  groups?: string[];
  [key: string]: any;
}

export interface TipoContextoUsuario {
  usuario: InformacionUsuario | null;
  ficha: string | null;
}

const ContextoDeUsuario = createContext<TipoContextoUsuario>({ usuario: null, ficha: null });

export const ProveedorUsuario: React.FC<{ token?: string; children: React.ReactNode }> = ({ token, children }) => {
  const usuario = useMemo(() => (token ? parseJwt(token) : null), [token]);
  return <ContextoDeUsuario.Provider value={{ usuario, ficha: token ?? null }}>{children}</ContextoDeUsuario.Provider>;
};

export function usarUsuario() {
  return useContext(ContextoDeUsuario);
}