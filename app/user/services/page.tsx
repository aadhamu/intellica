'use client'

import 'bootstrap/dist/css/bootstrap.min.css'
import { motion } from 'framer-motion'
import Link from 'next/link';
import Image from 'next/image';
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css' // Add this line

export default function ServicesPage() {
  const services = [
    {
      title: 'Start a New Business',
      description: 'Intellica helps you turn your ideas into reality with expert tools and guidance. Get a step-by-step plan for starting your business, from ideation to launch.',
      href: '/AI/newuser',
      btnClass: 'btn-primary',
      icon: 'bi-lightbulb'
    },
    {
      title: 'Grow Your Existing Business',
      description: 'With tailored insights and AI-powered recommendations, Al Con can help you scale your business effectively. Automate tasks, optimize operations, and reach your goals faster.',
      href: '/AI/olduser',
      btnClass: 'btn-success',
      icon: 'bi-graph-up'
    },
    {
      title: 'Track Your Finances',
      description: 'Easily monitor your financial health, track revenue, expenses, and profits. With smart analytics, you can gain insights into your business performance to make informed decisions.',
      href: '/AI/track',
      btnClass: 'btn-warning text-dark',
      icon: 'bi-cash-stack'
    },
  ]

  return (
    <div className="container-fluid p-0 text-dark ">
      {/* Hero Services Section */}
      <section className="position-relative bg-light py-5">
        {/* Decorative elements */}
        <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden opacity-25">
          <div className="position-absolute rounded-circle bg-primary" style={{
            width: '300px',
            height: '300px',
            top: '-100px',
            left: '-100px',
            filter: 'blur(80px)'
          }}></div>
          <div className="position-absolute rounded-circle bg-info" style={{
            width: '400px',
            height: '400px',
            bottom: '-150px',
            right: '-100px',
            filter: 'blur(80px)'
          }}></div>
        </div>

        <div className="container position-relative z-3 py-5">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="display-4 fw-bold text-center mb-4">
              Intellica <span className="text-primary">Services</span>
            </h1>
            <p className="lead text-center text-muted mb-5">
              Whether you're starting fresh or growing your business, Intellica has solutions tailored for your needs.
            </p>
          </motion.div>

          <div className="row g-4">
            {services.map((service, i) => (
              <div className="col-md-4" key={i}>
                <motion.div
                  className="card h-100 border-0 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="card-body p-4 d-flex flex-column">
                    <div className="d-flex align-items-center mb-3">
                      <i className={`bi ${service.icon} fs-1 text-primary me-3`}></i>
                      <h3 className="h4 mb-0 fw-bold">{service.title}</h3>
                    </div>
                    <p className="text-muted mb-4 flex-grow-1">{service.description}</p>
                    <motion.a
                      href={service.href}
                      className={`btn ${service.btnClass} align-self-start`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Get Started <i className="bi bi-arrow-right ms-2"></i>
                    </motion.a>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Consultants Hero Section */}
      <section className="position-relative bg-white py-5 border-top">
        <div className="container position-relative z-3 py-5">
          <div className="row align-items-center g-5">
            {/* Text content */}
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">
                Meet Your <span className="text-primary">Business Allies</span>
              </h1>
              
              <p className="lead mb-4">
                Every great business journey has moments when you need a trusted guide. Our consultants are battle-tested veterans who've navigated the same challenges you face today.
              </p>
              
              <div className="card border-start border-primary border-4 mb-4 bg-light">
                <div className="card-body p-4">
                  <blockquote className="blockquote mb-0">
                    <p className="fst-italic">
                      "I was stuck for months until Maria showed me how to streamline operations. Within weeks, we cut costs by 30% without sacrificing quality."
                    </p>
                    <footer className="blockquote-footer mt-2 text-primary">
                      James R., Founder of TechFlow
                    </footer>
                  </blockquote>
                </div>
              </div>
              
              <div className="d-flex flex-wrap gap-3">
                <Link href="/user/consultants/view" className="btn btn-primary btn-lg px-4 py-3 shadow">
                  Browse Our Experts <i className="bi bi-people ms-2"></i>
                </Link>
                <Link href="/user/consultants/apply" className="btn btn-outline-primary btn-lg px-4 py-3">
                  Join Our Network <i className="bi bi-person-plus ms-2"></i>
                </Link>
              </div>
            </div>
            
            {/* Image */}
            <div className="col-lg-6">
              <div className="position-relative rounded-4 overflow-hidden shadow-lg">
                <Image
                  src="/image/hero.png"
                  alt="Consultants collaborating"
                  width={600}
                  height={400}
                  className="img-fluid w-100"
                  style={{ objectFit: 'cover', minHeight: '400px' }}
                />
                <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-50 p-4">
                  <p className="text-white mb-0">
                    <i className="bi bi-award me-2"></i> Our consultants have helped 500+ businesses in the last year alone
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats bar */}
        <div className="container mt-5 bg-light py-4 border-top border-bottom rounded-3">
          <div className="row g-4 text-center">
            <div className="col-6 col-md-3">
              <div className="p-3">
                <h3 className="text-primary fw-bold display-6">150+</h3>
                <p className="text-uppercase small fw-bold text-muted">Industry Experts</p>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="p-3">
                <h3 className="text-primary fw-bold display-6">25+</h3>
                <p className="text-uppercase small fw-bold text-muted">Specializations</p>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="p-3">
                <h3 className="text-primary fw-bold display-6">90%</h3>
                <p className="text-uppercase small fw-bold text-muted">Success Rate</p>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="p-3">
                <h3 className="text-primary fw-bold display-6">24h</h3>
                <p className="text-uppercase small fw-bold text-muted">Average Response</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}