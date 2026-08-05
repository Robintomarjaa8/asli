import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

const CategoryPage = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true);
      try {
        const catRes = await api.get(`/categories/slug/${slug}`);
        setCategory(catRes.data.data);
        const prodRes = await api.get(`/products?category=${catRes.data.data._id}&limit=50`);
        setProducts(prodRes.data.data);
      } catch (error) {
        console.error('Error fetching category:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [slug]);

  return (
    <div className="container-custom py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="section-title mb-2">{category?.name || 'Category'}</h1>
        <p className="text-gray-500 dark:text-gray-400">{category?.description}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card p-4">
              <div className="skeleton aspect-square rounded-xl mb-4" />
              <div className="skeleton h-4 w-3/4 mb-2" />
              <div className="skeleton h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold mb-2">No products in this category yet</h3>
          <p className="text-gray-500">Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;