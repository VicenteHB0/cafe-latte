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
    <div className="flex flex-col h-full bg-white shadow-2xl z-10 overflow-hidden border-l border-gray-100">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-white shrink-0">
            <h2 className="font-bold text-[#402E24] text-lg flex items-center gap-2">
                <div className="bg-[#F5F5F5] p-2 rounded-lg text-[#A67C52]">
                    <ShoppingCart className="w-5 h-5" /> 
                </div>
                {isEditMode ? 'Editar Pedido' : 'Detalle del Pedido'}
            </h2>
            <div className="mt-1 pl-11">
                <span className="text-2xl font-bold text-[#402E24]">
                    {isEditMode ? 'Editando...' : `Orden #${nextOrderNumber || '-'}`}
                </span>
            </div>
        </div>

        {/* Order Items List */}
        <ScrollArea className="flex-1 min-h-0 bg-[#FAFAFA]">
            <div className="p-4 space-y-3">
                {orderItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 py-20">
                        <ShoppingCart className="w-20 h-20 mb-4 stroke-1" />
                        <p className="text-lg font-medium">Orden vacía</p>
                        <p className="text-sm">Selecciona productos del menú</p>
                    </div>
                ) : (
                    orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-start p-4 bg-white rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex-1 mr-2">
                                <div className="flex items-start gap-3">
                                    <span className="flex items-center justify-center w-6 h-6 bg-[#402E24] text-white text-xs font-bold rounded-full shrink-0 mt-0.5">
                                        {item.quantity}
                                    </span>
                                    <div>
                                        <span className="font-bold text-[#402E24] text-base block leading-tight">{item.name}</span>
                                        {/* Modifiers */}
                                        <div className="mt-1 space-y-1">
                                            {item.size && <div className="text-xs text-gray-500 font-medium">Tamaño: {item.size.label}</div>}
                                            {item.flavors?.length > 0 && <div className="text-xs text-gray-500">Sabor: {item.flavors.join(', ')}</div>}
                                            {item.sauces?.length > 0 && <div className="text-xs text-gray-500">Salsas: {item.sauces.join(', ')}</div>}
                                            {item.extras?.map((extra, i) => (
                                                <div key={i} className="text-xs text-[#A67C52]">+ {extra.name}</div>
                                            ))}
                                            {item.customizations?.map((note, i) => (
                                                <div key={i} className="text-xs text-gray-400 italic">"{note}"</div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-3">
                                <span className="font-bold text-[#402E24]">${item.price * item.quantity}</span>
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => removeFromOrder(item.id)}
                                    className="text-gray-300 hover:text-red-500 hover:bg-red-50 h-8 w-8 p-0 rounded-full transition-colors"
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
        <div className="p-6 bg-white border-t border-gray-100 space-y-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-end">
                <span className="text-gray-500 font-medium">Total a Pagar</span>
                <span className="text-4xl font-bold text-[#402E24] transition-all duration-300">
                    ${calculateTotal()}
                </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                <Button 
                    variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('cash')}
                    className={`w-full h-10 ${
                        paymentMethod === 'cash' 
                        ? 'bg-[#402E24] hover:bg-[#2b1f18]' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <Banknote className="w-4 h-4 mr-2" /> Efectivo
                </Button>
                <Button 
                    variant={paymentMethod === 'card' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('card')}
                    className={`w-full h-10 ${
                        paymentMethod === 'card' 
                        ? 'bg-[#402E24] hover:bg-[#2b1f18]' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <CreditCard className="w-4 h-4 mr-2" /> Transferencia
                </Button>
            </div>

            <Button 
                className="w-full bg-[#A67C52] hover:bg-[#8c6742] text-white h-14 text-xl font-bold shadow-lg shadow-[#A67C52]/20 transition-all hover:scale-[1.02] active:scale-95 rounded-xl"
                disabled={orderItems.length === 0}
                onClick={placeOrder}
            >
                {isEditMode ? 'Actualizar Orden' : 'Confirmar Orden'}
            </Button>
        </div>
    </div>
  );
}
