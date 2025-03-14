import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Topbar from '@/components/Topbar';
import BarcodeScanner from '../components/BarcodeScanner';
import BarcodeImageUpload from '../components/BarcodeImageUpload';
import ImageUpload from '@/components/ImageUpload';

export default function AddProduct() {
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    category: '',
    price: '',
    quantity: '',
    description: '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanMode, setScanMode] = useState(null);
  const [productExists, setProductExists] = useState(false);
  const [existingProduct, setExistingProduct] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const { barcode } = router.query;
    if (barcode) {
      setFormData({
        ...formData,
        barcode
      });
    }
  }, [router.query]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === 'barcode' && value) {
      checkProductExists(value);
    }
  };

  const handleBarcodeDetected = async (barcode) => {
    setFormData({
      ...formData,
      barcode,
    });

    setScanMode(null);

    await checkProductExists(barcode);
  };

  const checkProductExists = async (barcode) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch(`/api/products/barcode/${barcode}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success && data.data) {
        setProductExists(true);
        setExistingProduct(data.data);
      } else {
        setProductExists(false);
        setExistingProduct(null);
      }
    } catch (error) {
      console.error("Error checking product:", error);
      setProductExists(false);
      setExistingProduct(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      let url = '/api/products/add';
      let method = 'POST';
      let successMessage = 'Product added successfully!';

      if (productExists && existingProduct) {
        url = `/api/products/${existingProduct._id}`;
        method = 'PUT';
        successMessage = 'Product quantity updated!';

        const updatedProduct = {
          ...existingProduct,
          quantity: parseInt(existingProduct.quantity) + parseInt(formData.quantity),
        };

        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedProduct),
        });

        if (res.status === 403) {
          const data = await res.json();
          window.alert(data.message);
          return;
        }

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Something went wrong');
        }

        alert(successMessage);
        router.push('/dashboard');
      } else {
        const res = await fetch(url, {
          method,
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
          throw new Error(data.message || 'Something went wrong');
        }

        router.push('/dashboard');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScanError = (err) => {
    setError(`Barcode scanning error: ${err.message}`);
    setScanMode(null);
  };

  return (
    <>
      <Topbar />
      <div className="container mx-auto p-4 w-full sm:w-1/2">
        <h1 className="text-xl font-semibold mb-6">Add New Product</h1>

        {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}

        {productExists && existingProduct && (
          <div className="bg-yellow-100 p-4 mb-6 rounded shadow-md">
            <p className="text-xs text-yellow-700">Product with this barcode already exists!</p>
            <p><strong>Name:</strong> {existingProduct.name}</p>
            <p><strong>Current Quantity:</strong> {existingProduct.quantity}</p>
            <p>Adding {formData.quantity} more units will update the total quantity to {parseInt(existingProduct.quantity) + parseInt(formData.quantity || 0)}.</p>
          </div>
        )}

        <div className="bg-white p-4 rounded shadow-lg mb-6">
          <h2 className="text-base font-semibold mb-4">Scan Barcode</h2>
          <div className="flex gap-4 mb-4">
            <button
              type="button"
              className="cursor-pointer bg-slate-700 text-white p-2 rounded hover:bg-slate-700 transition-all text-xs"
              onClick={() => setScanMode(scanMode === 'camera' ? null : 'camera')}
            >
              {scanMode === 'camera' ? 'Close Camera' : 'Scan with Camera'}
            </button>
            <button
              type="button"
              className="cursor-pointer bg-slate-700 text-white p-2 rounded hover:bg-slate-700 transition-all text-xs"
              onClick={() => setScanMode(scanMode === 'upload' ? null : 'upload')}
            >
              {scanMode === 'upload' ? 'Cancel Upload' : 'Upload Barcode Image'}
            </button>
          </div>

          {scanMode === 'camera' && (
            <BarcodeScanner onDetected={handleBarcodeDetected} onError={handleScanError} />
          )}

          {scanMode === 'upload' && (
            <BarcodeImageUpload onDetected={handleBarcodeDetected} onError={handleScanError} />
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-lg">
          <div className="mb-4">
            <label htmlFor="barcode" className="block text-xs font-medium">Barcode</label>
            <input
              type="text"
              id="barcode"
              name="barcode"
              value={formData.barcode}
              onChange={handleChange}
              placeholder="Enter barcode"
              className="mt-2 p-2 w-full border border-gray-300 rounded text-sm"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="name" className="block text-xs font-medium">Product Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={productExists && existingProduct ? existingProduct.name : formData.name}
              onChange={handleChange}
              required
              disabled={productExists}
              placeholder="Enter product name"
              className="mt-2 p-2 w-full border border-gray-300 rounded text-sm"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="category" className="block text-xs font-medium">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              value={productExists && existingProduct ? existingProduct.category : formData.category}
              onChange={handleChange}
              required
              disabled={productExists}
              placeholder="Enter category"
              className="mt-2 p-2 w-full border border-gray-300 rounded text-sm"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="price" className="block text-xs font-medium">Price (₹)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={productExists && existingProduct ? existingProduct.price : formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              disabled={productExists}
              placeholder="Enter price"
              className="mt-2 p-2 w-full border border-gray-300 rounded text-sm"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="quantity" className="block text-xs font-medium">Quantity</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              required
              placeholder="Enter quantity"
              className="mt-2 p-2 w-full border border-gray-300 rounded text-sm"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium">Product Image</label>
            <ImageUpload
              onUpload={(url) => setFormData({ ...formData, imageUrl: url })}
              disabled={productExists}
              value={productExists && existingProduct ? existingProduct.imageUrl : formData.imageUrl}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-xs font-medium">Description</label>
            <textarea
              id="description"
              name="description"
              value={productExists && existingProduct ? existingProduct.description : formData.description}
              onChange={handleChange}
              required
              disabled={productExists}
              placeholder="Enter product description"
              className="mt-2 p-2 w-full border border-gray-300 rounded text-sm"
            ></textarea>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer w-full py-2 bg-slate-700 text-white rounded hover:bg-slate-700 transition-all text-sm"
            >
              {loading ? 'Adding...' : productExists ? 'Update Quantity' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}