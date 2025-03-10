import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Topbar from '@/components/Topbar';

export default function CategoryProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { category } = router.query;

  useEffect(() => {
    if (category) {
      fetchCategoryProducts();
    }
  }, [category]);

  const fetchCategoryProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch('/api/products', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        const categoryProducts = data.data.filter(
          product => product.category === decodeURIComponent(category)
        );
        setProducts(categoryProducts);
      }
    } catch (error) {
      console.error('Error fetching category products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setProducts(products.filter(product => product._id !== id));
        }
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  if (!category) {
    return (
      <div className="container mx-auto px-4">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Topbar />
      <div className="container mx-auto p-4 w-full sm:w-3/4">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Category: {decodeURIComponent(category)}</h1>
          <button
            onClick={() => router.push('/categories')}
            className="cursor-pointer bg-slate-700 text-white px-4 py-2 text-sm rounded hover:bg-slate-800 transition-all"
          >
            Back to Categories
          </button>
        </div>

        {loading ? (
          <p className="text-sm">Loading...</p>
        ) : products.length === 0 ? (
          <div className="bg-white p-4 rounded shadow-lg">
            <p>No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white p-4 rounded shadow-lg hover:shadow-xl transition-all"
              >
                <div className="relative mb-4">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded">
                      No image available
                    </div>
                  )}
                  {product.quantity === 0 && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 text-sm">
                      Out of Stock
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-base font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-600">Price: ₹{product.price}</p>
                  <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
                </div>
                <div className="mt-4 flex gap-4">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}