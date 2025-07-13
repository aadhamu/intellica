'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import 'bootstrap/dist/css/bootstrap.min.css';
import './about.css'; // Custom CSS for glass effect

export default function About() {
  return (
    <div className="container py-5 mt-5">
      {/* Intro Section */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-5"
      >
        <h1 className="fw-bold text-primary display-4 mt-5">About Intellica</h1>
        <p className="text-secondary fs-5 w-75 mx-auto">
          We create AI-powered tools that help organizations make faster, smarter decisions — effortlessly.
        </p>
      </motion.div>

      {/* Glass Section */}
      <div className="rounded-4 p-4 shadow-sm bg-white">
        {/* Mission + Vision */}
        <div className="row g-4 mb-5">
          <div className="col-md-6">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9 }}
              className="p-4 rounded-4 shadow-sm border border-light-subtle bg-light"
            >
              <h4 className="text-primary fw-bold">Our Mission</h4>
              <p className="text-muted">
                To make artificial intelligence accessible to all businesses through intuitive, secure, and scalable platforms.
              </p>
            </motion.div>
          </div>
          <div className="col-md-6">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9 }}
              className="p-4 rounded-4 shadow-sm border border-light-subtle bg-light"
            >
              <h4 className="text-primary fw-bold">Our Vision</h4>
              <p className="text-muted">
                To become a trusted global leader in AI solutions that help businesses thrive in a digital-first world.
              </p>
            </motion.div>
          </div>
        </div>

        {/* What We Do */}
        <div className="mb-5">
          <h3 className="text-center text-primary fw-bold mb-4">What We Do</h3>
          <div className="row text-center g-4">
            {[{
              title: 'AI Strategy Consulting',
              desc: 'Designing practical AI roadmaps tailored to your unique goals.'
            }, {
              title: 'Process Automation',
              desc: 'Optimizing operations with smart automation workflows.'
            }, {
              title: 'Data-Driven Insights',
              desc: 'Transforming data into real-time business intelligence.'
            }, {
              title: 'Smart Applications',
              desc: 'Developing intelligent, scalable web platforms and apps.'
            }].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="col-md-6 col-lg-3"
              >
                <div className="p-4 rounded-4 shadow-sm border bg-white h-100">
                  <h5 className="text-primary fw-semibold">{item.title}</h5>
                  <p className="text-muted small">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-5">
          <h3 className="text-center text-primary fw-bold mb-4">Our Core Values</h3>
          <div className="row text-center g-4">
            {['Innovation', 'Integrity', 'Collaboration', 'Customer Focus'].map((value, i) => (
              <motion.div
                key={value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * i }}
                className="col-6 col-md-3"
              >
                <div className="p-4 rounded-4 shadow-sm border bg-light h-100">
                  <h6 className="text-primary fw-semibold">{value}</h6>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mt-5"
        >
          <p className="text-muted fs-5 mb-4">
            Want to see what AI can do for your business?
          </p>
          <Link href="/user/services" className="btn btn-primary px-4 py-2 rounded-pill">
            Explore Our Services
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
