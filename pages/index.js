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

export default function LandingPage() {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <span className="text-lg font-bold text-indigo-600">Inventory Manager</span>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <button className="px-4 py-2 text-indigo-600 font-medium rounded-md cursor-pointer text-sm">Login</button>
                </Link>
                <Link href="/register">
                  <button className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md cursor-pointer text-sm">Register</button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <section className="bg-gradient-to-r from-indigo-800 to-purple-950 text-white py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row-reverse items-center">
              <div className="md:w-1/2 mb-10 md:mb-0">
                <h1 className="text-3xl md:text-4xl font-bold mb-6">Complete Inventory & Sales Management</h1>
                <p className="text-lg mb-8">Streamline your business operations with barcode scanning, real-time inventory tracking, and comprehensive sales analytics.</p>
                <div className="flex flex-row sm:flex-row space-y-4 space-x-4 sm:space-y-0 sm:space-x-4">
                  {/* <Link href="/register">
                    <button className="px-6 py-3 border text-white font-medium rounded-md cursor-pointer text-sm">Get Started</button>
                  </Link> */}
                  <Link href="/login">
                    <button className="px-6 py-3 bg-blue-600 border-white text-white font-medium rounded-md cursor-pointer text-sm">View Demo</button>
                  </Link>
                  {/* <Link href="/login">
                    <button className="px-6 py-3 border border-white text-white font-medium rounded-md cursor-pointer text-sm">Login</button>
                  </Link> */}
                </div>
              </div>
              <div className="md:w-1/2 md:mr-20">
                <img src="https://images.pexels.com/photos/4483610/pexels-photo-4483610.jpeg?cs=srgb&dl=pexels-tiger-lily-4483610.jpg&fm=jpg&w=6000&h=4000"
                  alt="Inventory Management"
                  className="rounded-lg shadow-xl" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-2xl font-bold text-gray-900">Powerful Features for Modern Businesses</h2>
              <p className="mt-4 text-lg text-gray-600">Everything you need to manage inventory and track sales in one place</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gray-50 rounded-lg p-8 shadow-sm">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="material-icons text-indigo-600">dashboard</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">Comprehensive Dashboard</h3>
                <p className="text-gray-600 text-sm">Get a bird's-eye view of your inventory with our intuitive dashboard. Monitor key metrics and make informed decisions at a glance.</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-8 shadow-sm">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="material-icons text-indigo-600">qr_code_scanner</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">Barcode Scanning</h3>
                <p className="text-gray-600 text-sm">Quickly add, sell, or look up products using barcode scanning. Works with your device camera or uploaded barcode images.</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-8 shadow-sm">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="material-icons text-indigo-600">bar_chart</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">Sales Analytics</h3>
                <p className="text-gray-600 text-sm">Track your sales performance with detailed charts and reports. Identify trends and make data-driven business decisions.</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-8 shadow-sm">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="material-icons text-indigo-600">inventory</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">Quick Inventory Management</h3>
                <p className="text-gray-600 text-sm">Add or sell products with a single scan. Manage your inventory in real-time with our streamlined interface.</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-8 shadow-sm">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="material-icons text-indigo-600">category</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">Category Management</h3>
                <p className="text-gray-600 text-sm">Organize your products into categories for better management and quicker access to related items.</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-8 shadow-sm">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="material-icons text-indigo-600">devices</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">Responsive Design</h3>
                <p className="text-gray-600 text-sm">Access your inventory from anywhere, on any device. Our responsive design ensures a seamless experience.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-2xl font-bold text-gray-900">How It Works</h2>
              <p className="mt-4 text-lg text-gray-600">Get started in minutes with our intuitive platform</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-indigo-600">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">Create Account</h3>
                <p className="text-gray-600 text-sm">Sign up and set up your inventory profile in seconds.</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-indigo-600">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">Add Products</h3>
                <p className="text-gray-600 text-sm">Manually add products or use barcode scanning for quick entry.</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-indigo-600">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">Manage Inventory</h3>
                <p className="text-gray-600 text-sm">Track stock levels and process sales with barcode scanning.</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-indigo-600">4</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">Analyze Sales</h3>
                <p className="text-gray-600 text-sm">View detailed reports and make data-driven decisions.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-indigo-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold mb-6">Ready to Transform Your Inventory Management?</h2>
            <p className="text-lg mb-8 max-w-3xl mx-auto">Join thousands of businesses that have streamlined their operations with our powerful inventory and sales management solution.</p>
            <Link href="/register">
              <button className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-md text-lg" style={{ cursor: 'pointer' }}>Get Started Now</button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}