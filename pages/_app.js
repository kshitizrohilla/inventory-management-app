import "@/styles/globals.css";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const publicPaths = ['/', '/login', '/register'];

  useEffect(() => {
    authCheck(router.asPath);
    const hideContent = () => setAuthorized(false);
    router.events.on('routeChangeStart', hideContent);
    router.events.on('routeChangeComplete', authCheck);
    return () => {
      router.events.off('routeChangeStart', hideContent);
      router.events.off('routeChangeComplete', authCheck);
    };
  }, [router]);

  function authCheck(url) {
    const path = url.split('?')[0];
    if (publicPaths.includes(path)) {
      setAuthorized(true);
    } else {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (!token) {
          setAuthorized(false);
          router.push('/login');
        } else {
          setAuthorized(true);
        }
      }
    }
  }

  return authorized ? <Component {...pageProps} /> : null;
}

export default MyApp;