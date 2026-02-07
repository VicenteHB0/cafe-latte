import { Edit2, Trash2 } from 'lucide-react';

export function ProductCard({ product, onEdit, onDelete }) {
  return (
    <div 
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden"
      style={{ borderLeft: '4px solid #a0826d' }}
    >
      {/* Imagen */}
      <div 
        className="h-48 bg-gradient-to-br flex items-center justify-center"
        style={{ 
          background: 'linear-gradient(135deg, #f5f1ed 0%, #e8dfd3 100%)'
        }}
      >
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-6xl">☕</div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-5">
        {/* Header con nombre y disponibilidad */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 
              className="text-lg mb-1"
              style={{ color: '#3d2817', fontFamily: 'var(--font-body)' }}
            >
              {product.name}
            </h3>
            <p className="text-xs mb-2" style={{ color: '#8b7355' }}>
              {product.category}
            </p>
          </div>
          <div
            className="px-2 py-1 rounded text-xs"
            style={{
              backgroundColor: product.available ? '#d4edda' : '#f8d7da',
              color: product.available ? '#155724' : '#721c24'
            }}
          >
            {product.available ? 'Disponible' : 'No disponible'}
          </div>
        </div>

        {/* Descripción */}
        <p className="text-sm mb-4" style={{ color: '#8b7355' }}>
          {product.description}
        </p>

        {/* Precio base (si existe) */}
        {product.price && (
          <div className="mb-3">
            <span className="text-2xl" style={{ color: '#3d2817' }}>
              ${product.price}
            </span>
          </div>
        )}

        {/* Tamaños */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mb-3">
            <p className="text-xs mb-2" style={{ color: '#8b7355' }}>
              <strong>Tamaños:</strong>
            </p>
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map((size, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-xs"
                  style={{ backgroundColor: '#f5f1ed', color: '#3d2817' }}
                >
                  {size.label}: ${size.price}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Extras */}
        {product.extras && product.extras.length > 0 && (
          <div className="mb-3">
            <p className="text-xs mb-2" style={{ color: '#8b7355' }}>
              <strong>Extras disponibles:</strong>
            </p>
            <div className="space-y-1">
              {product.extras.map((extra, idx) => (
                <div
                  key={idx}
                  className="flex justify-between text-xs px-2 py-1 rounded"
                  style={{ backgroundColor: '#f5f1ed' }}
                >
                  <span style={{ color: '#3d2817' }}>{extra.name}</span>
                  <span style={{ color: '#a0826d' }}>+${extra.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sabores */}
        {product.flavors && product.flavors.length > 0 && (
          <div className="mb-3">
            <p className="text-xs mb-2" style={{ color: '#8b7355' }}>
              <strong>Sabores:</strong>
            </p>
            <div className="flex gap-1 flex-wrap">
              {product.flavors.map((flavor, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 rounded text-xs"
                  style={{ backgroundColor: '#f5f1ed', color: '#3d2817' }}
                >
                  {flavor}
                </span>
              ))}
            </div>
            {product.extraFlavorPrice && (
              <p className="text-xs mt-1" style={{ color: '#a0826d' }}>
                Sabor extra: +${product.extraFlavorPrice}
              </p>
            )}
          </div>
        )}

        {/* Opciones */}
        {product.options && (
          <div className="mb-3">
            <p className="text-xs mb-2" style={{ color: '#8b7355' }}>
              <strong>Opciones:</strong>
            </p>
            {product.options.pieces && (
              <p className="text-xs mb-1" style={{ color: '#3d2817' }}>
                Piezas: {product.options.pieces}
              </p>
            )}
            {product.options.sauces && product.options.sauces.length > 0 && (
              <div>
                <p className="text-xs mb-1" style={{ color: '#8b7355' }}>Salsas:</p>
                <div className="flex gap-1 flex-wrap">
                  {product.options.sauces.map((sauce, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded text-xs"
                      style={{ backgroundColor: '#f5f1ed', color: '#3d2817' }}
                    >
                      {sauce}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-2 mt-4 pt-4 border-t" style={{ borderColor: '#e8dfd3' }}>
          <button
            onClick={() => onEdit?.(product)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors hover:opacity-80"
            style={{ backgroundColor: '#c5a880', color: '#ffffff' }}
          >
            <Edit2 className="w-4 h-4" />
            <span className="text-sm">Editar</span>
          </button>
          <button
            onClick={() => onDelete?.(product._id || '')}
            className="flex items-center justify-center px-4 py-2 rounded-lg transition-colors hover:opacity-80"
            style={{ backgroundColor: '#d32f2f', color: '#ffffff' }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
