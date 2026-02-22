'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setToken, getToken } from '@/lib/auth';
import { api, bootstrapAdmin, type LoginBody, type LoginResponse, type BootstrapBody } from '@/lib/api';
import { Eye, EyeOff } from 'lucide-react';

import axios from 'axios';

function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    // 🔹 El servidor respondió (4xx / 5xx)
    if (err.response) {
      const status = err.response.status;
      const msg = err.response.data?.message;

      const str = Array.isArray(msg)
        ? msg.join(', ')
        : typeof msg === 'string'
          ? msg
          : '';

      if (status === 403) return str || 'Secret de bootstrap incorrecto.';
      if (status === 409) return str || 'Ya existe un administrador.';
      if (status === 400) return str || 'Datos inválidos.';
      if (status === 401) return 'No autorizado.';
      if (str) return str;

      return `Error ${status}`;
    }

    // 🔹 No hubo respuesta (CORS, backend caído, URL incorrecta)
    if (err.request) {
      console.error('No response received:', err.request);
      return 'No se pudo contactar con el backend (¿CORS o servidor apagado?).';
    }

    // 🔹 Error antes de enviar request
    console.error('Axios config error:', err.message);
    return err.message;
  }

  console.error('Unexpected error:', err);
  return 'Error inesperado.';
}

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [bootstrapOpen, setBootstrapOpen] = useState(false);
  const [bootstrapName, setBootstrapName] = useState('');
  const [bootstrapEmail, setBootstrapEmail] = useState('');
  const [bootstrapPassword, setBootstrapPassword] = useState('');
  const [bootstrapSecret, setBootstrapSecret] = useState('');
  const [showBootstrapSecret, setShowBootstrapSecret] = useState(false);
  const [bootstrapError, setBootstrapError] = useState('');
  const [bootstrapLoading, setBootstrapLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (getToken()) {
      router.replace('/');
      return;
    }
  }, [mounted, router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body: LoginBody = { email, password };
      const { data } = await api.post<LoginResponse>('/auth/login', body);
      setToken(data.access_token);
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleBootstrap(e: React.FormEvent) {
    e.preventDefault();
    setBootstrapError('');
    if (!bootstrapSecret.trim()) {
      setBootstrapError('El campo "Bootstrap secret" es obligatorio.');
      return;
    }
    setBootstrapLoading(true);
    try {
      const body: BootstrapBody = {
        name: bootstrapName.trim(),
        email: bootstrapEmail.trim(),
        password: bootstrapPassword,
      };
      const data = await bootstrapAdmin(bootstrapSecret.trim(), body);
      setToken(data.access_token);
      setBootstrapSecret('');
      router.push('/');
      router.refresh();
    } catch (err) {
      setBootstrapError(getErrorMessage(err));
    } finally {
      setBootstrapLoading(false);
    }
  }

  if (!mounted || getToken()) {
    return null;
  }

  const inputClass =
    'w-full rounded border border-black/30 bg-white px-3 py-2 text-black placeholder:text-black/50 focus:border-black focus:outline-none focus:ring-1 focus:ring-black';
  const labelClass = 'mb-1 block text-sm font-medium text-black';
  const btnPrimary =
    'w-full rounded border border-black bg-black px-4 py-2 font-medium text-white hover:bg-black/90 disabled:opacity-50';
  const btnSecondary =
    'rounded border border-black/30 bg-white px-4 py-2 text-black hover:bg-black/10';

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="rounded border border-black/20 bg-white p-6">
          <h1 className="mb-6 text-xl font-semibold text-black">Admin login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className={labelClass}>
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className={inputClass}
              />
            </div>
            {error && (
              <p className="text-sm text-black/80" role="alert">
                {error}
              </p>
            )}
            <button type="submit" disabled={loading} className={btnPrimary}>
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>

        <div className="rounded border border-black/20 bg-white p-6">
          <button
            type="button"
            onClick={() => setBootstrapOpen((o) => !o)}
            className="flex w-full items-center justify-between text-left text-sm font-medium text-black hover:opacity-80"
          >
            Create first admin
            <span className="text-black/60">{bootstrapOpen ? '▼' : '▶'}</span>
          </button>
          {bootstrapOpen && (
            <form onSubmit={handleBootstrap} className="mt-4 space-y-4 border-t border-black/20 pt-4">
              <p className="text-xs text-black/70">
                Solo funciona si no existe ningún admin. Usa el mismo valor que{' '}
                <code className="rounded bg-black/10 px-1">ADMIN_BOOTSTRAP_SECRET</code> del
                backend.
              </p>
              <div>
                <label className={labelClass}>Nombre</label>
                <input
                  type="text"
                  value={bootstrapName}
                  onChange={(e) => setBootstrapName(e.target.value)}
                  required
                  maxLength={200}
                  className={inputClass}
                  placeholder="Nombre del admin"
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={bootstrapEmail}
                  onChange={(e) => setBootstrapEmail(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className={labelClass}>Contraseña (mín. 8)</label>
                <input
                  type="password"
                  value={bootstrapPassword}
                  onChange={(e) => setBootstrapPassword(e.target.value)}
                  required
                  minLength={8}
                  maxLength={128}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Bootstrap secret</label>
                <div className="relative">
                  <input
                    type={showBootstrapSecret ? 'text' : 'password'}
                    value={bootstrapSecret}
                    onChange={(e) => setBootstrapSecret(e.target.value)}
                    className={`${inputClass} pr-10`}
                    placeholder="Valor de ADMIN_BOOTSTRAP_SECRET"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowBootstrapSecret((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-black/60 hover:bg-black/10 hover:text-black"
                    aria-label={showBootstrapSecret ? 'Ocultar secret' : 'Mostrar secret'}
                  >
                    {showBootstrapSecret ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              {bootstrapError && (
                <p className="text-sm text-black/80" role="alert">
                  {bootstrapError}
                </p>
              )}
              <button type="submit" disabled={bootstrapLoading} className={btnSecondary}>
                {bootstrapLoading ? 'Creando…' : 'Crear primer admin'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
