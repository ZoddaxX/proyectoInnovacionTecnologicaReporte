import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('riq_token'));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('riq_user')); } catch { return null; }
  });
  const [hasStore, setHasStore] = useState(() => localStorage.getItem('riq_has_store') === 'true');

  function login(data) {
    localStorage.setItem('riq_token', data.token);
    localStorage.setItem('riq_user', JSON.stringify({ name: data.name }));
    localStorage.setItem('riq_has_store', String(data.hasStore));
    setToken(data.token);
    setUser({ name: data.name });
    setHasStore(data.hasStore);
  }

  function logout() {
    localStorage.removeItem('riq_token');
    localStorage.removeItem('riq_user');
    localStorage.removeItem('riq_has_store');
    setToken(null);
    setUser(null);
    setHasStore(false);
  }

  function markHasStore() {
    localStorage.setItem('riq_has_store', 'true');
    setHasStore(true);
  }

  return (
    <AuthContext.Provider value={{ token, user, hasStore, login, logout, markHasStore }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function api(path, options = {}, token) {
  return fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  }).then(r => r.json());
}
