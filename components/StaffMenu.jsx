"use client";

import { useRouter } from 'next/navigation';
import { Coffee, ShoppingCart, Package, Users, BarChart3, Settings, LogOut, ClipboardList } from 'lucide-react';
import logo from '@/assets/logo-main.png';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function StaffMenu({ username = 'Usuario' }) {
  const router = useRouter();
  
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    }
    router.push('/login');
  };

  const handleNavigate = (view) => {
    if (view === 'products') {
      router.push('/products');
    } else if (view === 'orders') {
      router.push('/orders/new');
      // alert('Funcionalidad de órdenes en desarrollo');
    } else if (view === 'panel') {
      // router.push('/orders/panel');
      alert('Panel de órdenes en desarrollo');
    }
  };
  const menuItems = [
    { icon: ShoppingCart, label: 'Nueva Orden', description: 'Registrar pedido de cliente', view: 'orders' },
    { icon: ClipboardList, label: 'Panel de Órdenes', description: 'Ver pedidos en proceso', view: 'panel' },
    { icon: Coffee, label: 'Menú de Productos', description: 'Gestionar productos y precios', view: 'products' },
  ];

  return (
    <div className="min-h-screen bg-[#F0E0CD]">
      {/* Header */}
      <header className="shadow-md bg-[#756046]">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logo.src} alt="Café Latte" className="w-16 h-16 object-contain" />
              <div>
                <h1 className="text-2xl text-white" style={{ fontFamily: 'var(--font-brand)' }}>
                  Café Latte
                </h1>
                <p className="text-sm text-[#c5a880]" style={{ fontFamily: 'var(--font-body)' }}>
                  Sistema de Gestión
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-white">
                  Bienvenido/a
                </p>
                <p className="font-medium text-[#B68847]">
                  {username}
                </p>
              </div>
              <Button
                onClick={handleLogout}
                className="bg-[#756046] text-white hover:bg-[#756046]/90"
                size="sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl mb-2 text-[#402E24]">
            Panel de Control
          </h2>
          <p className="text-[#756046]">
            Selecciona una opción para comenzar
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card 
                key={index}
                onClick={() => handleNavigate(item.view)}
                className="cursor-pointer hover:shadow-xl transition-all border-l-4 border-l-[#A67C52] hover:bg-white/50"
              >
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center bg-[#F0E0CD]"
                    >
                    <Icon 
                        className="w-6 h-6 text-[#402E24]" 
                    />
                    </div>
                    <div>
                        <CardTitle className="text-lg text-[#402E24]">{item.label}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <CardDescription className="text-sm text-[#756046]">
                        {item.description}
                    </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
