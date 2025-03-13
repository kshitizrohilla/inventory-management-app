import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import BarcodeScanner from '../components/BarcodeScanner';
import BarcodeImageUpload from '../components/BarcodeImageUpload';
import Topbar from '@/components/Topbar';
import Fuse from 'fuse.js';

export default function ManageInventory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scanMode, setScanMode] = useState(null);
  const [operationMode, setOperationMode] = useState('add');
  const [scannedProduct, setScannedProduct] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [fuse, setFuse] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const options = {
        keys: ['name', 'category', 'barcode'],
        threshold: 0.5,
        ignoreLocation: true,
        minMatchCharLength: 1,
        includeMatches: true
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
      const res = await fetch('/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeDetected = async (barcode) => {
    setScanMode(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/products/barcode/${barcode}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        if (operationMode === 'add') {
          await addSingleProduct(data.data);
        } else if (operationMode === 'sell') {
          await sellSingleProduct(data.data);
        }
      } else {
        if (operationMode === 'add') {
          router.push(`/add-product?barcode=${barcode}`);
        } else {
          setError(`No product found with barcode ${barcode}`);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to process barcode');
    }
  };

  const addSingleProduct = async (product) => {
    try {
      const token = localStorage.getItem('token');
      const updatedProduct = {
        ...product,
        quantity: product.quantity + 1,
      };
      const res = await fetch(`/api/products/${product._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProduct),
      });
      const data = await res.json();
      if (data.success) {
        setProducts(products.map(p => p._id === product._id ? data.data : p));
        setRecentActivity([{
          type: 'add',
          product: product.name,
          quantity: 1,
          timestamp: new Date()
        }, ...recentActivity.slice(0, 9)]);
        setScannedProduct({
          ...data.data,
          action: 'added',
          previousQuantity: product.quantity
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to update product');
    }
  };

  const sellSingleProduct = async (product) => {
    try {
      if (product.quantity < 1) {
        setError(`Cannot sell ${product.name}. Out of stock.`);
        return;
      }
      const token = localStorage.getItem('token');
      const updatedProduct = {
        ...product,
        quantity: product.quantity - 1,
      };
      const productRes = await fetch(`/api/products/${product._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProduct),
      });
      const productData = await productRes.json();
      if (!productData.success) throw new Error(productData.message);
      const saleData = {
        productId: product._id,
        productName: product.name,
        quantity: 1,
        price: product.price,
        total: product.price * 1,
      };
      await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(saleData),
      });
      setProducts(products.map(p => p._id === product._id ? productData.data : p));
      setRecentActivity([{
        type: 'sell',
        product: product.name,
        quantity: 1,
        timestamp: new Date()
      }, ...recentActivity.slice(0, 9)]);
      setScannedProduct({
        ...productData.data,
        action: 'sold',
        previousQuantity: product.quantity
      });
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to process sale');
    }
  };

  const handleScanError = (err) => {
    setError(`Scanner error: ${err.message}`);
    setScanMode(null);
  };

  return (
    <>
      <Topbar />
      <div className="container mx-auto p-4 w-full sm:w-3/4">
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-6 flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              className="text-red-700 font-bold hover:text-red-500">
              ×
            </button>
          </div>
        )}

        {scannedProduct && (
          <div className="bg-blue-100 text-blue-700 p-4 rounded mb-6 flex justify-between items-center">
            <div>
              <p className="font-semibold">{scannedProduct.action === 'added' ? 'Product Added' : 'Product Sold'}</p>
              <p>{scannedProduct.name} - {scannedProduct.action === 'added' ? 'Added' : 'Sold'} 1 unit</p>
              <p>Previous quantity: {scannedProduct.previousQuantity}, New quantity: {scannedProduct.quantity}</p>
            </div>
            <button
              onClick={() => setScannedProduct(null)}
              className="text-blue-700 font-bold hover:text-blue-500">
              ×
            </button>
          </div>
        )}

        <div className="bg-white p-6 rounded shadow-lg mb-6">
          <h2 className="text-lg font-semibold mb-4">Scan Product Barcode</h2>

          <div className="flex items-center space-x-4 mb-4">
            <span className="text-sm font-medium">Add</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={operationMode === 'sell'}
                onChange={() =>
                  setOperationMode(operationMode === 'sell' ? 'add' : 'sell')
                }
              />
              <div className="w-11 h-6 bg-slate-400 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:bg-slate-700"></div>
              <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ease-in-out peer-checked:translate-x-5"></div>
            </label>
            <span className="text-sm font-medium">Sell</span>
          </div>


          <div className="flex flex-wrap gap-4 mb-4">
            <button
              onClick={() => setScanMode(scanMode === 'camera' ? null : 'camera')}
              className="cursor-pointer bg-slate-700 text-white px-4 py-2 rounded w-full sm:w-auto text-center hover:bg-slate-800">
              <span>📷</span> {scanMode === 'camera' ? 'Close Camera' : 'Scan with Camera'}
            </button>
            <button
              onClick={() => setScanMode(scanMode === 'upload' ? null : 'upload')}
              className="cursor-pointer bg-slate-700 text-white px-4 py-2 rounded w-full sm:w-auto text-center hover:bg-slate-800">
              <span>📁</span> {scanMode === 'upload' ? 'Cancel Upload' : 'Upload Barcode Image'}
            </button>
          </div>

          {scanMode === 'camera' && (
            <div className="bg-gray-50 p-4 rounded shadow mb-6">
              <p>{operationMode === 'add' ? 'Scan a barcode to add 1 unit to inventory.' : 'Scan a barcode to sell 1 unit from inventory.'}</p>
              <BarcodeScanner onDetected={handleBarcodeDetected} onError={handleScanError} />
            </div>
          )}

          {scanMode === 'upload' && (
            <div className="bg-gray-50 p-4 rounded shadow mb-6">
              <p>{operationMode === 'add' ? 'Upload a barcode image to add 1 unit to inventory.' : 'Upload a barcode image to sell 1 unit from inventory.'}</p>
              <BarcodeImageUpload onDetected={handleBarcodeDetected} onError={handleScanError} />
            </div>
          )}
        </div>

        {recentActivity.length > 0 && (
          <div className="bg-white p-6 rounded shadow-lg mb-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <ul className="space-y-4">
              {recentActivity.map((activity, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>{activity.type === 'add' ? 'Added' : 'Sold'} {activity.quantity} unit of {activity.product}</span>
                  <span className="text-gray-500 text-sm">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search products by name, category, or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-3 border border-gray-300 rounded w-full sm:w-1/2 text-sm"
          />
        </div>

        {loading ? (
          <p>Loading products...</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded shadow-lg">
            <table className="table-auto w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-sm">Name</th>
                  <th className="px-4 py-2 text-sm">Barcode</th>
                  <th className="px-4 py-2 text-sm">Category</th>
                  <th className="px-4 py-2 text-sm">Price</th>
                  <th className="px-4 py-2 text-sm">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 border-t border-gray-200">
                    <td className="px-4 py-2 text-sm">{product.name}</td>
                    <td className="px-4 py-2 text-sm">{product.barcode || 'N/A'}</td>
                    <td className="px-4 py-2 text-sm">{product.category}</td>
                    <td className="px-4 py-2 text-sm">₹{product.price}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={product.quantity === 0 ? 'text-red-500 font-bold' : ''}>
                        {product.quantity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}