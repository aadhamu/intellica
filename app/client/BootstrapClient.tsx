'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import axios from 'axios';
import { getCookie, deleteCookie } from 'cookies-next';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../globals.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from '../../component/Footer';
import { FaMoon, FaSun } from 'react-icons/fa';

interface User {
  id: any;
  avatar?: string;
  name?: string;
  email?: string;
  user_type?: number;
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login';

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (storedTheme) {
      setTheme(storedTheme);
      document.body.classList.toggle('bg-dark', storedTheme === 'dark');
      document.body.classList.toggle('text-white', storedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.classList.toggle('bg-dark', newTheme === 'dark');
    document.body.classList.toggle('text-white', newTheme === 'dark');
  };

  useEffect(() => {
    setIsNavigating(true);
    const timeout = setTimeout(() => setIsNavigating(false), 600);
    return () => clearTimeout(timeout);
  }, [pathname]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = getCookie('auth_token');
        if (!token) {
          setLoading(false);
          return;
        }
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    deleteCookie('auth_token');
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const getAccessibleLinks = () => {
    if (!user) return [];
    return [
      { path: '/user/home', label: 'Home' },
      { path: '/user/about', label: 'About' },
      { path: '/user/services', label: 'Services' },
      { path: '/user/contact', label: 'Contact' },
      { path: '/user/blog/view', label: 'Blogs' },
    ];
  };

  const accessibleLinks = getAccessibleLinks();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const PagePreloader = () => (
    <div className="position-fixed top-0 start-0 w-100 h-100 bg-white d-flex justify-content-center align-items-center" style={{ zIndex: 2000 }}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ rotate: 360, scale: 1 }}
        transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
        className="spinner-border text-primary"
        role="status"
      />
    </div>
  );

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} />
      {isNavigating && <PagePreloader />}

      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5 }}
        className="bg-white"
      >
        {!isLoginPage && (
          <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top">
            <div className="container">
              <Link className="navbar-brand fw-bold fs-4 text-primary" href="/">
                Intellica
              </Link>
              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarContent"
                aria-controls="navbarContent"
                aria-expanded={!isNavCollapsed}
                aria-label="Toggle navigation"
                onClick={handleNavCollapse}
              >
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className={`collapse navbar-collapse ${!isNavCollapsed ? 'show' : ''}`} id="navbarContent">
                <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
                  {accessibleLinks.map(link => (
                    <li key={link.path} className="nav-item">
                      <Link
                        className={`nav-link ${pathname === link.path ? 'active' : ''}`}
                        href={link.path}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="d-flex align-items-center gap-2">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={toggleTheme}
                    title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                  >
                    {theme === 'light' ? <FaMoon /> : <FaSun />}
                  </button>

                  {user ? (
                    <div className="dropdown">
                      <button
                        className="btn dropdown-toggle d-flex align-items-center gap-2"
                        type="button"
                        id="userDropdown"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        {user.avatar ? (
                          <img src={user.avatar} alt="Avatar" className="rounded-circle" width={40} height={40} />
                        ) : (
                          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                            {user.name?.charAt(0) || 'U'}
                          </div>
                        )}
                        <div className="d-none d-md-flex flex-column text-start">
                          <span className="fw-semibold">{user.name || user.email}</span>
                          <small className="text-muted">
                            {user.user_type === 0 && 'Super Admin'}
                            {user.user_type === 1 && 'Admin'}
                            {user.user_type === 2 && 'User'}
                          </small>
                        </div>
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                        <li><Link className="dropdown-item" href="/user/profile/user">Profile</Link></li>
                        {user.user_type === 1 && (
                          <>
                            <li><Link className="dropdown-item" href="/user/blog/add">Add Blog</Link></li>
                            <li><Link className="dropdown-item" href={`/user/profile/${user.id}`}>Edit Admin</Link></li>
                          </>
                        )}
                        {user.user_type === 2 && (
                          <li><Link className="dropdown-item" href="/user/consultants/apply">Apply as Consultant</Link></li>
                        )}
                        {user.user_type === 0 && (
                          <li><Link className="dropdown-item" href="/admin/consultants">Manage Consultants</Link></li>
                        )}
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <button className="dropdown-item" onClick={handleLogout}>Logout</button>
                        </li>
                      </ul>
                    </div>
                  ) : (
                    <Link className="btn btn-outline-primary" href="/login">Login</Link>
                  )}
                </div>
              </div>
            </div>
          </nav>
        )}

        <div className={`main-content ${isLoginPage ? '' : 'pt-5 mt-5'}`}>
          {children}
        </div>
      </motion.div>

      {!isLoginPage && (
        <footer>
          <Footer />
        </footer>
      )}
    </>
  );
}
