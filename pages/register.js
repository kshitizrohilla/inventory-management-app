import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { parse } from 'cookie';
import jwt from 'jsonwebtoken';

export async function getServerSideProps({ req }) {
  const cookies = req.headers.cookie || '';
  const { token } = parse(cookies);

  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false,
        },
      };
    } catch (error) {
    }
  }

  return {
    props: {},
  };
}

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      router.push('/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-lg font-bold text-indigo-600">Inventory Manager</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <button className="px-4 py-2 text-indigo-600 font-medium cursor-pointer text-sm">Login</button>
              </Link>
              <Link href="/register">
                <button className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md cursor-pointer text-sm">Register</button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-100 via-purple-100 to-indigo-100 filter blur-sm" />

      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div className="w-full max-w-md p-8 bg-white bg-opacity-80 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold text-center text-gray-900 mb-4">Create your account</h2>
          {error && (
            <div className="mt-4 text-center text-sm text-red-600">
              {error}
            </div>
          )}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="w-full px-4 py-3 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer w-full py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>

            <div className="text-center mt-4 text-sm text-gray-600">
              <Link href="/login" className="text-indigo-600 hover:text-indigo-500">
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}