"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import logo from '@/assets/logo.png';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { authenticate } from '@/lib/actions';

export function Login() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);



  return (
    <div className="min-h-screen flex">
      {/* Lado Izquierdo - Logo */}
      <div 
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 bg-[#A67C52]"
      >
        <div className="max-w-md w-full">
          <img 
            src={logo.src} 
            alt="Café Latte" 
            className="w-full h-auto object-contain mb-8"
          />
          <div className="flex items-center justify-center gap-4 mb-4">
            <h2 className="text-4xl font-bold tracking-widest text-white" style={{ fontFamily: 'var(--font-body)' }}>
              CAFE
            </h2>
            <h2 className="text-6xl text-center text-white" style={{ fontFamily: 'var(--font-brand)' }}>
              Latte
            </h2>
          </div>
          <p className="text-center text-lg text-[#F0E0CD]" style={{ fontFamily: 'var(--font-body)' }}>
            Sistema de Gestión para Personal
          </p>
        </div>
      </div>

      {/* Lado Derecho - Formulario */}
      <div 
        className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F0E0CD]"
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
                <CardTitle>
                    <div className="flex items-center justify-center gap-4 mb-4">
            <h2 className="text-4xl font-bold tracking-widest text-white" style={{ fontFamily: 'var(--font-body)' }}>
              CAFE
            </h2>
            <h2 className="text-6xl text-center text-white" style={{ fontFamily: 'var(--font-brand)' }}>
              Latte
            </h2>
          </div>
                </CardTitle>
                <CardDescription className="text-center text-[#756046]">
                    Ingresa tus credenciales para acceder al sistema
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={async (e) => {
                    e.preventDefault();
                    setIsLoading(true);
                    setError('');
                    
                    const formData = new FormData(e.currentTarget);
                    
                    try {
                        // Pass plain object instead of FormData to actions if needed, 
                        // but actions accept FormData directly.
                        // However, spread above created an object if not careful.
                        // Correct usage: pass formData directly.
                        const result = await authenticate(undefined, formData);
                        
                        if (result) {
                            setError(result);
                            setIsLoading(false);
                            return;
                        }
                        
                        // Access granted - redirect manual just in case
                        router.push('/menu');
                        router.refresh();
                        
                    } catch (err) {
                        console.error("Login error:", err);
                        setError("Ocurrió un error inesperado.");
                        setIsLoading(false);
                    }
                }} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username" className="text-[#402E24]">Usuario</Label>
                        <Input 
                            id="username" 
                            name="username"
                            type="text" 
                            placeholder="Ingresa tu usuario"
                            required
                            className="border-[#B68847] focus-visible:ring-[#A67C52]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-[#402E24]">Contraseña</Label>
                        <Input 
                            id="password" 
                            name="password"
                            type="password" 
                            placeholder="Ingresa tu contraseña"
                            required
                            className="border-[#B68847] focus-visible:ring-[#A67C52]"
                        />
                    </div>
                    
                    {error && (
                        <div className="p-3 rounded-lg text-sm bg-destructive/10 text-destructive text-center">
                            {error}
                        </div>
                    )}

                    <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-[#402E24] hover:bg-[#402E24]/90 text-white"
                        size="lg"
                    >
                        {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
                    </Button>
                </form>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
