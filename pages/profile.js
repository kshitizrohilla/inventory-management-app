import { useState, useEffect } from 'react';
import Topbar from '@/components/Topbar';

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  if (!user) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Topbar />
      <div className="container mx-auto p-4 w-full sm:w-1/2">
        <h1 className="text-xl font-bold mb-6">User Profile</h1>

        <div className="flex flex-col items-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-24 w-24 text-gray-500 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <h2 className="text-lg font-semibold">{user.fullName}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded shadow-lg hover:shadow-xl transition-all">
            <h3 className="text-base font-medium">Email</h3>
            <p className="text-sm text-gray-700">{user.email}</p>
          </div>

          <div className="bg-white p-4 rounded shadow-lg hover:shadow-xl transition-all">
            <h3 className="text-base font-medium">Account ID</h3>
            <p className="text-sm text-gray-700">{user.id}</p>
          </div>
        </div>
      </div>
    </>
  );
}