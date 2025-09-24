'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await signIn('credentials', {
      username: usuario,
      password: contrasena,
      redirect: false,
    });
    if (res?.error) {
      setError(res.error);
    } else {
      window.location.href = '/';
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-stretch justify-center bg-gradient-to-br from-orange-500 via-black to-white">
      <div className="hidden md:flex md:w-2/3 lg:w-3/5 items-center justify-center relative">
        <img src="/placeholder-logo.png" alt="School of Rock Lima" className="absolute left-0 top-0 w-full h-full object-cover opacity-30" />
        <img src="/placeholder-logo.png" alt="School of Rock Lima" className="relative z-10 w-2/3 max-w-lg mx-auto" />
      </div>
      <div className="flex flex-col items-center justify-center w-full md:w-1/3 lg:w-2/5 min-h-screen">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-6 text-orange-500 text-center">Iniciar Sesión</h2>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Usuario o correo</label>
            <input
              type="text"
              value={usuario}
              onChange={e => setUsuario(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Contraseña</label>
            <input
              type="password"
              value={contrasena}
              onChange={e => setContrasena(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
          <button
            type="submit"
            className="w-full bg-orange-500 text-white font-bold py-2 rounded hover:bg-orange-600 transition"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}

