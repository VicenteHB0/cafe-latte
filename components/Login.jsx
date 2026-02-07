"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import logo from '@/assets/logo.png';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 bg-[#a0826d]"
      >
        <div className="max-w-md w-full">
          <img 
            src={logo.src} 
            alt="Café Latte" 
            className="w-full h-auto object-contain mb-8"
          />
          <h2 className="text-5xl text-center mb-4 text-white" style={{ fontFamily: 'var(--font-brand)' }}>
            Café Latte
          </h2>
          <p className="text-center text-lg text-[#f5f1ed]" style={{ fontFamily: 'var(--font-body)' }}>
            Sistema de Gestión para Personal
          </p>
        </div>
      </div>

      {/* Lado Derecho - Formulario */}
      <div 
        className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#f5f1ed]"
      >
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-none shadow-xl">
            <CardHeader className="space-y-1">
                {/* Logo móvil */}
                <div className="lg:hidden flex justify-center mb-4">
                    <img 
                    src={logo.src} 
                    alt="Café Latte" 
                    className="w-24 h-24 object-contain"
                    />
                </div>
                <CardTitle className="text-4xl text-center" style={{ fontFamily: 'var(--font-brand)', color: '#3d2817' }}>
                    Café Latte
                </CardTitle>
                <CardDescription className="text-center text-[#8b7355]">
                    Ingresa tus credenciales para acceder al sistema
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username" className="text-[#3d2817]">Usuario</Label>
                        <Input 
                            id="username" 
                            type="text" 
                            placeholder="Ingresa tu usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="border-[#c5a880] focus-visible:ring-[#a0826d]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-[#3d2817]">Contraseña</Label>
                        <Input 
                            id="password" 
                            type="password" 
                            placeholder="Ingresa tu contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="border-[#c5a880] focus-visible:ring-[#a0826d]"
                        />
                    </div>
                    
                    {error && (
                        <div className="p-3 rounded-lg text-sm bg-destructive/10 text-destructive text-center">
                            {error}
                        </div>
                    )}

                    <Button 
                        type="submit" 
                        className="w-full bg-[#3d2817] hover:bg-[#3d2817]/90 text-white"
                        size="lg"
                    >
                        Iniciar Sesión
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
                 {/* Nota de ayuda */}
                 <div className="w-full p-4 rounded-lg bg-secondary/50">
                    <p className="text-xs mb-2 font-medium text-[#8b7355]">
                    Usuarios de prueba:
                    </p>
                    <div className="text-xs space-y-1 text-[#a0826d]">
                    <p>• admin / admin123</p>
                    <p>• barista / cafe123</p>
                    <p>• gerente / latte123</p>
                    </div>
                </div>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
