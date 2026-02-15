"use client";

import { ShoppingCart, Trash2, Banknote, CreditCard } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function OrderCart({ 
  orderItems, 
  nextOrderNumber, 
  paymentMethod, 
  setPaymentMethod,
  removeFromOrder,
  placeOrder,
  isEditMode
}) {
  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-2xl z-10 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#A67C52] bg-[#F0E0CD] shrink-0">
            <h2 className="font-bold text-[#402E24] text-lg flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" /> {isEditMode ? 'Editar Pedido' : 'Detalle del Pedido'}
            </h2>
            <div className="mt-2 text-[#756046]">
                <span className="text-3xl font-bold">
                    {isEditMode ? 'Editando...' : `Orden #${nextOrderNumber || '-'}`}
                </span>
            </div>
        </div>

        {/* Order Items List */}
        <ScrollArea className="flex-1 min-h-0 bg-white">
            <div className="p-4 space-y-3">
                {orderItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-[#B68847] opacity-50 py-10">
                        <ShoppingCart className="w-16 h-16 mb-2" />
                        <p>Orden vacía</p>
                    </div>
                ) : (
                    orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg border border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-[#402E24] text-lg">{item.quantity}x</span>
                                    <span className="font-bold text-[#402E24] text-lg">{item.name}</span>
                                </div>
                                {/* Modifiers */}
                                <div className="mt-1 space-y-1">
                                    {item.size && <div className="text-xs text-[#756046]">Tamaño: {item.size.label}</div>}
                                    {item.flavors?.length > 0 && <div className="text-xs text-[#756046]">Sabor: {item.flavors.join(', ')}</div>}
                                    {item.sauces?.length > 0 && <div className="text-xs text-[#756046]">Salsas: {item.sauces.join(', ')}</div>}
                                    {item.extras?.map((extra, i) => (
                                        <div key={i} className="text-xs text-[#756046]">+ {extra.name}</div>
                                    ))}
                                    {item.customizations?.map((note, i) => (
                                        <div key={i} className="text-xs text-[#A67C52] italic">"{note}"</div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className="font-bold text-[#402E24]">${item.price * item.quantity}</span>
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => removeFromOrder(item.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </ScrollArea>

        {/* Footer: Totals & Action */}
        <div className="p-4 bg-[#F0E0CD] border-t border-[#A67C52] space-y-4 shrink-0">
            <div className="flex justify-between items-end">
                <span className="text-[#756046] font-medium">Total</span>
                <span className="text-3xl font-bold text-[#402E24] transition-all duration-300">
                    ${calculateTotal()}
                </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
                <Button 
                    variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('cash')}
                    className={`w-full ${paymentMethod === 'cash' ? 'bg-[#402E24]' : 'border-[#402E24] text-[#402E24]'}`}
                    size="sm"
                >
                    <Banknote className="w-4 h-4 mr-2" /> Efectivo
                </Button>
                <Button 
                    variant={paymentMethod === 'card' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('card')}
                    className={`w-full ${paymentMethod === 'card' ? 'bg-[#402E24]' : 'border-[#402E24] text-[#402E24]'}`}
                    size="sm"
                >
                    <CreditCard className="w-4 h-4 mr-2" /> Tarjeta
                </Button>
            </div>

            <Button 
                className="w-full bg-[#402E24] hover:bg-[#2b1f18] text-white h-12 text-lg font-bold shadow-lg transition-all active:scale-95"
                disabled={orderItems.length === 0}
                onClick={placeOrder}
            >
                {isEditMode ? 'Actualizar Orden' : 'Confirmar Orden'}
            </Button>
        </div>
    </div>
  );
}
