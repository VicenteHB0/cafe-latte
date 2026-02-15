"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner"; // Import toast

export function AddToOrderDialog({ open, onOpenChange, product, onAddToOrder, initialItem = null }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [selectedFlavor, setSelectedFlavor] = useState(null); 
  const [selectedSauce, setSelectedSauce] = useState(null); // Changed to single value
  const [notes, setNotes] = useState('');

  // Reset state when product changes or dialog opens
  useEffect(() => {
    if (open && product) {
        if (initialItem) {
            // Edit Mode: Hydrate from existing item
            setQuantity(initialItem.quantity || 1);
            setSelectedSize(initialItem.size || (product.sizes?.length > 0 ? product.sizes[0] : null));
            setSelectedExtras(initialItem.extras || []);
            setSelectedFlavor(initialItem.flavors?.[0] || null);
            setSelectedSauce(initialItem.sauces?.[0] || null);
            setNotes(initialItem.customizations?.[0] || '');
        } else {
            // Add Mode: Reset
            setQuantity(1);
            // Default to first size if available, otherwise null (standard price)
            setSelectedSize(product.sizes?.length > 0 ? product.sizes[0] : null);
            setSelectedExtras([]);
            setSelectedFlavor(null);
            setSelectedSauce(null);
            setNotes('');
        }
    }
  }, [open, product, initialItem]);

  if (!product) return null;

  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const toggleExtra = (extra) => {
    setSelectedExtras(current => {
      const exists = current.find(e => e.name === extra.name);
      if (exists) {
        return current.filter(e => e.name !== extra.name);
      } else {
        return [...current, extra];
      }
    });
  };

  // No longer needed as toggleSauce is replaced by direct setter or simple handler for single select
  const handleSauceSelect = (sauce) => {
    setSelectedSauce(sauce);
  };

  const calculateItemTotal = () => {
    let price = (selectedSize ? selectedSize.price : product.price) || 0;
    selectedExtras.forEach(extra => {
      price += extra.price;
    });
    if (product.extraFlavorPrice && selectedFlavor) {
         // Logic if flavors have price, though schema puts price on extras. 
         // Assuming flavors are free for now unless specified otherwise or if they are in 'extras'
    }
    return price * quantity;
  };

  const handleConfirm = () => {
    // Validation
    if (product.flavors && product.flavors.length > 0 && !selectedFlavor) {
        toast.error("Por favor selecciona un sabor."); 
        return;
    }

    if (product.options?.sauces && product.options.sauces.length > 0 && !selectedSauce) {
        toast.error("Por favor selecciona una salsa.");
        return;
    }

    const orderItem = {
      product: product._id,
      name: product.name,
      quantity,
      price: calculateItemTotal() / quantity, // Unit price with modifiers
      size: selectedSize,
      extras: selectedExtras,
      flavors: selectedFlavor ? [selectedFlavor] : [],
      sauces: selectedSauce ? [selectedSauce] : [],
      customizations: notes ? [notes] : [],
    };
    onAddToOrder(orderItem);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-[#F0E0CD] border-[#A67C52]">
        <DialogHeader>
            <DialogTitle className="text-2xl text-[#402E24] font-serif">
                {initialItem ? `Editar: ${product.name}` : product.name}
            </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-3">
                    <Label className="text-[#756046] text-base font-semibold">Tamaño</Label>
                    <RadioGroup 
                        value={selectedSize?.label} 
                        onValueChange={(val) => setSelectedSize(product.sizes.find(s => s.label === val))}
                        className="grid grid-cols-3 gap-3"
                    >
                        {product.sizes.map((size) => (
                            <div key={size.label}>
                                <RadioGroupItem value={size.label} id={`size-${size.label}`} className="peer sr-only" />
                                <Label 
                                    htmlFor={`size-${size.label}`} 
                                    className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-white p-3 hover:bg-[#F0E0CD] hover:text-[#402E24] peer-data-[state=checked]:border-[#402E24] peer-data-[state=checked]:bg-[#402E24] peer-data-[state=checked]:text-white cursor-pointer transition-all text-center h-full"
                                >
                                    <span className="font-bold">{size.label}</span>
                                    <span className="text-xs opacity-90">${size.price}</span>
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
            )}

            {/* Extras */}
            {product.extras && product.extras.length > 0 && (
                <div className="space-y-3">
                    <Label className="text-[#756046] text-base font-semibold">Extras</Label>
                    <div className="grid grid-cols-2 gap-3">
                        {product.extras.map((extra) => {
                            const isSelected = selectedExtras.some(e => e.name === extra.name);
                            return (
                                <div 
                                    key={extra.name}
                                    onClick={() => toggleExtra(extra)}
                                    className={`
                                        cursor-pointer rounded-md border-2 p-3 transition-all flex justify-between items-center
                                        ${isSelected 
                                            ? 'border-[#402E24] bg-[#402E24] text-white' 
                                            : 'border-muted bg-white hover:bg-[#F0E0CD] text-[#402E24]'}
                                    `}
                                >
                                    <span className="font-medium text-sm">{extra.name}</span>
                                    <span className="text-xs opacity-90">+${extra.price}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}



             {/* Flavors */}
             {product.flavors && product.flavors.length > 0 && (
        <div className="space-y-3">
          <Label className="text-[#756046] text-base font-semibold">Sabor <span className="text-red-500">*</span></Label>
          <RadioGroup
            value={selectedFlavor}
            onValueChange={setSelectedFlavor}
            className="grid grid-cols-2 gap-3"
          >
            {product.flavors.map((flavor) => (
              <div key={flavor}>
                <RadioGroupItem
                  value={flavor}
                  id={`flavor-${flavor}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`flavor-${flavor}`}
                  className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-white p-3 hover:bg-[#F0E0CD] hover:text-[#402E24] peer-data-[state=checked]:border-[#402E24] peer-data-[state=checked]:bg-[#402E24] peer-data-[state=checked]:text-white cursor-pointer transition-all text-center h-full"
                >
                  <span className="font-medium">{flavor}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
            )}

            {/* Sauces (from options.sauces) */}
            {product.options?.sauces && product.options.sauces.length > 0 && (
                <div className="space-y-3">
                    <Label className="text-[#756046] text-base font-semibold">Salsas <span className="text-red-500">*</span></Label>
                    <div className="grid grid-cols-2 gap-3">
                        {product.options.sauces.map((sauce) => {
                            const isSelected = selectedSauce === sauce;
                            return (
                                <div 
                                    key={sauce}
                                    onClick={() => handleSauceSelect(sauce)}
                                    className={`
                                        cursor-pointer rounded-md border-2 p-3 transition-all text-center
                                        ${isSelected 
                                            ? 'border-[#402E24] bg-[#402E24] text-white' 
                                            : 'border-muted bg-white hover:bg-[#F0E0CD] text-[#402E24]'}
                                    `}
                                >
                                    <span className="font-medium text-sm">{sauce}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Notes */}
            <div className="space-y-3">
                <Label htmlFor="notes" className="text-[#756046]">Notas de preparación</Label>
                <Textarea 
                    id="notes" 
                    placeholder="Sin hielo, extra caliente, etc." 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="border-[#B68847] focus-visible:ring-[#A67C52] bg-white"
                />
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-center space-x-4 pt-4">
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleQuantityChange(-1)}
                    className="border-[#756046] text-[#402E24]"
                >
                    -
                </Button>
                <span className="text-xl font-bold text-[#402E24] w-8 text-center">{quantity}</span>
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleQuantityChange(1)}
                    className="border-[#756046] text-[#402E24]"
                >
                    +
                </Button>
            </div>

            {/* Total Item Price Preview */}
            <div className="text-center text-lg font-bold text-[#402E24]">
                Total: ${calculateItemTotal()}
            </div>
        </div>

        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="border-none text-[#756046] hover:text-[#402E24]">
                Cancelar
            </Button>
            <Button onClick={handleConfirm} className="bg-[#402E24] text-white hover:bg-[#2b1f18]">
                {initialItem ? "Actualizar Producto" : "Agregar al Pedido"}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
