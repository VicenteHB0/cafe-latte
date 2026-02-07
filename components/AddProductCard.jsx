import { useState } from 'react';
import { Plus, X } from 'lucide-react';

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

  if (!isFormOpen) {
    return (
      <div 
        onClick={() => setIsFormOpen(true)}
        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer flex items-center justify-center min-h-[400px]"
        style={{ borderLeft: '4px solid #a0826d', borderStyle: 'dashed' }}
      >
        <div className="text-center p-8">
          <div 
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: '#f5f1ed' }}
          >
            <Plus className="w-8 h-8" style={{ color: '#a0826d' }} />
          </div>
          <h3 className="text-lg mb-2" style={{ color: '#3d2817' }}>
            Añadir Producto
          </h3>
          <p className="text-sm" style={{ color: '#8b7355' }}>
            Crear un nuevo producto
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden"
      style={{ borderLeft: '4px solid #a0826d' }}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg" style={{ color: '#3d2817' }}>
            Nuevo Producto
          </h3>
          <button
            onClick={resetForm}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" style={{ color: '#8b7355' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Información básica */}
          <div>
            <label className="block text-sm mb-1" style={{ color: '#3d2817' }}>
              Nombre *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border"
              style={{ borderColor: '#c5a880', backgroundColor: '#ffffff' }}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: '#3d2817' }}>
              Categoría *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border"
              style={{ borderColor: '#c5a880', backgroundColor: '#ffffff' }}
              required
            >
              <option value="Café">Café</option>
              <option value="Té">Té</option>
              <option value="Bebida Fría">Bebida Fría</option>
              <option value="Comida">Comida</option>
              <option value="Postre">Postre</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: '#3d2817' }}>
              Descripción *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border resize-none"
              style={{ borderColor: '#c5a880', backgroundColor: '#ffffff' }}
              rows={2}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: '#3d2817' }}>
              Precio Base
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.price || ''}
              onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : undefined })}
              className="w-full px-3 py-2 rounded-lg border"
              style={{ borderColor: '#c5a880', backgroundColor: '#ffffff' }}
              placeholder="Dejar vacío si tiene tamaños"
            />
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: '#3d2817' }}>
              URL de Imagen
            </label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border"
              style={{ borderColor: '#c5a880', backgroundColor: '#ffffff' }}
              placeholder="https://..."
            />
          </div>

          {/* Tamaños */}
          <div>
            <label className="block text-sm mb-2" style={{ color: '#3d2817' }}>
              Tamaños
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={sizeLabel}
                onChange={(e) => setSizeLabel(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: '#c5a880', backgroundColor: '#ffffff' }}
                placeholder="Ej: CH, G"
              />
              <input
                type="number"
                step="0.01"
                value={sizePrice}
                onChange={(e) => setSizePrice(e.target.value)}
                className="w-24 px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: '#c5a880', backgroundColor: '#ffffff' }}
                placeholder="Precio"
              />
              <button
                type="button"
                onClick={addSize}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ backgroundColor: '#c5a880', color: '#ffffff' }}
              >
                +
              </button>
            </div>
            {formData.sizes && formData.sizes.length > 0 && (
              <div className="space-y-1">
                {formData.sizes.map((size, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center px-3 py-2 rounded text-sm"
                    style={{ backgroundColor: '#f5f1ed' }}
                  >
                    <span>{size.label}: ${size.price}</span>
                    <button
                      type="button"
                      onClick={() => removeSize(idx)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Extras */}
          <div>
            <label className="block text-sm mb-2" style={{ color: '#3d2817' }}>
              Extras
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={extraName}
                onChange={(e) => setExtraName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: '#c5a880', backgroundColor: '#ffffff' }}
                placeholder="Nombre del extra"
              />
              <input
                type="number"
                step="0.01"
                value={extraPrice}
                onChange={(e) => setExtraPrice(e.target.value)}
                className="w-24 px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: '#c5a880', backgroundColor: '#ffffff' }}
                placeholder="Precio"
              />
              <button
                type="button"
                onClick={addExtra}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ backgroundColor: '#c5a880', color: '#ffffff' }}
              >
                +
              </button>
            </div>
            {formData.extras && formData.extras.length > 0 && (
              <div className="space-y-1">
                {formData.extras.map((extra, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center px-3 py-2 rounded text-sm"
                    style={{ backgroundColor: '#f5f1ed' }}
                  >
                    <span>{extra.name}: +${extra.price}</span>
                    <button
                      type="button"
                      onClick={() => removeExtra(idx)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sabores */}
          <div>
            <label className="block text-sm mb-2" style={{ color: '#3d2817' }}>
              Sabores
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={flavorName}
                onChange={(e) => setFlavorName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: '#c5a880', backgroundColor: '#ffffff' }}
                placeholder="Nombre del sabor"
              />
              <button
                type="button"
                onClick={addFlavor}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ backgroundColor: '#c5a880', color: '#ffffff' }}
              >
                +
              </button>
            </div>
            {formData.flavors && formData.flavors.length > 0 && (
              <div className="flex gap-1 flex-wrap mb-2">
                {formData.flavors.map((flavor, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs"
                    style={{ backgroundColor: '#f5f1ed' }}
                  >
                    {flavor}
                    <button
                      type="button"
                      onClick={() => removeFlavor(idx)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {formData.flavors && formData.flavors.length > 0 && (
              <div>
                <label className="block text-xs mb-1" style={{ color: '#8b7355' }}>
                  Precio por sabor extra
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.extraFlavorPrice || ''}
                  onChange={(e) => setFormData({ ...formData, extraFlavorPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: '#c5a880', backgroundColor: '#ffffff' }}
                  placeholder="Ej: 10"
                />
              </div>
            )}
          </div>

          {/* Opciones (para Alitas, etc.) */}
          <div>
            <label className="block text-sm mb-2" style={{ color: '#3d2817' }}>
              Opciones Especiales
            </label>
            
            <div className="mb-2">
              <label className="block text-xs mb-1" style={{ color: '#8b7355' }}>
                Número de piezas
              </label>
              <input
                type="number"
                value={formData.options?.pieces || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  options: { 
                    ...formData.options, 
                    pieces: e.target.value ? parseInt(e.target.value) : undefined 
                  } 
                })}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: '#c5a880', backgroundColor: '#ffffff' }}
                placeholder="Ej: 6"
              />
            </div>

            <div>
              <label className="block text-xs mb-1" style={{ color: '#8b7355' }}>
                Salsas disponibles
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={sauceName}
                  onChange={(e) => setSauceName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: '#c5a880', backgroundColor: '#ffffff' }}
                  placeholder="Nombre de la salsa"
                />
                <button
                  type="button"
                  onClick={addSauce}
                  className="px-4 py-2 rounded-lg text-sm"
                  style={{ backgroundColor: '#c5a880', color: '#ffffff' }}
                >
                  +
                </button>
              </div>
              {formData.options?.sauces && formData.options.sauces.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {formData.options.sauces.map((sauce, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs"
                      style={{ backgroundColor: '#f5f1ed' }}
                    >
                      {sauce}
                      <button
                        type="button"
                        onClick={() => removeSauce(idx)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Disponibilidad */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="available"
              checked={formData.available}
              onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="available" className="text-sm" style={{ color: '#3d2817' }}>
              Producto disponible
            </label>
          </div>

          {/* Botones */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 px-4 py-2 rounded-lg text-sm transition-colors"
              style={{ backgroundColor: '#e8dfd3', color: '#3d2817' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg text-sm transition-colors hover:opacity-90"
              style={{ backgroundColor: '#3d2817', color: '#ffffff' }}
            >
              Añadir Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
