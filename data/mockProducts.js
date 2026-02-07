export const mockProducts = [
  {
    _id: '1',
    name: 'Hamburguesa Especial',
    category: 'Comida',
    description: 'Queso amarillo, mozzarella, tocino, salchicha y jamón',
    price: 75,
    extras: [
      { name: 'Carne extra', price: 27 },
      { name: 'Pollo en lugar de res', price: 10 }
    ],
    image: '',
    available: true
  },
  {
    _id: '2',
    name: 'Alitas',
    category: 'Comida',
    description: '6 piezas con aderezo, lechuga y zanahoria',
    price: 80,
    options: {
      pieces: 6,
      sauces: [
        'BBQ',
        'Mango Habanero',
        'Tamarindo Spicy',
        'Búfalo',
        'Miel Mostaza',
        'Cayenne'
      ]
    },
    image: '',
    available: true
  },
  {
    _id: '3',
    name: 'Capuchino',
    category: 'Café',
    description: 'Capuchino caliente o frío',
    sizes: [
      { label: 'CH', price: 45 },
      { label: 'G', price: 55 }
    ],
    flavors: [
      'Vainilla',
      'Caramelo',
      'Moka',
      'Moka Blanco',
      'Crema Irlandesa'
    ],
    extraFlavorPrice: 10,
    image: '',
    available: true
  },
  {
    _id: '4',
    name: 'Latte',
    category: 'Café',
    description: 'Espresso con leche vaporizada',
    sizes: [
      { label: 'CH', price: 40 },
      { label: 'G', price: 50 }
    ],
    flavors: [
      'Vainilla',
      'Caramelo',
      'Avellana'
    ],
    extraFlavorPrice: 10,
    image: '',
    available: true
  },
  {
    _id: '5',
    name: 'Frappe',
    category: 'Bebida Fría',
    description: 'Bebida helada con base de café',
    sizes: [
      { label: 'CH', price: 50 },
      { label: 'G', price: 60 }
    ],
    flavors: [
      'Moka',
      'Caramelo',
      'Vainilla',
      'Oreo'
    ],
    extraFlavorPrice: 10,
    image: '',
    available: true
  },
  {
    _id: '6',
    name: 'Ensalada César',
    category: 'Comida',
    description: 'Lechuga, crutones, parmesano y aderezo César',
    price: 65,
    extras: [
      { name: 'Pollo a la parrilla', price: 25 },
      { name: 'Camarones', price: 35 }
    ],
    image: '',
    available: true
  },
  {
    _id: '7',
    name: 'Té Chai',
    category: 'Té',
    description: 'Té especiado con leche',
    sizes: [
      { label: 'CH', price: 35 },
      { label: 'G', price: 45 }
    ],
    image: '',
    available: true
  },
  {
    _id: '8',
    name: 'Smoothie de Frutos Rojos',
    category: 'Bebida Fría',
    description: 'Fresas, frambuesas, arándanos y plátano',
    sizes: [
      { label: 'CH', price: 45 },
      { label: 'G', price: 55 }
    ],
    image: '',
    available: true
  }
];
