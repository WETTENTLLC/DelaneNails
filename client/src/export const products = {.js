export const products = {
  nailPolish: [
    {
      id: 'np1',
      name: 'Summer Breeze Collection',
      description: 'Vibrant summer colors including coral, turquoise, and sunny yellow',
      price: 12.99,
      colors: ['Coral Sunset', 'Ocean Blue', 'Sunshine Yellow', 'Mint Julep', 'Hibiscus Pink'],
      brand: 'DelaneColor',
      bestseller: true
    },
    {
      id: 'np2',
      name: 'Earth Tones Collection',
      description: 'Natural, earthy colors for a subtle, elegant look',
      price: 14.99,
      colors: ['Sandy Beige', 'Forest Green', 'Terracotta', 'Stone Gray', 'Coffee Brown'],
      brand: 'DelaneColor',
      bestseller: false
    },
    {
      id: 'np3',
      name: 'Metallic Dreams',
      description: 'Stunning metallic finishes that catch the light',
      price: 16.99,
      colors: ['Rose Gold', 'Silver Shimmer', 'Bronze Glow', 'Copper Penny', 'Platinum'],
      brand: 'LuxeNails',
      bestseller: true
    }
  ],
  
  gelPolish: [
    {
      id: 'gp1',
      name: 'Long-lasting Gel Collection',
      description: 'Professional gel polish with up to 3 weeks wear',
      price: 19.99,
      colors: ['Classic Red', 'French White', 'Noir Black', 'Blush Pink', 'Mauve'],
      brand: 'DelaneGel',
      bestseller: true
    },
    {
      id: 'gp2',
      name: 'Glitter Gel Collection',
      description: 'Eye-catching glitter gels for special occasions',
      price: 22.99,
      colors: ['Diamond Sparkle', 'Ruby Glitz', 'Sapphire Shimmer', 'Emerald Gleam', 'Gold Rush'],
      brand: 'DelaneGel',
      bestseller: false
    }
  ],
  
  nailCare: [
    {
      id: 'nc1',
      name: 'Cuticle Oil Pen',
      description: 'Nourishing oil to maintain healthy cuticles, in convenient pen form',
      price: 9.99,
      ingredients: ['Jojoba Oil', 'Vitamin E', 'Lavender Essential Oil'],
      brand: 'DelaneEssentials',
      bestseller: true
    },
    {
      id: 'nc2',
      name: 'Nail Strengthener',
      description: 'Fortifying treatment for weak or damaged nails',
      price: 14.99,
      ingredients: ['Keratin', 'Calcium', 'Biotin'],
      brand: 'DelaneEssentials',
      bestseller: true
    },
    {
      id: 'nc3',
      name: 'Acetone-Free Remover',
      description: 'Gentle, non-drying polish remover',
      price: 8.99,
      ingredients: ['Ethyl Acetate', 'Aloe Vera', 'Vitamin B5'],
      brand: 'DelaneEssentials',
      bestseller: false
    }
  ],
  
  tools: [
    {
      id: 't1',
      name: 'Professional Nail File Set',
      description: 'Set of 5 files with different grit levels',
      price: 12.99,
      brand: 'DelaneTools',
      bestseller: true
    },
    {
      id: 't2',
      name: 'Luxury Buffer Block',
      description: '4-sided buffer for smooth, shiny natural nails',
      price: 7.99,
      brand: 'DelaneTools',
      bestseller: false
    }
  ]
};

export const productCategories = [
  {
    id: 'cat1',
    name: 'Nail Polish',
    description: 'Regular nail polishes in a variety of colors and finishes',
    image: '/images/categories/nail-polish.jpg',
    products: 'nailPolish'
  },
  {
    id: 'cat2',
    name: 'Gel Polish',
    description: 'Professional-grade gel polishes for long-lasting manicures',
    image: '/images/categories/gel-polish.jpg',
    products: 'gelPolish'
  },
  {
    id: 'cat3',
    name: 'Nail Care',
    description: 'Products to maintain healthy nails and cuticles',
    image: '/images/categories/nail-care.jpg',
    products: 'nailCare'
  },
  {
    id: 'cat4',
    name: 'Tools',
    description: 'Professional tools for nail care and application',
    image: '/images/categories/tools.jpg',
    products: 'tools'
  }
];
