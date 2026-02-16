import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProductCard } from './ProductCard';

export function ProductFormDialog({ open, onOpenChange, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Café',
    description: '',
    price: undefined,

    available: true,
    extras: [],
    sizes: [],
    flavors: [],
    extraFlavorPrice: undefined,
    options: undefined
  });

  // Estados para inputs temporales
  const [extraName, setExtraName] = useState('');
  const [extraPrice, setExtraPrice] = useState('');
  const [sizeLabel, setSizeLabel] = useState('');
  const [sizePrice, setSizePrice] = useState('');
  const [flavorName, setFlavorName] = useState('');
  const [sauceName, setSauceName] = useState('');

  // Preview Product Object
  const [previewProduct, setPreviewProduct] = useState({});

  // Cargar datos iniciales si existen (Modo Edición)
  useEffect(() => {
    if (open) {
        if (initialData) {
            setFormData({
                ...initialData,
                price: initialData.price || undefined, // Asegurar undefined si es 0 o null
            });
        } else {
            // Resetear si es nuevo producto
            setFormData({
                name: '',
                category: 'Café',
                description: '',
                price: undefined,

                available: true,
                extras: [],
                sizes: [],
                flavors: [],
                extraFlavorPrice: undefined,
                options: undefined
            });
        }
    }
  }, [initialData, open]);

  useEffect(() => {
    setPreviewProduct({
        _id: initialData?._id || 'preview',
        ...formData,
        price: formData.price ? parseFloat(formData.price) : undefined,
    });
  }, [formData, initialData]);


  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Limpiar datos según categoría
    const cleanedData = {
      name: formData.name || '',
      category: formData.category || 'Café',
      description: formData.description || '',

      available: formData.available ?? true,
    };

    // Agregar campos según el tipo de producto
    if (formData.price) cleanedData.price = formData.price;
    if (formData.extras && formData.extras.length > 0) cleanedData.extras = formData.extras;
    if (formData.sizes && formData.sizes.length > 0) cleanedData.sizes = formData.sizes;
    if (formData.flavors && formData.flavors.length > 0) cleanedData.flavors = formData.flavors;
    if (formData.extraFlavorPrice) cleanedData.extraFlavorPrice = formData.extraFlavorPrice;
    if (formData.options) cleanedData.options = formData.options;

    // Si es edición, mantenemos el ID
    if (initialData?._id) {
        cleanedData._id = initialData._id;
    }

    onSubmit(cleanedData);
    onOpenChange(false);
  };

  const addExtra = () => {
    if (extraName && extraPrice) {
      setFormData({
        ...formData,
        extras: [...(formData.extras || []), { name: extraName, price: parseFloat(extraPrice) }]
      });
      setExtraName('');
      setExtraPrice('');
    }
  };

  const removeExtra = (index) => {
    setFormData({
      ...formData,
      extras: formData.extras?.filter((_, i) => i !== index)
    });
  };

  const addSize = () => {
    if (sizeLabel && sizePrice) {
      setFormData({
        ...formData,
        sizes: [...(formData.sizes || []), { label: sizeLabel, price: parseFloat(sizePrice) }]
      });
      setSizeLabel('');
      setSizePrice('');
    }
  };

  const removeSize = (index) => {
    setFormData({
      ...formData,
      sizes: formData.sizes?.filter((_, i) => i !== index)
    });
  };

  const addFlavor = () => {
    if (flavorName) {
      setFormData({
        ...formData,
        flavors: [...(formData.flavors || []), flavorName]
      });
      setFlavorName('');
    }
  };

  const removeFlavor = (index) => {
    setFormData({
      ...formData,
      flavors: formData.flavors?.filter((_, i) => i !== index)
    });
  };

  const addSauce = () => {
    if (sauceName) {
      setFormData({
        ...formData,
        options: {
          ...formData.options,
          sauces: [...(formData.options?.sauces || []), sauceName]
        }
      });
      setSauceName('');
    }
  };

  const removeSauce = (index) => {
    setFormData({
      ...formData,
      options: {
        ...formData.options,
        sauces: formData.options?.sauces?.filter((_, i) => i !== index)
      }
    });
  };

  return (

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[95vw] md:max-w-[90vw] lg:max-w-7xl w-full h-[90vh] flex flex-col p-0 gap-0 bg-white border-none shadow-2xl overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b border-gray-100 bg-white">
            <DialogTitle className="text-2xl font-bold text-[#402E24] tracking-tight">
                {initialData ? 'Editar Producto' : 'Nuevo Producto'}
            </DialogTitle>
            <DialogDescription className="text-gray-500">
                {initialData ? 'Modifica los detalles del producto.' : 'Completa los detalles para añadir un nuevo producto al menú.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
              <div className="flex-1 h-full min-w-0">
                <ScrollArea className="h-full">
                    <div className="p-6 pt-6">
                        <form id="product-form" onSubmit={handleSubmit} className="space-y-8 pb-10">
                        {/* Información básica */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-6 w-1 bg-[#402E24] rounded-full"></div>
                                <h3 className="font-bold text-gray-800 text-lg">Información General</h3>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-gray-700 font-medium">Nombre del Producto *</Label>
                                    <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="border-gray-200 focus:border-[#402E24] focus:ring-[#402E24]/10 bg-gray-50/50"
                                    placeholder="Ej: Latte Vainilla"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-gray-700 font-medium">Categoría *</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                                    >
                                        <SelectTrigger className="border-gray-200 bg-gray-50/50 focus:ring-[#402E24]/10">
                                            <SelectValue placeholder="Selecciona una categoría" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Café">Café</SelectItem>
                                            <SelectItem value="Té">Té</SelectItem>
                                            <SelectItem value="Bebida Fría">Bebida Fría</SelectItem>
                                            <SelectItem value="Comida">Comida</SelectItem>
                                            <SelectItem value="Postre">Postre</SelectItem>
                                            <SelectItem value="Otro">Otro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-gray-700 font-medium">Descripción *</Label>
                                <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                                className="border-gray-200 focus:border-[#402E24] focus:ring-[#402E24]/10 bg-gray-50/50 resize-none min-h-[80px]"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="price" className="text-gray-700 font-medium">Precio Base ($)</Label>
                                    <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    value={formData.price || ''}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : undefined })}
                                    placeholder="0.00"
                                    className="border-gray-200 focus:border-[#402E24] focus:ring-[#402E24]/10 bg-gray-50/50"
                                    />
                                    <p className="text-xs text-gray-400">Dejar vacío si el precio depende del tamaño.</p>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100 w-full" />

                        {/* Tamaños */}
                        <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                <div className="h-6 w-1 bg-[#A67C52] rounded-full"></div>
                                <h3 className="font-bold text-gray-800 text-lg">Tamaños y Precios</h3>
                            </div>

                            <div className="flex gap-3 items-end p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex-1 space-y-2">
                                    <Label className="text-xs font-semibold text-gray-500 uppercase">Etiqueta</Label>
                                    <Input
                                        value={sizeLabel}
                                        onChange={(e) => setSizeLabel(e.target.value)}
                                        placeholder="Ej: Grande"
                                        className="bg-white border-gray-200"
                                    />
                                </div>
                                <div className="w-32 space-y-2">
                                    <Label className="text-xs font-semibold text-gray-500 uppercase">Precio</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={sizePrice}
                                        onChange={(e) => setSizePrice(e.target.value)}
                                        placeholder="0.00"
                                        className="bg-white border-gray-200"
                                    />
                                </div>
                                <Button type="button" onClick={addSize} className="bg-[#402E24] hover:bg-[#2b1f18] text-white">
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </div>

                            {formData.sizes && formData.sizes.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {formData.sizes.map((size, idx) => (
                                <div key={idx} className="flex justify-between items-center px-4 py-3 rounded-lg bg-white border border-gray-100 shadow-sm relative group">
                                    <div>
                                        <div className="font-bold text-gray-800">{size.label}</div>
                                        <div className="text-sm text-[#A67C52]">${size.price}</div>
                                    </div>
                                    <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeSize(idx)}
                                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                    <X className="w-4 h-4" />
                                    </Button>
                                </div>
                                ))}
                            </div>
                            )}
                        </div>

                        <div className="h-px bg-gray-100 w-full" />

                        {/* Extras y Personalización */}
                        <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                <div className="h-6 w-1 bg-[#A67C52] rounded-full"></div>
                                <h3 className="font-bold text-gray-800 text-lg">Personalización</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Extras */}
                                <div className="space-y-3">
                                    <Label className="text-gray-700 font-medium">Extras Disponibles</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={extraName}
                                            onChange={(e) => setExtraName(e.target.value)}
                                            placeholder="Nombre"
                                            className="flex-1 bg-gray-50 border-gray-200"
                                        />
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={extraPrice}
                                            onChange={(e) => setExtraPrice(e.target.value)}
                                            placeholder="$"
                                            className="w-20 bg-gray-50 border-gray-200"
                                        />
                                        <Button type="button" onClick={addExtra} size="icon" className="bg-gray-200 hover:bg-gray-300 text-gray-700 shrink-0">
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                        {formData.extras?.map((extra, idx) => (
                                            <div key={idx} className="flex justify-between items-center px-3 py-2 rounded bg-gray-50 text-sm">
                                                <span>{extra.name} (+${extra.price})</span>
                                                <X className="w-3.5 h-3.5 text-gray-400 cursor-pointer hover:text-red-500" onClick={() => removeExtra(idx)} />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                    {/* Sabores */}
                                <div className="space-y-3">
                                    <Label className="text-gray-700 font-medium">Sabores</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={flavorName}
                                            onChange={(e) => setFlavorName(e.target.value)}
                                            placeholder="Sabor"
                                            className="flex-1 bg-gray-50 border-gray-200"
                                        />
                                        <Button type="button" onClick={addFlavor} size="icon" className="bg-gray-200 hover:bg-gray-300 text-gray-700 shrink-0">
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.flavors?.map((flavor, idx) => (
                                            <div key={idx} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                                                {flavor}
                                                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => removeFlavor(idx)} />
                                            </div>
                                        ))}
                                    </div>
                                    {formData.flavors?.length > 0 && (
                                            <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.extraFlavorPrice || ''}
                                            onChange={(e) => setFormData({ ...formData, extraFlavorPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                                            placeholder="Precio extra por sabor"
                                            className="bg-gray-50 border-gray-200 text-sm"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100 w-full" />

                        {/* Disponibilidad */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div>
                                <Label htmlFor="available" className="text-base font-bold text-[#402E24]">Disponibilidad</Label>
                                <p className="text-sm text-gray-500">Activa o desactiva este producto del menú visible.</p>
                            </div>
                            <Switch
                                id="available"
                                checked={formData.available}
                                onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                                className="data-[state=checked]:bg-green-500"
                            />
                        </div>
                        </form>
                    </div>
                </ScrollArea>
              </div>

              {/* Preview Column */}
              <div className="bg-[#f8f9fa] border-l border-gray-100 hidden lg:flex flex-col h-full overflow-hidden w-[450px]">
                <div className="p-6 bg-white border-b border-gray-100">
                    <h4 className="text-[#402E24] font-bold">Vista Previa</h4>
                    <p className="text-xs text-gray-500">Así es como se verá el producto en el menú.</p>
                </div>
                <div className="flex-1 flex items-start justify-center p-8 pt-20 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] overflow-y-auto">
                    <div className="w-full max-w-sm transform transition-all duration-500 hover:scale-105">
                        <ProductCard
                            product={previewProduct}
                            onEdit={() => {}}
                            onDelete={() => {}}
                            hideActions={true}
                        />
                    </div>
                </div>
              </div>
          </div>

           <DialogFooter className="p-5 bg-white border-t border-gray-100 gap-3">
             <Button variant="outline" onClick={() => onOpenChange(false)} className="border-gray-200 text-gray-600 hover:bg-gray-50">
               Cancelar
             </Button>
             <Button type="submit" form="product-form" className="bg-[#402E24] hover:bg-[#2b1f18] text-white px-8 shadow-lg">
               {initialData ? 'Guardar Cambios' : 'Crear Producto'}
             </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
  );

}
