'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import axios from 'axios';
import { getCookie, deleteCookie } from 'cookies-next';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../globals.css';
import * as bootstrap from 'bootstrap';
import { toast } from 'react-toastify';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from '../../component/Footer';

interface User {
  id: any;
  avatar?: string;
  name?: string;
  email?: string;
  user_type?: number; // 0 = Super Admin, 1 = Admin, 2 = Regular User
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login';

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

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
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
    const commonLinks = [
      { path: '/user/home', label: 'Home' },
      { path: '/user/about', label: 'About' },
      { path: '/user/services', label: 'Services' },
      { path: '/user/contact', label: 'Contact' },
      { path: '/user/blog/view', label: 'Blogs' },
    ];
    return [...commonLinks];
  };

  const accessibleLinks = getAccessibleLinks();

  if (loading) {
    return (
      <div className="preloader d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const PagePreloader = () => (
    <div className="page-preloader d-flex justify-content-center align-items-center position-fixed top-0 start-0 w-100 h-100 bg-white" style={{ zIndex: 2000 }}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ rotate: 360, scale: 1 }}
        transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
        className="spinner-border text-primary"
        // style={{ width: '3rem', height: '3rem' }}
        role="status"
      />
    </div>
  );

  return (
    <>
      <style>{`
        body {
          font-family: 'Poppins', sans-serif;
          background-color: #ffffff;
        }
          .title{
          color: #0d6efd;
          padding-left: ;
        }
        .navbar-custom {
          background-color: #ffffff;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        }
        .navbar-brand {
          font-weight: 700;
          font-size: 1.7rem;
          color: #0d6efd !important;
        }
        .nav-link {
          font-weight: 500;
          color: #0d6efd !important;
          margin: 0 0.7rem;
          position: relative;
          transition: all 0.3s ease;
        }
        .nav-link:hover, .nav-link.active {
          color: #6610f2 !important;
          transform: translateY(-2px);
        }
        .nav-link.active:after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 100%;
          height: 3px;
          background-color: #6610f2;
          border-radius: 2px;
        }
        .dropdown-menu {
          animation: fadeIn 0.3s ease;
          border-radius: 10px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
        }
        .dropdown-item {
          
          transition: background 0.3s ease;

        }
        .dropdown-item:hover {
          background-color: #e9ecef;
          color: #0d6efd;
        }
        .user-avatar, .initials-avatar {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          object-fit: cover;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .initials-avatar {
          background-color: #0d6efd;
          color: #fff;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .btn-outline-primary {
          border-color: #0d6efd;
          color: #0d6efd;
          transition: all 0.3s ease;
        }
        .btn-outline-primary:hover {
          background-color: #0d6efd;
          color: #fff;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .spinner-border {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <ToastContainer position="top-right" autoClose={5000} />
      {isNavigating && <PagePreloader />}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="bg-white"
      >
        {!isLoginPage && (
          <nav className="navbar navbar-expand-lg navbar-custom fixed-top mb-5">
            <div className="container">
              <Link className="navbar-brand" href="/">
                <span className='title'>Intellica</span>
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
                  {accessibleLinks.map((link) => (
                    <li key={link.path} className="nav-item">
                      <Link className={`nav-link ${pathname === link.path ? 'active' : ''}`} href={link.path}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="d-flex">
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
                          <img src={user.avatar} alt="User Avatar" className="user-avatar" />
                        ) : (
                          <div className="initials-avatar">{user.name?.charAt(0) || 'U'}</div>
                        )}
                        <div className="d-flex flex-column text-start">
                          <span className="fw-semibold">{user.name || user.email}</span>
                          <small className="text-muted">
                            {user.user_type === 0 && 'Super Admin'}
                            {user.user_type === 1 && 'Admin'}
                            {user.user_type === 2 && 'Welcome back'}
                          </small>
                        </div>
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                        <li>
                          <Link className="dropdown-item" href="/user/profile/user">
                            <i className="bi bi-person me-2"></i>Profile
                          </Link>
                        </li>
                        {( user.user_type === 1) && (
                          <li>
                            <Link className="dropdown-item" href="/user/blog/add">
                              <i className="bi bi-plus-circle me-2"></i>Add Blog
                            </Link>
                          </li>
                        )}
                        {user.user_type === 1 && (
                          <li>
                            <Link className="dropdown-item" href={`/user/profile/${user.id}`}>
                              <i className="bi bi-pencil-square me-2"></i>Edit Admin
                            </Link>
                          </li>
                        )}
                        {user.user_type === 2 && (
                          <li>
                            <Link className="dropdown-item" href="/user/consultants/apply">
                              <i className="bi bi-file-earmark-text me-2"></i>Apply to be a consultant
                            </Link>
                          </li>
                        )}
                        {user.user_type === 0 && (
                          <li>
                            <Link className="dropdown-item" href="/admin/consultants">
                              <i className="bi bi-people me-2"></i>Manage Consultants
                            </Link>
                          </li>
                        )}
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <button className="dropdown-item" onClick={handleLogout}>
                            <i className="bi bi-box-arrow-right me-2"></i>Logout
                          </button>
                        </li>
                      </ul>
                    </div>
                  ) : (
                    <Link className="btn btn-outline-primary" href="/login">
                      Login
                    </Link>
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
