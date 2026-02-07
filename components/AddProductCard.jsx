import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

export function AddProductCard({ onAdd }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Café',
    description: '',
    price: undefined,
    image: '',
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Limpiar datos según categoría
    const cleanedData = {
      name: formData.name || '',
      category: formData.category || 'Café',
      description: formData.description || '',
      image: formData.image || '',
      available: formData.available ?? true,
    };

    // Agregar campos según el tipo de producto
    if (formData.price) cleanedData.price = formData.price;
    if (formData.extras && formData.extras.length > 0) cleanedData.extras = formData.extras;
    if (formData.sizes && formData.sizes.length > 0) cleanedData.sizes = formData.sizes;
    if (formData.flavors && formData.flavors.length > 0) cleanedData.flavors = formData.flavors;
    if (formData.extraFlavorPrice) cleanedData.extraFlavorPrice = formData.extraFlavorPrice;
    if (formData.options) cleanedData.options = formData.options;

    onAdd(cleanedData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Café',
      description: '',
      price: undefined,
      image: '',
      available: true,
      extras: [],
      sizes: [],
      flavors: [],
      extraFlavorPrice: undefined,
      options: undefined
    });
    setIsFormOpen(false);
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
    <>
      <div 
        onClick={() => setIsFormOpen(true)}
        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer flex items-center justify-center min-h-[400px] border-l-4 border-l-[#a0826d] border-dashed"
      >
        <div className="text-center p-8">
          <div 
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-[#f5f1ed]"
          >
            <Plus className="w-8 h-8 text-[#a0826d]" />
          </div>
          <h3 className="text-lg mb-2 text-[#3d2817]">
            Añadir Producto
          </h3>
          <p className="text-sm text-[#8b7355]">
            Crear un nuevo producto
          </p>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-[#3d2817]">Nuevo Producto</DialogTitle>
            <DialogDescription>
              Completa los detalles para añadir un nuevo producto al menú.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 p-6 pt-2">
            <form id="add-product-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Información básica */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-[#3d2817]">Nombre *</Label>
                        <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="border-[#c5a880]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category" className="text-[#3d2817]">Categoría *</Label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                            <SelectTrigger className="border-[#c5a880]">
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
                    <Label htmlFor="description" className="text-[#3d2817]">Descripción *</Label>
                    <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    className="border-[#c5a880] resize-none"
                    rows={2}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="price" className="text-[#3d2817]">Precio Base</Label>
                        <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price || ''}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : undefined })}
                        placeholder="Dejar vacío si tiene tamaños"
                        className="border-[#c5a880]"
                        />
                    </div>
                    <div className="space-y-2">
                         <Label htmlFor="image" className="text-[#3d2817]">URL de Imagen</Label>
                        <Input
                        id="image"
                        type="text"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="https://..."
                        className="border-[#c5a880]"
                        />
                    </div>
                </div>
              </div>

              {/* Tamaños */}
              <div className="space-y-2">
                <Label className="text-[#3d2817]">Tamaños</Label>
                <div className="flex gap-2">
                  <Input
                    value={sizeLabel}
                    onChange={(e) => setSizeLabel(e.target.value)}
                    placeholder="Ej: CH, G"
                    className="flex-1 border-[#c5a880]"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    value={sizePrice}
                    onChange={(e) => setSizePrice(e.target.value)}
                    placeholder="Precio"
                    className="w-24 border-[#c5a880]"
                  />
                  <Button type="button" onClick={addSize} className="bg-[#c5a880] hover:bg-[#c5a880]/90 text-white">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.sizes && formData.sizes.length > 0 && (
                  <div className="space-y-1">
                    {formData.sizes.map((size, idx) => (
                      <div key={idx} className="flex justify-between items-center px-3 py-2 rounded text-sm bg-[#f5f1ed]">
                        <span>{size.label}: ${size.price}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSize(idx)}
                          className="text-red-600 hover:text-red-800 h-auto p-1"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Extras */}
              <div className="space-y-2">
                <Label className="text-[#3d2817]">Extras</Label>
                <div className="flex gap-2">
                  <Input
                    value={extraName}
                    onChange={(e) => setExtraName(e.target.value)}
                    placeholder="Nombre del extra"
                    className="flex-1 border-[#c5a880]"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    value={extraPrice}
                    onChange={(e) => setExtraPrice(e.target.value)}
                    placeholder="Precio"
                    className="w-24 border-[#c5a880]"
                  />
                  <Button type="button" onClick={addExtra} className="bg-[#c5a880] hover:bg-[#c5a880]/90 text-white">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.extras && formData.extras.length > 0 && (
                  <div className="space-y-1">
                    {formData.extras.map((extra, idx) => (
                      <div key={idx} className="flex justify-between items-center px-3 py-2 rounded text-sm bg-[#f5f1ed]">
                        <span>{extra.name}: +${extra.price}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExtra(idx)}
                          className="text-red-600 hover:text-red-800 h-auto p-1"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sabores */}
              <div className="space-y-2">
                <Label className="text-[#3d2817]">Sabores</Label>
                <div className="flex gap-2">
                  <Input
                    value={flavorName}
                    onChange={(e) => setFlavorName(e.target.value)}
                    placeholder="Nombre del sabor"
                    className="flex-1 border-[#c5a880]"
                  />
                  <Button type="button" onClick={addFlavor} className="bg-[#c5a880] hover:bg-[#c5a880]/90 text-white">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.flavors && formData.flavors.length > 0 && (
                    <div className="flex gap-1 flex-wrap mb-2">
                        {formData.flavors.map((flavor, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-[#f5f1ed]">
                            {flavor}
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFlavor(idx)}
                                className="text-red-600 hover:text-red-800 h-auto p-0 hover:bg-transparent"
                            >
                                <X className="w-3 h-3" />
                            </Button>
                        </span>
                        ))}
                    </div>
                )}
                 {formData.flavors && formData.flavors.length > 0 && (
                    <div className="md:w-1/2">
                         <Label className="text-xs text-[#8b7355] mb-1 block">Precio por sabor extra</Label>
                         <Input
                            type="number"
                            step="0.01"
                            value={formData.extraFlavorPrice || ''}
                            onChange={(e) => setFormData({ ...formData, extraFlavorPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                            placeholder="Ej: 10"
                            className="border-[#c5a880]"
                        />
                    </div>
                 )}
              </div>

              {/* Opciones (para Alitas, etc.) */}
              <div className="space-y-2">
                <Label className="text-[#3d2817]">Opciones Especiales</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <Label className="text-xs text-[#8b7355] mb-1 block">Número de piezas</Label>
                        <Input
                            type="number"
                            value={formData.options?.pieces || ''}
                            onChange={(e) => setFormData({ 
                            ...formData, 
                            options: { 
                                ...formData.options, 
                                pieces: e.target.value ? parseInt(e.target.value) : undefined 
                            } 
                            })}
                            placeholder="Ej: 6"
                            className="border-[#c5a880]"
                        />
                     </div>
                     <div>
                        <Label className="text-xs text-[#8b7355] mb-1 block">Salsas disponibles</Label>
                        <div className="flex gap-2 mb-2">
                            <Input
                            value={sauceName}
                            onChange={(e) => setSauceName(e.target.value)}
                            placeholder="Nombre de la salsa"
                            className="flex-1 border-[#c5a880]"
                            />
                            <Button type="button" onClick={addSauce} className="bg-[#c5a880] hover:bg-[#c5a880]/90 text-white">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        {formData.options?.sauces && formData.options.sauces.length > 0 && (
                             <div className="flex gap-1 flex-wrap">
                                {formData.options.sauces.map((sauce, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-[#f5f1ed]">
                                    {sauce}
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeSauce(idx)}
                                        className="text-red-600 hover:text-red-800 h-auto p-0 hover:bg-transparent"
                                        >
                                        <X className="w-3 h-3" />
                                    </Button>
                                </span>
                                ))}
                            </div>
                        )}
                     </div>
                </div>
              </div>

              {/* Disponibilidad */}
              <div className="flex items-center gap-2">
                <Switch
                    id="available"
                    checked={formData.available}
                    onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                />
                <Label htmlFor="available" className="text-[#3d2817]">Producto disponible</Label>
              </div>
            </form>
          </ScrollArea>
           <DialogFooter className="p-6 pt-2">
             <Button variant="outline" onClick={resetForm} className="border-[#e8dfd3] text-[#3d2817]">
               Cancelar
             </Button>
             <Button type="submit" form="add-product-form" className="bg-[#3d2817] hover:bg-[#3d2817]/90 text-white">
               Añadir Producto
             </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
