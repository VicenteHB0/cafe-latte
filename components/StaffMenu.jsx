"use client";

import { useRouter } from 'next/navigation';
import { Coffee, ShoppingCart, Package, Users, BarChart3, Settings, LogOut, ClipboardList, UtensilsCrossed } from 'lucide-react';
import logo from '@/assets/logo.png'; // Usar el logo del login para consistencia si es el mismo
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { logout } from '@/lib/actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function StaffMenu({ username = 'Usuario', role }) {
  const router = useRouter();
  
  const handleLogout = async () => {
    await logout();
  };

  const handleNavigate = (view) => {
    if (view === 'products') {
      router.push('/products');
    } else if (view === 'orders') {
      router.push('/orders/new');
    } else if (view === 'panel') {
      router.push('/orders/board');
    } else if (view === 'admin') {
      router.push('/admin');
    }
  };
  
  const menuItems = [
    { icon: ShoppingCart, label: 'Nueva Orden', description: 'Registrar pedido de cliente', view: 'orders' },
    { icon: ClipboardList, label: 'Panel de Órdenes', description: 'Ver pedidos en proceso', view: 'panel' },
    { icon: Coffee, label: 'Menú de Productos', description: 'Gestionar productos y precios', view: 'products' },
  ];

  if (role === 'admin') {
    menuItems.push({ icon: Users, label: 'Panel Admin', description: 'Gestión de usuarios', view: 'admin' });
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] relative overflow-hidden">
      {/* Header */}
      <header className="relative z-20 bg-[#402E24] shadow-lg">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-[#E5E5E5] p-2 rounded-full">
                <img src={logo.src} alt="Café Latte" className="w-12 h-12 object-contain" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                    <h5 className="text-2xl text-[#E5E5E5] font-bold tracking-widest" style={{ fontFamily: 'var(--font-body)' }}>
                        CAFE
                    </h5>
                    <span className="text-2xl text-[#E5E5E5]" style={{ fontFamily: 'var(--font-brand)' }}>Latte</span>
                </div>
                <p className="text-xs text-[#F0E0CD]/80" style={{ fontFamily: 'var(--font-body)' }}>
                  Sistema de Gestión
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-[#F0E0CD]/60 uppercase tracking-wider">
                  Bienvenido
                </p>
                <p className="font-bold text-white text-lg">
                  {username}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-[#F0E0CD] hover:text-white hover:bg-[#B68847]/20 transition-colors"
                    size="sm"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    <span className="hidden sm:inline">Cerrar Sesión</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white border-none shadow-xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-[#402E24] text-xl font-bold">¿Cerrar Sesión?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600">
                      ¿Estás seguro de que deseas salir del sistema? Tendrás que iniciar sesión nuevamente para acceder.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-gray-200 text-gray-600 hover:bg-gray-50">Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout} className="bg-[#402E24] text-white hover:bg-[#2b1f18]">
                      Cerrar Sesión
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-20 w-full px-6 py-12 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-12 text-center sm:text-left">
          <h2 className="text-4xl font-bold mb-3 text-[#402E24]" style={{ fontFamily: 'var(--font-brand)' }}>
            Panel de Control
          </h2>
          <p className="text-[#756046] text-lg max-w-2xl">
            Bienvenido al sistema. Selecciona una de las opciones disponibles para comenzar a trabajar.
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card 
                key={index}
                onClick={() => handleNavigate(item.view)}
                className="group cursor-pointer border-none shadow-xl bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden relative"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-[#A67C52] transition-all group-hover:w-full group-hover:opacity-10 z-0"></div>
                
                <CardHeader className="relative z-10 flex flex-col items-start gap-4 pb-2">
                    <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[#F5F5F5] group-hover:bg-[#402E24] transition-colors duration-300 shadow-inner"
                    >
                    <Icon 
                        className="w-8 h-8 text-[#402E24] group-hover:text-[#B68847] transition-colors duration-300" 
                    />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold text-[#402E24] mb-1">{item.label}</CardTitle>
                        <CardDescription className="text-sm font-medium text-[#A67C52]">
                            Acceso Rápido
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="relative z-10">
                    <p className="text-gray-500 text-sm leading-relaxed">
                        {item.description}
                    </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
