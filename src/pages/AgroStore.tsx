import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Store, 
  Search, 
  Filter, 
  ShoppingCart, 
  Star, 
  CheckCircle2, 
  Sparkles, 
  Tag, 
  Truck, 
  ShieldCheck, 
  Zap, 
  X, 
  Plus, 
  Info, 
  ArrowRight,
  BadgePercent,
  SlidersHorizontal
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export interface Product {
  id: string;
  name: string;
  category: 'Seeds' | 'Fertilizers' | 'IoT & Drones' | 'Equipment' | 'Crop Protection';
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  supplier: string;
  badge?: string;
  inStock: boolean;
  imageIcon: string;
  description: string;
  specs: { [key: string]: string };
}

export const PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'AgroNitrogen+ Bio-Fertilizer (50kg)',
    category: 'Fertilizers',
    price: 45.00,
    originalPrice: 58.00,
    rating: 4.9,
    reviewsCount: 128,
    supplier: 'BioAgri Tech Corp',
    badge: 'Govt Subsidized 20%',
    inStock: true,
    imageIcon: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=400&h=400&fit=crop&q=80',
    description: 'Enriched slow-release Nitrogen formula designed to boost chlorophyll synthesis in wheat, corn, and commercial crops.',
    specs: { 'Composition': 'N-P-K 28-10-10 + Zinc', 'Application': 'Soil broadcast / fertigation', 'Dosage': '50kg per Hectare' }
  },
  {
    id: 'prod-2',
    name: 'Hybrid Durum Wheat Seeds (HD-3086, 25kg)',
    category: 'Seeds',
    price: 32.50,
    originalPrice: 39.00,
    rating: 4.8,
    reviewsCount: 94,
    supplier: 'Punjab Agro Seeds',
    badge: 'High Yield certified',
    inStock: true,
    imageIcon: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop&q=80',
    description: 'Drought-tolerant, yellow-rust resistant certified wheat seeds delivering 22-25 quintals per acre.',
    specs: { 'Germination Rate': '98.5%', 'Maturity': '125-130 Days', 'Purity': '99.9%' }
  },
  {
    id: 'prod-3',
    name: 'AgriGPT IoT Wireless Soil Sensor Node',
    category: 'IoT & Drones',
    price: 119.00,
    originalPrice: 149.00,
    rating: 4.9,
    reviewsCount: 62,
    supplier: 'AgriGPT Robotics',
    badge: 'AgriGPT Auto-Sync',
    inStock: true,
    imageIcon: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&q=80',
    description: 'Solar-powered smart probe tracking real-time NPK levels, moisture %, temperature, and EC values via 4G/LoRaWAN.',
    specs: { 'Battery Life': 'Solar + 3 yr Standby', 'Depth Probes': '10cm, 30cm, 60cm', 'Wireless': 'LoRaWAN + Bluetooth 5' }
  },
  {
    id: 'prod-4',
    name: 'Precision Crop Spraying Drone - AeroFarm 10L',
    category: 'IoT & Drones',
    price: 1250.00,
    originalPrice: 1450.00,
    rating: 5.0,
    reviewsCount: 31,
    supplier: 'SkyFarmer Systems',
    badge: 'Autonomous Flight',
    inStock: true,
    imageIcon: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&h=400&fit=crop&q=80',
    description: '10-liter payload autonomous multi-rotor drone for ultra-low volume liquid fertilizer and pest control spraying.',
    specs: { 'Coverage': '10 Hectares/Hour', 'Flight Time': '22 Mins/Battery', 'Radar': 'Obstacle Avoidance' }
  },
  {
    id: 'prod-5',
    name: 'Organic Neem Oil Bio-Pesticide (5 Liters)',
    category: 'Crop Protection',
    price: 28.00,
    originalPrice: 35.00,
    rating: 4.7,
    reviewsCount: 83,
    supplier: 'EcoShield Organics',
    badge: '100% Organic',
    inStock: true,
    imageIcon: 'https://images.unsplash.com/photo-1611735341450-74d61e660ad2?w=400&h=400&fit=crop&q=80',
    description: 'Cold-pressed azadirachtin formulation controls whiteflies, aphids, and mites without chemical residue.',
    specs: { 'Active Ingredient': 'Azadirachtin 10000 PPM', 'Dilution': '5ml per Liter Water', 'Eco Safety': 'Bees & Earthworm Safe' }
  },
  {
    id: 'prod-6',
    name: 'Solar Powered Drip Irrigation Pump Set (2 HP)',
    category: 'Equipment',
    price: 380.00,
    originalPrice: 450.00,
    rating: 4.8,
    reviewsCount: 47,
    supplier: 'SunPower AgTech',
    badge: 'Zero Electricity Cost',
    inStock: true,
    imageIcon: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=400&fit=crop&q=80',
    description: 'High-head brushless DC solar pump kit with automatic pressure regulation for precision drip irrigation.',
    specs: { 'Flow Rate': '12,000 L/Hour', 'Solar Panel': '1200W Mono-PERC', 'Warranty': '5 Years' }
  }
];

export function AgroStore() {
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high'>('popular');

  useEffect(() => {
    const selectVoiceProduct = (event: Event) => {
      const query = (event as CustomEvent<{ query?: string }>).detail?.query?.toLowerCase().trim();
      if (!query) return;
      const queryWords = query.split(/\s+/).filter(word => word.length > 2 && !['the', 'product', 'item'].includes(word));
      const selected = PRODUCTS
        .map(product => ({ product, score: queryWords.filter(word => product.name.toLowerCase().includes(word)).length }))
        .sort((a, b) => b.score - a.score)[0];
      if (selected?.score) {
        setSelectedCategory('All');
        setSearchQuery('');
        setSelectedProduct(selected.product);
      }
    };
    window.addEventListener('agrigpt-store-command', selectVoiceProduct);
    return () => window.removeEventListener('agrigpt-store-command', selectVoiceProduct);
  }, []);

  const categories = ['All', 'Seeds', 'Fertilizers', 'IoT & Drones', 'Equipment', 'Crop Protection'];

  // Filter & Search Logic
  const filteredProducts = PRODUCTS.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return b.rating - a.rating;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-50 text-zinc-900 overflow-y-auto">
      {/* Top Banner Ribbon */}
      <div className="bg-gradient-to-r from-emerald-100/90 via-emerald-50/80 to-white border-b border-zinc-200 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-widest mb-1">
              <Store className="w-4 h-4 text-emerald-700" />
              Official AgriGPT Supplies Marketplace
            </div>
            <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
              AgroStore • Certified Farming Inputs
            </h1>
            <p className="text-xs text-zinc-600 mt-1 max-w-xl">
              Govt-approved high-yield seeds, bio-fertilizers, IoT sensors, and drones with direct farm delivery.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/90 border border-zinc-200 p-3 rounded-xl shadow-xs backdrop-blur-md">
            <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <div className="font-bold text-zinc-800">100% Quality Assurance</div>
              <div className="text-[11px] text-zinc-500">Lab tested & subsidy eligible inputs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Store Content Area */}
      <div className="max-w-6xl mx-auto w-full p-4 sm:p-6 space-y-6">
        
        {/* AI Smart Recommendation Banner */}
        <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
                AI Telemetry Recommendation
                <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-medium">
                  Sector Beta Nitrogen Deficit
                </span>
              </div>
              <p className="text-sm font-semibold text-zinc-900 mt-0.5">
                Recommended Bundle: AgroNitrogen+ Bio-Fertilizer (50kg) + IoT Soil Probe
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              addToCart({ id: 'prod-1', name: 'AgroNitrogen+ Bio-Fertilizer (50kg)', price: 45.00, supplier: 'BioAgri Tech Corp' });
              addToCart({ id: 'prod-3', name: 'AgriGPT IoT Wireless Soil Sensor Node', price: 119.00, supplier: 'AgriGPT Robotics' });
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all shrink-0 cursor-pointer"
          >
            Add AI Recommended Bundle ($164.00)
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Bar & Search Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white border border-zinc-200 p-3 rounded-2xl shadow-xs">
          
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat 
                    ? 'bg-emerald-600 text-white font-bold shadow-xs' 
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search & Sort Input */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search seeds, fertilizers, drones..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-2.5 py-1.5 rounded-xl text-xs text-zinc-600">
              <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-zinc-800 focus:outline-none cursor-pointer"
              >
                <option value="popular" className="bg-white text-zinc-900">Highest Rated</option>
                <option value="price-low" className="bg-white text-zinc-900">Price: Low to High</option>
                <option value="price-high" className="bg-white text-zinc-900">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div 
              key={product.id}
              className="bg-white border border-zinc-200 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition-all group shadow-xs"
            >
              <div>
                {/* Product Header & Badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-zinc-200 shadow-sm flex-shrink-0 bg-zinc-100">
                    <img
                      src={product.imageIcon}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop&q=80'; }}
                    />
                  </div>
                  {product.badge && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      {product.badge}
                    </span>
                  )}
                </div>

                <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
                  {product.category} • {product.supplier}
                </div>
                <h3 className="text-sm font-bold text-zinc-900 mt-1 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                  {product.name}
                </h3>

                <p className="text-xs text-zinc-600 mt-1.5 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>

                {/* Rating & Stock */}
                <div className="flex items-center gap-2 mt-3 text-xs">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {product.rating}
                  </div>
                  <span className="text-zinc-500">({product.reviewsCount} reviews)</span>
                  <span className="text-zinc-300">•</span>
                  <span className="text-emerald-700 text-[11px] font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> In Stock
                  </span>
                </div>
              </div>

              {/* Price & Action Row */}
              <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between">
                <div>
                  <div className="text-lg font-extrabold text-zinc-900">
                    ${product.price.toFixed(2)}
                  </div>
                  {product.originalPrice && (
                    <div className="text-xs text-zinc-400 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
                    title="Quick Specs"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => addToCart({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      supplier: product.supplier
                    })}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-white border border-zinc-200 rounded-2xl space-y-3 shadow-xs">
            <Store className="w-12 h-12 text-zinc-400 mx-auto" />
            <h3 className="text-base font-bold text-zinc-800">No products match your search</h3>
            <p className="text-xs text-zinc-500">Try adjusting your filters or category selection</p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-zinc-800 rounded-xl cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Product Detail Quick View Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-zinc-200 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-4 sm:p-6 shadow-2xl relative space-y-4"
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-zinc-200 shadow-sm flex-shrink-0 bg-zinc-100">
                  <img
                    src={selectedProduct.imageIcon}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop&q=80'; }}
                  />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-700">{selectedProduct.category}</div>
                  <h3 className="text-lg font-bold text-zinc-900">{selectedProduct.name}</h3>
                  <div className="text-xs text-zinc-500">Supplier: {selectedProduct.supplier}</div>
                </div>
              </div>

              <p className="text-xs text-zinc-700 leading-relaxed bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                {selectedProduct.description}
              </p>

              {/* Technical Specifications */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Agronomic Specifications</h4>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(selectedProduct.specs).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center text-xs p-2 bg-zinc-50 rounded-lg border border-zinc-200">
                      <span className="text-zinc-500 font-medium">{key}</span>
                      <span className="text-zinc-800 font-semibold">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-zinc-200">
                <div>
                  <div className="text-2xl font-extrabold text-emerald-700">${selectedProduct.price.toFixed(2)}</div>
                  <div className="text-[10px] text-zinc-500">Includes Govt Subsidy & Express Delivery</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('open-copilot', {
                        detail: { prompt: `Is ${selectedProduct.name} ($${selectedProduct.price}) from ${selectedProduct.supplier} suitable for my farm crops? Give me agronomic usage advice.` }
                      }));
                    }}
                    className="px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Ask AgriGPT
                  </button>

                  <button
                    onClick={() => {
                      addToCart({
                        id: selectedProduct.id,
                        name: selectedProduct.name,
                        price: selectedProduct.price,
                        supplier: selectedProduct.supplier
                      });
                      setSelectedProduct(null);
                    }}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
