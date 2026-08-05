import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    categorySlug: searchParams.get('categorySlug') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page')) || 1,
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data.data);
      setTotalPages(data.totalPages);
      setTotal(data.total);
      if (data.brands) setBrands(data.brands);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  useEffect(() => {
    // Sync URL params
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  }, [filters]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: key === 'page' ? value : 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      categorySlug: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      sort: 'newest',
      page: 1,
    });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== '' && v !== 'newest' && v !== 1);

  return (
    <div className="container-custom py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Shop</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{total} products found</p>
        </div>
        <button
          className="lg:hidden btn-outline"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <FiFilter className="mr-2" /> Filters
        </button>
      </div>

      <div className="flex gap-8">
        {/* Filters sidebar */}
        <aside
          className={`${
            filtersOpen ? 'block' : 'hidden'
          } lg:block w-64 shrink-0 space-y-6`}
        >
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Filters</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-primary-600 hover:text-primary-700">
                  Clear All
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Categories</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={!filters.category}
                    onChange={() => updateFilter('category', '')}
                    className="accent-primary-600"
                  />
                  All
                </label>
                {categories.map((cat) => (
                  <label key={cat._id} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={filters.category === cat._id}
                      onChange={() => updateFilter('category', cat._id)}
                      className="accent-primary-600"
                    />
                    {cat.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Price</h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  className="input text-sm py-1.5"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  className="input text-sm py-1.5"
                />
              </div>
              <div className="mt-3 space-y-2">
                {['', '1000', '5000', '10000'].map((range, idx) => {
                  const labels = ['All', 'Under ₹1,000', 'Under ₹5,000', 'Under ₹10,000'];
                  return (
                    <label key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={filters.maxPrice === range}
                        onChange={() => {
                          updateFilter('maxPrice', range);
                          if (range === '') updateFilter('minPrice', '');
                        }}
                        className="accent-primary-600"
                      />
                      {labels[idx]}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Rating */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Rating</h4>
              <div className="space-y-2">
                {['', '4', '3', '2'].map((rating, idx) => (
                  <label key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      checked={filters.rating === rating}
                      onChange={() => updateFilter('rating', rating)}
                      className="accent-primary-600"
                    />
                    {rating ? `${rating}★ & above` : 'All Ratings'}
                  </label>
                ))}
              </div>
            </div>

            {/* Brands */}
            {brands.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Brands</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                    <input
                      type="radio"
                      name="brand"
                      checked={!filters.brand}
                      onChange={() => updateFilter('brand', '')}
                      className="accent-primary-600"
                    />
                    All Brands
                  </label>
                  {brands.map((brand) => (
                    <label key={brand} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                      <input
                        type="radio"
                        name="brand"
                        checked={filters.brand === brand}
                        onChange={() => updateFilter('brand', brand)}
                        className="accent-primary-600"
                      />
                      {brand}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1">
          {/* Sort */}
          <div className="flex items-center justify-between mb-4">
            <select
              value={filters.sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="input w-auto text-sm"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="popular">Most Popular</option>
              <option value="discount">Discount</option>
            </select>
          </div>

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-4">
                  <div className="skeleton aspect-square rounded-xl mb-4" />
                  <div className="skeleton h-4 w-3/4 mb-2" />
                  <div className="skeleton h-4 w-1/2 mb-4" />
                  <div className="skeleton h-10 w-full rounded-lg" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No products found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your filters or search term</p>
              <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => updateFilter('page', Math.max(1, filters.page - 1))}
                disabled={filters.page === 1}
                className="btn-outline p-2 disabled:opacity-50"
              >
                <FiChevronLeft />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => updateFilter('page', i + 1)}
                  className={`w-10 h-10 rounded-lg font-medium transition-all ${
                    filters.page === i + 1
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => updateFilter('page', Math.min(totalPages, filters.page + 1))}
                disabled={filters.page === totalPages}
                className="btn-outline p-2 disabled:opacity-50"
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;