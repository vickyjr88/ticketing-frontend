import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import './Products.css';

export default function Products() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('ALL');

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [products, search, category]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await api.getProducts();
            // Filter out products where event is not active or null if needed
            // But for now assume backend returns valid data
            setProducts(data);
        } catch (err) {
            console.error('Failed to load products:', err);
        } finally {
            setLoading(false);
        }
    };

    const filterProducts = () => {
        let filtered = [...products];

        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q) ||
                p.event?.title?.toLowerCase().includes(q)
            );
        }

        if (category !== 'ALL') {
            filtered = filtered.filter(p => p.type === category);
        }

        setFilteredProducts(filtered);
    };

    const handleBuyNow = (product) => {
        navigate('/checkout', {
            state: {
                eventId: product.event_id,
                items: [], // No tickets
                products: { [product.id]: 1 },
                event: product.event
            }
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    return (
        <div className="products-page">
            <div className="page-header">
                <h1>Merch & Add-Ons</h1>
                <p>Enhance your experience with official merchandise</p>
            </div>

            <div className="filters-bar">
                <div className="search-box">
                    <Search className="icon" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="category-filters">
                    {['ALL', 'MERCH', 'PARKING', 'BEVERAGE', 'SNACK', 'OTHER'].map(cat => (
                        <button
                            key={cat}
                            className={`filter-btn ${category === cat ? 'active' : ''}`}
                            onClick={() => setCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="products-grid">
                {filteredProducts.length === 0 ? (
                    <div className="empty-state">
                        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No products found</p>
                    </div>
                ) : (
                    filteredProducts.map(product => (
                        <div key={product.id} className="product-card">
                            <div className="product-image">
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} />
                                ) : (
                                    <div className="no-image"><ShoppingBag className="w-8 h-8" /></div>
                                )}
                                <span className="product-category">{product.type}</span>
                            </div>
                            <div className="product-content">
                                <h3>{product.name}</h3>
                                <p className="description">{product.description}</p>

                                {product.event && (
                                    <div className="event-link" onClick={() => navigate(`/events/${product.event_id}`)}>
                                        <span>For event: <strong>{product.event.title}</strong></span>
                                        <ExternalLink className="w-3 h-3" />
                                    </div>
                                )}

                                <div className="product-footer">
                                    <span className="price">{formatCurrency(product.price)}</span>
                                    <button
                                        className="btn-buy"
                                        onClick={() => handleBuyNow(product)}
                                        disabled={product.stock <= 0}
                                    >
                                        {product.stock > 0 ? 'Buy Now' : 'Out of Stock'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
