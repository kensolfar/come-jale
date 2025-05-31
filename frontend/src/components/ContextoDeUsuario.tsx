import React, { createContext, useContext, useMemo } from 'react';
import { parseJwt } from "./utilsAuth";

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
  user: InformacionUsuario | null;
}

const ContextoDeUsuario = createContext<TipoContextoUsuario>({ user: null });

export const ProveedorUsuario: React.FC<{ token?: string; children: React.ReactNode }> = ({ token, children }) => {
  const user = useMemo(() => (token ? parseJwt(token) : null), [token]);
  return <ContextoDeUsuario.Provider value={{ user }}>{children}</ContextoDeUsuario.Provider>;
};

export function usarUsuario() {
  return useContext(ContextoDeUsuario);
}