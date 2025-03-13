import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Topbar from '@/components/Topbar';
import Fuse from 'fuse.js';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ totalProducts: 0, totalValue: 0, outOfStock: 0, categories: 0 });
  const [fuse, setFuse] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const options = {
        keys: ['name', 'category'],
        threshold: 0.5,
        includeScore: true,
        ignoreLocation: true,
        minMatchCharLength: 1
      };
      setFuse(new Fuse(products, options));
      setFilteredProducts(products);
    }
  }, [products]);

  useEffect(() => {
    if (!fuse) return;
    const results = searchQuery ? fuse.search(searchQuery) : products;
    setFilteredProducts(results.map(result => result.item || result));
  }, [searchQuery, fuse, products]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const res = await fetch('/api/products', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
        calculateStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (products) => {
    const totalProducts = products.length;
    const totalValue = products.reduce((acc, product) => acc + (product.price * product.quantity), 0);
    const outOfStock = products.filter(product => product.quantity === 0).length;
    const uniqueCategories = new Set(products.map(product => product.category));
    setStats({
      totalProducts,
      totalValue,
      outOfStock,
      categories: uniqueCategories.size
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setProducts(products.filter(product => product._id !== id));
          calculateStats(products.filter(product => product._id !== id));
        }
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  return (
    <>
      <Topbar />
      <div className="container mx-auto p-4 w-full sm:w-3/4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Inventory Stats</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-4 rounded shadow-lg hover:shadow-xl transition-all">
              <h3 className="text-base font-medium">Total Products</h3>
              <p className="text-lg">{stats.totalProducts}</p>
            </div>
            <div className="bg-white p-4 rounded shadow-lg hover:shadow-xl transition-all">
              <h3 className="text-base font-medium">Total Store Value</h3>
              <p className="text-lg">₹{stats.totalValue.toFixed(2)}</p>
            </div>
            <div className="bg-white p-4 rounded shadow-lg hover:shadow-xl transition-all relative">
              <h3 className="text-base font-medium">Out of Stock</h3>
              <p className="text-lg">{stats.outOfStock}</p>
              <Link href="/out-of-stock" className="cursor-pointer absolute bottom-4 right-4 bg-slate-700 text-white p-2 text-xs rounded hover:bg-slate-800 transition-all">
                View Items
              </Link>
            </div>
            <div className="bg-white p-4 rounded shadow-lg hover:shadow-xl transition-all relative">
              <h3 className="text-base font-medium">Categories</h3>
              <p className="text-lg">{stats.categories}</p>
              <Link href="/categories" className="absolute bottom-4 right-4 bg-slate-700 text-white p-2 text-xs rounded hover:bg-slate-800 transition-all cursor-pointer">
                View Categories
              </Link>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Inventory Items</h2>
          <input
            type="text"
            className="mb-4 p-2 border border-gray-300 rounded w-full sm:w-1/2 text-sm"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {loading ? (
            <p className="text-sm">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-auto w-full border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-sm">S. No.</th>
                    <th className="px-3 py-2 text-sm">Name</th>
                    <th className="px-3 py-2 text-sm">Category</th>
                    <th className="px-3 py-2 text-sm">Price (₹)</th>
                    <th className="px-3 py-2 text-sm">Quantity</th>
                    <th className="px-3 py-2 text-sm">Value (₹)</th>
                    <th className="px-3 py-2 text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => (
                    <tr key={product._id} className="hover:bg-gray-50 border-t border-gray-200">
                      <td className="px-3 py-2 text-sm">{index + 1}</td>
                      <td className="px-3 py-2 text-sm">{product.name}</td>
                      <td className="px-3 py-2 text-sm">{product.category}</td>
                      <td className="px-3 py-2 text-sm">₹{product.price}</td>
                      <td className="px-3 py-2 text-sm">{product.quantity}</td>
                      <td className="px-3 py-2 text-sm">₹{(product.price * product.quantity).toFixed(2)}</td>
                      <td className="px-3 py-2 text-sm">
                        <div className="flex gap-4">
                          <Link href={`/product/${product._id}`}>
                            <button className="cursor-pointer text-slate-600 text-xl hover:text-blue-500">
                              <span className="material-icons">visibility</span>
                            </button>
                          </Link>
                          <Link href={`/product/edit/${product._id}`}>
                            <button className="cursor-pointer text-slate-600 text-xl hover:text-green-500">
                              <span className="material-icons">edit</span>
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="cursor-pointer text-slate-600 text-xl hover:text-red-500"
                          >
                            <span className="material-icons">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}