'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import useSWR from 'swr';
import axios from '../../../lib/axios';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FiArrowRight, FiCheck, FiUsers, FiMessageSquare, FiCalendar, FiSearch } from 'react-icons/fi';

export default function Home() {
  const router = useRouter();
  const { data: user, error } = useSWR('/api/user', () =>
    axios.get('/api/user').then(res => res.data)
  );

  useEffect(() => {
    if (error) {
      router.push('/login');
    }
  }, [error]);

  const services = [
    {
      title: 'AI Consulting',
      description: 'Strategic AI implementation for business transformation',
      image: '/image/consulting.jpg'
    },
    {
      title: 'Development',
      description: 'Custom AI-powered applications for your business',
      image: '/image/development.jpg'
    },
    {
      title: 'Data Analytics',
      description: 'Transform raw data into actionable insights',
      image: '/image/analytics.jpg'
    }
  ];

  const solutions = [
    {
      title: 'AI Strategy',
      description: 'Comprehensive roadmap for AI integration',
      image: '/image/ai-strategy.png'
    },
    {
      title: 'Smart Analytics',
      description: 'Real-time business intelligence dashboards',
      image: '/image/smart-analytics.jpg'
    },
    {
      title: 'Predictive Tools',
      description: 'Forecast trends with machine learning models',
      image: '/image/predictive-tools.jpg'
    }
  ];

  return (
    <div className="bg-light" style={{ backgroundColor: '#f8fbff' }}>
      {/* Floating Background Elements */}
      <div className="position-absolute overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i}
            className="position-absolute rounded-circle bg-primary bg-opacity-10"
            style={{
              // Your styles here
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="min-vh-100 d-flex align-items-center position-relative py-10 mt-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="badge bg-primary bg-opacity-10 text-primary mb-4 px-3 py-2 rounded-pill">
                  AI-Powered Solutions
                </div>
                <h1 className="display-3 fw-bold mb-5">
                  <span className="text-gradient">Transform</span> Your Business With Intelligent AI
                </h1>
                <p className="lead text-muted mb-6">
                  Intellica delivers cutting-edge artificial intelligence solutions that propel your business into the future with precision and efficiency.
                </p>
                <div className="d-flex flex-wrap gap-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/user/services" className="btn btn-primary btn-lg px-5 py-3 rounded-pill shadow">
                      Get Started
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/user/consultants/view" className="btn btn-outline-primary btn-lg px-5 py-3 rounded-pill">
                      Live Demo
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </div>
            <div className="col-lg-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="position-relative"
              >
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-primary bg-opacity-10 rounded-3" style={{ transform: 'rotate(5deg)' }} />
                <div className="position-relative rounded-4 overflow-hidden border border-2 border-white shadow-lg">
                  <Image
                    src="/image/hero.png"
                    alt="Intellica AI Dashboard"
                    width={800}
                    height={600}
                    className="img-fluid"
                    priority
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 bg-white position-relative">
        <div className="container">
          <div className="row justify-content-center mb-8">
            <div className="col-lg-8 text-center">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <span className="badge bg-primary bg-opacity-10 text-primary mb-4">OUR SERVICES</span>
                <h2 className="display-4 fw-bold mb-5">
                  <span className="text-gradient">AI Solutions</span> For Modern Businesses
                </h2>
                <p className="lead text-muted mb-6">
                  We deliver custom AI solutions that solve real business challenges and create measurable impact.
                </p>
              </motion.div>
            </div>
          </div>
          
          <div className="row g-5">
            {services.map((service, index) => (
              <div key={index} className="col-md-4">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                  className="card h-100 border-0 shadow-sm overflow-hidden"
                >
                  <div className="ratio ratio-16x9">
                    <Image
                      src={service.image}
                      alt={service.title}
                      style={{ objectFit: 'cover' }}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="card-body p-4">
                    <h3 className="h4 fw-bold mb-4">{service.title}</h3>
                    <p className="text-muted mb-4">{service.description}</p>
                    <Link href="#" className="btn btn-link text-primary p-0">
                      Learn more <FiArrowRight className="ms-1" />
                    </Link>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-12" style={{ backgroundColor: '#f0f8ff' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-6 mb-lg-0">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <span className="badge bg-primary bg-opacity-10 text-primary mb-4">INTELLIGENT SOLUTIONS</span>
                <h2 className="display-4 fw-bold mb-5">
                  <span className="text-gradient">Tailored AI</span> For Your Industry
                </h2>
                <p className="lead text-muted mb-6">
                  Our platform combines cutting-edge AI technology with industry-specific expertise to deliver reliable, scalable solutions.
                </p>
                
                <div className="row g-4">
                  {[
                    { icon: <FiCheck className="text-primary me-2" />, text: 'Customized implementation' },
                    { icon: <FiCheck className="text-primary me-2" />, text: 'Enterprise-grade security' },
                    { icon: <FiCheck className="text-primary me-2" />, text: '24/7 expert support' },
                    { icon: <FiCheck className="text-primary me-2" />, text: 'Seamless integration' }
                  ].map((item, i) => (
                    <div key={i} className="col-md-6">
                      <div className="d-flex align-items-center mb-3">
                        {item.icon}
                        <span>{item.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
            <div className="col-lg-6">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="position-relative"
              >
                <div className="row g-5">
                  {solutions.map((solution, i) => (
                    <div key={i} className="col-md-6">
                      <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                        <div className="ratio ratio-16x9">
                          <Image
                            src={solution.image}
                            alt={solution.title}
                            width={600}
                            height={400}
                            style={{ objectFit: 'cover' }}
                            className="object-cover"
                          />
                        </div>
                        <div className="card-body p-4">
                          <h3 className="h5 fw-bold mb-3">{solution.title}</h3>
                          <p className="text-muted small">{solution.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* Add your CTA section here with proper spacing */}

      {/* Footer */}
      {/* Add your footer section here with proper spacing */}
    </div>
  );
}