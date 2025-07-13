'use client';
import { useState, useRef } from 'react';
import { FiSend, FiMapPin, FiPhone, FiMail, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { FaLinkedinIn, FaTwitter, FaInstagram, FaFacebookF } from 'react-icons/fa';
import { TbClock } from 'react-icons/tb';

export default function PremiumContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<null | 'success' | 'error'>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Submission failed');
      
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      formRef.current?.reset();
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus(null), 5000);
    }
  };

  return (
    <div className="position-relative min-vh-100 bg-light overflow-hidden mt-5">
      {/* Background gradient */}
      <div className="position-absolute w-100 h-100 bg-gradient"></div>

      <div className="container position-relative py-5">
        <div className="row justify-content-center">
          <div className="col-12 text-center mb-5">
            <h1 className="display-4 fw-bold text-primary mb-3">
              Let's Connect
            </h1>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '600px' }}>
              We're excited to hear from you! Reach out for collaborations, questions, or just to say hello.
            </p>
          </div>
        </div>

        <div className="row">
          {/* Contact Form */}
          <div className="col-lg-6 mb-4 mb-lg-0">
            <div className="card shadow-lg h-100">
              <div className="card-body p-4 p-md-5">
                <form ref={formRef} onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="name" className="form-label fw-semibold">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="form-control form-control-lg"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-semibold">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="form-control form-control-lg"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="subject" className="form-label fw-semibold">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="form-control form-control-lg"
                      placeholder="How can we help?"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="message" className="form-label fw-semibold">
                      Your Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="form-control form-control-lg"
                      placeholder="Tell us more about your project..."
                    ></textarea>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`btn btn-primary btn-lg w-100 ${isSubmitting ? 'disabled' : ''}`}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Sending...
                        </>
                      ) : (
                        <>
                          <FiSend className="me-2" />
                          Send Message
                        </>
                      )}
                    </button>
                  </div>

                  {submitStatus && (
                    <div className={`mt-4 p-3 rounded ${submitStatus === 'success' ? 'alert alert-success' : 'alert alert-danger'}`}>
                      <div className="d-flex align-items-center">
                        {submitStatus === 'success' ? (
                          <FiCheckCircle className="me-2" size={20} />
                        ) : (
                          <FiXCircle className="me-2" size={20} />
                        )}
                        <span>
                          {submitStatus === 'success'
                            ? 'Your message has been sent successfully! We will get back to you soon.'
                            : 'Failed to send message. Please try again later.'}
                        </span>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="col-lg-6">
            <div className="card shadow-lg mb-4">
              <div className="card-body p-4 p-md-5">
                <h2 className="h3 fw-bold mb-4">Contact Information</h2>
                
                <div className="mb-4">
                  <div className="d-flex mb-3">
                    <div className="flex-shrink-0 bg-primary bg-opacity-10 p-3 rounded text-primary">
                      <FiMapPin size={20} />
                    </div>
                    <div className="ms-3">
                      <h3 className="h5 fw-semibold">Our Location</h3>
                      <p className="text-muted mb-0">B5 Afolabi, Loko-tiye<br />Abuja, CA 94107</p>
                    </div>
                  </div>

                  <div className="d-flex mb-3">
                    <div className="flex-shrink-0 bg-primary bg-opacity-10 p-3 rounded text-primary">
                      <FiPhone size={20} />
                    </div>
                    <div className="ms-3">
                      <h3 className="h5 fw-semibold">Phone Number</h3>
                      <p className="text-muted mb-0">+234 916 246 5181<br />Mon-Fri, 9am-5pm PST</p>
                    </div>
                  </div>

                  <div className="d-flex mb-3">
                    <div className="flex-shrink-0 bg-primary bg-opacity-10 p-3 rounded text-primary">
                      <FiMail size={20} />
                    </div>
                    <div className="ms-3">
                      <h3 className="h5 fw-semibold">Email Address</h3>
                      <p className="text-muted mb-0">ocquayedavid38@gmail.com</p>
                    </div>
                  </div>

                  <div className="d-flex">
                    <div className="flex-shrink-0 bg-primary bg-opacity-10 p-3 rounded text-primary">
                      <TbClock size={20} />
                    </div>
                    <div className="ms-3">
                      <h3 className="h5 fw-semibold">Working Hours</h3>
                      <p className="text-muted mb-0">Monday - Friday: 9:00 - 18:00<br />Saturday: 10:00 - 15:00</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-4 border-top">
                  <h3 className="h5 fw-semibold mb-3">Follow Us</h3>
                  <div className="d-flex gap-2">
                    <a href="#" className="btn btn-outline-secondary btn-sm rounded-circle p-2">
                      <FaLinkedinIn size={16} />
                    </a>
                    <a href="#" className="btn btn-outline-secondary btn-sm rounded-circle p-2">
                      <FaTwitter size={16} />
                    </a>
                    <a href="#" className="btn btn-outline-secondary btn-sm rounded-circle p-2">
                      <FaInstagram size={16} />
                    </a>
                    <a href="#" className="btn btn-outline-secondary btn-sm rounded-circle p-2">
                      <FaFacebookF size={16} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-primary text-white shadow-lg">
              <div className="card-body p-4 p-md-5">
                <h2 className="h3 fw-bold mb-3">Need Immediate Help?</h2>
                <p className="mb-4">Our customer support team is available 24/7 to assist you with any urgent matters.</p>
                <a
                  href="tel:+15551234567"
                  className="btn btn-light text-primary fw-semibold"
                >
                  <FiPhone className="me-2" />
                  Call Now: +234 916 246 5181
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add this to your CSS file or style tag */}
      <style jsx>{`
        .bg-gradient {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          z-index: -1;
        }
        .card {
          border: none;
          border-radius: 1rem;
        }
        .btn-primary {
          background: linear-gradient(135deg, #0d6efd 0%, #6610f2 100%);
          border: none;
        }
        .btn-primary:hover {
          background: linear-gradient(135deg, #0b5ed7 0%, #5a0bd7 100%);
        }
        .text-primary {
          color: #0d6efd !important;
        }
      `}</style>
    </div>
  );
}