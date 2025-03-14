import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Topbar from '@/components/Topbar';

export default function EditProduct() {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
    description: '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

      setFormData(data.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.status === 403) {
        const data = await res.json();
        window.alert(data.message);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update product');
      }

      router.push('/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Topbar />
      <div className="container mx-auto p-4 max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Edit Product</h1>
          <button
            onClick={() => router.back()}
            className="cursor-pointer text-sm bg-slate-700 hover:bg-slate-800 text-white py-2 px-4 rounded-md transition-all"
          >
            Cancel
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="text-sm bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-gray-500 text-sm font-medium">Product Name</h2>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-4 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-md"
              required
            />
          </div>

          <div className="mb-6">
            <h2 className="text-gray-500 text-sm font-medium">Category</h2>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-4 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-md"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-gray-500 text-sm font-medium">Price (₹)</h2>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-4 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-md"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <h2 className="text-gray-500 text-sm font-medium">Quantity</h2>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full p-4 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-md"
                min="0"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-gray-500 text-sm font-medium">Image URL</h2>
            <input
              type="text"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full p-4 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-md"
            />
          </div>

          <div className="mb-6">
            <h2 className="text-gray-500 text-sm font-medium">Description</h2>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-4 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-md"
              rows="4"
              required
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="cursor-pointer bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-all"
            >
              {saving ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}