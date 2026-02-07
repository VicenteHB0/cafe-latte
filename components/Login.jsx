"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import logo from '@/assets/logo.png';

export function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mock authentication - usuarios de ejemplo para el personal
    const validUsers = [
      { username: 'admin', password: 'admin123' },
      { username: 'barista', password: 'cafe123' },
      { username: 'gerente', password: 'latte123' }
    ];

    const user = validUsers.find(
      u => u.username === username && u.password === password
    );

    if (user) {
      setError('');
      // Store user in localStorage for simple persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', username);
        document.cookie = `user=${username}; path=/`;
      }
      router.push('/menu');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado Izquierdo - Logo */}
      <div 
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12"
        style={{ backgroundColor: '#a0826d' }}
      >
        <div className="max-w-md w-full">
          <img 
            src={logo.src} 
            alt="Café Latte" 
            className="w-full h-auto object-contain mb-8"
          />
          <h2 className="text-5xl text-center mb-4" style={{ color: '#ffffff', fontFamily: 'var(--font-brand)' }}>
            Café Latte
          </h2>
          <p className="text-center text-lg" style={{ color: '#f5f1ed', fontFamily: 'var(--font-body)' }}>
            Sistema de Gestión para Personal
          </p>
        </div>
      </div>

      {/* Lado Derecho - Formulario */}
      <div 
        className="w-full lg:w-1/2 flex items-center justify-center p-8"
        style={{ backgroundColor: '#f5f1ed' }}
      >
        <div className="w-full max-w-md">
          {/* Logo móvil */}
          <div className="lg:hidden flex justify-center mb-8">
            <img 
              src={logo.src} 
              alt="Café Latte" 
              className="w-32 h-32 object-contain"
            />
          </div>

          {/* Título */}
          <div className="mb-8">
            <h1 className="text-5xl mb-3" style={{ color: '#3d2817', fontFamily: 'var(--font-brand)' }}>
              Café Latte
            </h1>
            <p className="text-lg" style={{ color: '#8b7355', fontFamily: 'var(--font-body)' }}>
              Ingresa tus credenciales para acceder al sistema
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Usuario */}
            <div>
              <label htmlFor="username" className="block mb-2 text-sm" style={{ color: '#3d2817' }}>
                Usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-colors"
                style={{ 
                  borderColor: '#c5a880',
                  backgroundColor: '#ffffff',
                  color: '#3d2817'
                }}
                placeholder="Ingresa tu usuario"
                required
              />
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block mb-2 text-sm" style={{ color: '#3d2817' }}>
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-colors"
                style={{ 
                  borderColor: '#c5a880',
                  backgroundColor: '#ffffff',
                  color: '#3d2817'
                }}
                placeholder="Ingresa tu contraseña"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div 
                className="p-3 rounded-lg text-sm"
                style={{ 
                  backgroundColor: '#ffe5e5',
                  color: '#d32f2f'
                }}
              >
                {error}
              </div>
            )}

            {/* Botón de Login */}
            <button
              type="submit"
              className="w-full py-4 rounded-lg font-medium transition-all hover:opacity-90 hover:shadow-lg"
              style={{ 
                backgroundColor: '#3d2817',
                color: '#ffffff'
              }}
            >
              Iniciar Sesión
            </button>
          </form>

          {/* Nota de ayuda */}
          <div className="mt-8 p-4 rounded-lg" style={{ backgroundColor: '#ffffff' }}>
            <p className="text-xs mb-2" style={{ color: '#8b7355' }}>
              Usuarios de prueba:
            </p>
            <div className="text-xs space-y-1" style={{ color: '#a0826d' }}>
              <p>• admin / admin123</p>
              <p>• barista / cafe123</p>
              <p>• gerente / latte123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
