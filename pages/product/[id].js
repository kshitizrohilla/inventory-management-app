import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Topbar from '@/components/Topbar';

export default function ViewProduct() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch(`/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch product');
      }

      setProduct(data.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        Product not found
      </div>
    );
  }

  return (
    <>
      <Topbar />
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Product Details</h1>
          <button
            onClick={() => router.back()}
            className="bg-slate-700 hover:bg-slate-800 text-white text-sm cursor-pointer py-2 px-4 rounded-md transition-all"
          >
            Back
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex justify-center items-center bg-gray-50 rounded-lg p-4">
              {product.imageUrl ? (
                <div className="relative w-full h-64">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="object-contain w-full h-full rounded-lg"
                  />
                </div>
              ) : (
                <div className="bg-gray-200 h-64 w-full flex items-center justify-center rounded-lg">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
            </div>

            <div>
              <div className="mb-6">
                <h2 className="text-gray-500 text-sm font-medium">Product Name</h2>
                <p className="text-2xl font-semibold">{product.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h2 className="text-gray-500 text-sm font-medium">Category</h2>
                  <p className="text-lg">{product.category}</p>
                </div>
                <div>
                  <h2 className="text-gray-500 text-sm font-medium">Price</h2>
                  <p className="text-lg">₹{product.price}</p>
                </div>
                <div>
                  <h2 className="text-gray-500 text-sm font-medium">Quantity</h2>
                  <p className="text-lg">{product.quantity}</p>
                </div>
                <div>
                  <h2 className="text-gray-500 text-sm font-medium">Value</h2>
                  <p className="text-lg">₹{(product.price * product.quantity).toFixed(2)}</p>
                </div>
              </div>

              <div>
                <h2 className="text-gray-500 text-sm font-medium mb-2">Description</h2>
                <p className="text-gray-700">{product.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}