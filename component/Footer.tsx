'use client';
import React from 'react';
import Link from 'next/link';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaYoutube } from 'react-icons/fa';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';

const Footer = () => {
  return (
    <footer className="bg-black text-white pt-5 pb-4">
      <div className="container">
        <div className="row">
          {/* Company Info */}
          <div className="col-md-4 mb-4 mb-md-0">
            <h5 className="text-uppercase mb-4" style={{ color: '#0d6efd' }}>Intellica</h5>
            <p>
              Empowering businesses with innovative solutions and cutting-edge technology to drive growth and success in the digital age.
            </p>
            <div className="social-icons mt-4">
              <a href="#" className="text-white me-3"><FaFacebook size={20} /></a>
              <a href="#" className="text-white me-3"><FaTwitter size={20} /></a>
              <a href="#" className="text-white me-3"><FaLinkedin size={20} /></a>
              <a href="#" className="text-white me-3"><FaInstagram size={20} /></a>
              <a href="#" className="text-white"><FaYoutube size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-md-2 mb-4 mb-md-0">
            <h5 className="text-uppercase mb-4">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link href="/user/home" className="text-white text-decoration-none">Home</Link>
              </li>
              <li className="mb-2">
                <Link href="/user/about" className="text-white text-decoration-none">About Us</Link>
              </li>
              <li className="mb-2">
                <Link href="/user/services" className="text-white text-decoration-none">Services</Link>
              </li>
              <li className="mb-2">
                <Link href="/user/blog/view" className="text-white text-decoration-none">Blog</Link>
              </li>
              <li>
                <Link href="/user/contact" className="text-white text-decoration-none">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="col-md-2 mb-4 mb-md-0">
            <h5 className="text-uppercase mb-4">Services</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#" className="text-white text-decoration-none">Web Development</a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-white text-decoration-none">Mobile Apps</a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-white text-decoration-none">UI/UX Design</a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-white text-decoration-none">Digital Marketing</a>
              </li>
              <li>
                <a href="#" className="text-white text-decoration-none">Cloud Solutions</a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-md-4">
            <h5 className="text-uppercase mb-4">Contact Us</h5>
            <ul className="list-unstyled">
              <li className="mb-3 d-flex align-items-start">
                <MdLocationOn className="me-2 mt-1" size={20} />
                <span>B5 Afolabi Avenue, Loko-Tiye,  Abuja CA 94107</span>
              </li>
              <li className="mb-3 d-flex align-items-center">
                <MdPhone className="me-2" size={20} />
                <span>+234 916 4626 5181</span>
              </li>
              <li className="d-flex align-items-center">
                <MdEmail className="me-2" size={20} />
                <span>ocquayedavid38@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-4" />

        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <p className="mb-0">&copy; {new Date().getFullYear()} Intellica. All rights reserved.</p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <ul className="list-inline mb-0">
              <li className="list-inline-item">
                <Link href="/privacy-policy" className="text-white text-decoration-none">Privacy Policy</Link>
              </li>
              <li className="list-inline-item mx-2">•</li>
              <li className="list-inline-item">
                <Link href="/terms" className="text-white text-decoration-none">Terms of Service</Link>
              </li>
              <li className="list-inline-item mx-2">•</li>
              <li className="list-inline-item">
                <Link href="/sitemap" className="text-white text-decoration-none">Sitemap</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;