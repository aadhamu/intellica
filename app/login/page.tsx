'use client';
import { useState, useEffect } from "react";
import axios from 'axios';
import { motion, AnimatePresence } from "framer-motion";
import { Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Image from 'next/image';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../../component/loader';
import { setCookie } from 'cookies-next';

export default function AuthForm() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email is invalid';
    
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (isRegistering && !form.name) newErrors.name = 'Name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const url = isRegistering 
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/register`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/login`;

    try {
      await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/sanctum/csrf-cookie`, {
        withCredentials: true,
      });

      const { data } = await axios.post(url, form, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (data.token) {
        localStorage.setItem('token', data.token);
        setCookie('auth_token', data.token, {
          maxAge: 2592000,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        window.location.href = '/user/home';
        return;
      }

      setMessage(data.message || (isRegistering ? 'Registration successful!' : 'Login successful!'));
      setMessageType('success');
      setErrors({});

      if (isRegistering) {
        setTimeout(() => setIsRegistering(false), 1500);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data;

        if (status === 422) {
          setErrors(data?.errors || {});
          setMessage(data?.message || 'Validation errors occurred');
        } else if (status === 401) {
          setMessage('Invalid credentials. Please try again.');
        } else if (status === 429) {
          setMessage('Too many attempts. Please try again later.');
        } else {
          setMessage(data?.message || 'An error occurred');
        }
      } else {
        setMessage('Network error. Please try again.');
      }
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const toggleAuthMode = () => {
    setIsRegistering(!isRegistering);
    setMessage('');
    setErrors({});
  };

  const getInitialAnimation = () => {
    if (isMobile) return { x: 0 };
    return { x: isRegistering ? '100%' : '-100%' };
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center p-0 min-vh-100"
      style={{ backgroundColor: 'white' }}>
      {loading && <LoadingSpinner />}
      
      <motion.div 
        className="row g-0 w-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Image Column */}
        <motion.div
          className={`col-12 col-md-6 d-flex justify-content-center align-items-center order-1 ${isRegistering ? 'order-md-2' : 'order-md-1'}`}
          initial={getInitialAnimation()}
          animate={{ x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-100 d-flex justify-content-center align-items-center p-3 p-md-5"
          style={{backgroundColor: 'black'}}>
            <Image
              src="/image/login.png"
              alt="Auth illustration"
              width={400}
              height={400}
              className="img-fluid"
              style={{ objectFit: 'contain', maxHeight: '400px' }}
              priority
            />
          </div>
        </motion.div>

        {/* Form Column */}
        <motion.div
          className={`col-12 col-md-6 ${isRegistering ? 'order-md-1' : 'order-md-2'} order-2`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="d-flex flex-column justify-content-center p-4 p-md-5 bg-white h-100">
            <h2 className="text-center mb-4">
              {isRegistering ? 'Create Your Account' : 'Welcome Back'}
            </h2>

            <Form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {isRegistering && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Form.Floating className="mb-3">
                      <Form.Control
                        type="text"
                        placeholder="Full Name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        isInvalid={!!errors.name}
                      />
                      <label>Full Name</label>
                      <Form.Control.Feedback type="invalid">
                        {errors.name}
                      </Form.Control.Feedback>
                    </Form.Floating>
                  </motion.div>
                )}
              </AnimatePresence>

              <Form.Floating className="mb-3">
                <Form.Control
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                />
                <label>Email</label>
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Floating>

              <Form.Floating className="mb-3 position-relative">
                <Form.Control
                  type={passwordVisible ? 'text' : 'password'}
                  placeholder="Password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  isInvalid={!!errors.password}
                />
                <label>Password</label>
                <button
                  type="button"
                  className="position-absolute end-0 top-50 translate-middle-y bg-transparent border-0 pe-3"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                </button>
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              </Form.Floating>

              {message && (
                <div className={`alert alert-${messageType} mt-3`} style={{color: messageType === 'error' ? '#dc3545' : '#198754'}}>
                  {message}
                </div>
              )}

              <Button
                type="submit"
                className="w-100 py-2 mt-3"
                variant="primary"
                disabled={loading}
              >
                {isRegistering ? 'Register' : 'Login'}
              </Button>

              <div className="text-center mt-3">
                <button
                  type="button"
                  className="btn btn-link text-decoration-none"
                  onClick={toggleAuthMode}
                >
                  {isRegistering
                    ? 'Already have an account? Login'
                    : "Don't have an account? Register"}
                </button>
              </div>
            </Form>
          </div>
        </motion.div>
      </motion.div>

      <style jsx global>{`
        body {
          overflow: auto;
        }
        .form-control:focus {
          box-shadow: none;
          border-color: #0d6efd;
        }
        .btn-link {
          color: #0d6efd;
        }
        .btn-link:hover {
          text-decoration: underline;
        }
        @media (max-width: 767.98px) {
          .min-vh-100 {
            min-height: auto;
            padding-top: 2rem;
            padding-bottom: 2rem;
          }
          .h-100 {
            height: auto !important;
          }
        }
      `}</style>
    </div>
  );
}