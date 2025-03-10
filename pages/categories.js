import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Topbar from '@/components/Topbar';
import Link from 'next/link';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
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
        const uniqueCategories = [...new Set(data.data.map(product => product.category))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Topbar />
      <div className="container mx-auto p-4 w-full sm:w-3/4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Product Categories</h2>
          <div className="flex justify-start mb-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="cursor-pointer bg-slate-700 text-white px-4 py-2 text-sm rounded hover:bg-slate-800 transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm">Loading...</p>
        ) : categories.length === 0 ? (
          <div className="bg-white p-4 rounded shadow-lg hover:shadow-xl transition-all">
            <p className="text-sm text-gray-600">No categories found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Link href={`/category/${encodeURIComponent(category)}`} key={index}>
                <div className="bg-white p-4 rounded shadow-lg hover:shadow-xl transition-all">
                  <h3 className="text-base font-medium text-gray-700">{category}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}