"use client";

import { useRouter } from 'next/navigation';
import { Coffee, ShoppingCart, Package, Users, BarChart3, Settings, LogOut, ClipboardList } from 'lucide-react';
import logo from '@/assets/logo.png';

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
      // router.push('/orders/new');
      alert('Funcionalidad de órdenes en desarrollo');
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
    <div className="min-h-screen" style={{ backgroundColor: '#f5f1ed' }}>
      {/* Header */}
      <header className="shadow-md" style={{ backgroundColor: '#3d2817' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logo.src} alt="Café Latte" className="w-16 h-16 object-contain" />
              <div>
                <h1 className="text-2xl" style={{ color: '#ffffff', fontFamily: 'var(--font-brand)' }}>
                  Café Latte
                </h1>
                <p className="text-sm" style={{ color: '#c5a880', fontFamily: 'var(--font-body)' }}>
                  Sistema de Gestión
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm" style={{ color: '#ffffff' }}>
                  Bienvenido/a
                </p>
                <p className="font-medium" style={{ color: '#c5a880' }}>
                  {username}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:opacity-80"
                style={{ 
                  backgroundColor: '#8b7355',
                  color: '#ffffff'
                }}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl mb-2" style={{ color: '#3d2817' }}>
            Panel de Control
          </h2>
          <p style={{ color: '#8b7355' }}>
            Selecciona una opción para comenzar
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => handleNavigate(item.view)}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all"
                style={{ 
                  borderLeft: '4px solid #a0826d'
                }}
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: '#f5f1ed' }}
                >
                  <Icon 
                    className="w-6 h-6" 
                    style={{ color: '#3d2817' }}
                  />
                </div>
                <h3 
                  className="mb-2"
                  style={{ color: '#3d2817' }}
                >
                  {item.label}
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: '#8b7355' }}
                >
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>

        
      </main>
    </div>
  );
}
