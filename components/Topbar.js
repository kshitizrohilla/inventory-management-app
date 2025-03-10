import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Topbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const menuItems = [
    {
      href: '/dashboard',
      title: 'Inventory Dashboard',
      icon: 'dashboard',
    },
    {
      href: '/sales-dashboard',
      title: 'Sales Dashboard',
      icon: 'bar_chart',
    },
    {
      href: '/add-product',
      title: 'Add Product',
      icon: 'add_circle',
    },
    {
      href: '/manage-inventory',
      title: 'Manage Inventory',
      icon: 'inventory',
    },
    {
      href: '/profile',
      title: 'Profile',
      icon: 'person',
    },
    {
      href: '#',
      title: 'Logout',
      icon: 'logout',
      action: handleLogout,
    },
  ];

  const currentPageTitle = menuItems.find(item => router.pathname === item.href)?.title;

  return (
    <div className="relative">
      <div className="bg-gray-800 text-white py-4 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-sm font-semibold hidden lg:block">Inventory Management</div>
          <button
            className="lg:hidden text-lg"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
        </div>
        <div className="flex-1 text-center lg:text-left lg:pl-4">
          <span className="lg:hidden">{currentPageTitle}</span>
        </div>
        <div className="hidden lg:flex space-x-4">
          {menuItems.map((item) => (
            <div key={item.href} className="flex items-center">
              {item.href === '#' ? (
                <div
                  onClick={item.action}
                  className="cursor-pointer flex items-center hover:bg-gray-700 px-2 py-1 rounded-sm text-sm"
                >
                  <span className="material-icons text-base">{item.icon}</span>
                  <span className="ml-1 text-sm">{item.title}</span>
                </div>
              ) : (
                <Link href={item.href}>
                  <div className={`${router.pathname === item.href ? 'bg-gray-700' : ''} cursor-pointer flex items-center hover:bg-gray-700 px-2 py-1 rounded-sm text-sm`}>
                    <span className="material-icons text-base">{item.icon}</span>
                    <span className="ml-1 text-sm">{item.title}</span>
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      <div
        className={`z-50 lg:hidden absolute top-full left-0 right-0 bg-gray-800 text-white flex flex-col transition-transform duration-300 ease-out origin-top overflow-hidden ${isMenuOpen ? 'scale-y-100' : 'scale-y-0'}`}
      >
        {menuItems.map((item) => (
          <div key={item.href} className="py-2">
            {item.href === '#' ? (
              <div
                onClick={() => {
                  item.action();
                  setIsMenuOpen(false);
                }}
                className="cursor-pointer flex items-center hover:bg-gray-700 px-4 py-2 rounded-sm text-sm"
              >
                <span className="material-icons text-base">{item.icon}</span>
                <span className="ml-2 text-sm">{item.title}</span>
              </div>
            ) : (
              <Link href={item.href}>
                <div
                  onClick={() => setIsMenuOpen(false)}
                  className={`${router.pathname === item.href ? 'bg-gray-700' : ''} cursor-pointer flex items-center hover:bg-gray-700 px-4 py-2 rounded-sm text-sm`}
                >
                  <span className="material-icons text-base">{item.icon}</span>
                  <span className="ml-2 text-sm">{item.title}</span>
                </div>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}