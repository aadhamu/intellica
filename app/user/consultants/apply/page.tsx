'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

export default function ConsultantApplication() {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
 
  const [formData, setFormData] = useState<{
    image: File | null;
    name: string;
    email: string;
    phone: string;
    specialization: string;
    experience: string;
    cv: File | null;
  }>({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    cv: null,
    image: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({
        ...formData,
        [e.target.name]: e.target.files[0]
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMounted) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('specialization', formData.specialization);
      formDataToSend.append('experience', formData.experience);
      
      if (formData.cv) {
        formDataToSend.append('cv', formData.cv);
      }
      if (formData.image) {
        formDataToSend.append('image', formData.image); // Changed from 'cv' to 'image'
      }

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/consultants`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      router.push('/user/consultants/thank-you');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 422) {
          const errors = err.response.data.errors;
          const errorMessages = Object.values(errors).flat().join('\n');
          setError(errorMessages);
        } else {
          setError(err.response?.data?.message || 'An error occurred');
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light py-5 mt-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-lg">
              <div className="card-header bg-primary text-white text-center py-4">
                <h1 className="h3 mb-2">Join Our Consulting Team</h1>
                <p className="mb-0 text-white-50">
                  We're always looking for talented professionals to join our network
                </p>
                <p className="mb-0 text-white-50">
                  To join our team, please fill out the application form below with your user name and email as the same with your login details .One application per person.
                </p>
              </div>

              <div className="card-body p-4 p-md-5">
                {error && (
                  <div className="alert alert-danger d-flex align-items-center mb-4">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>{error}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <fieldset className="mb-5">
                    <legend className="h5 border-bottom pb-2 mb-4">Personal Information</legend>
                    
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label htmlFor="name" className="form-label">
                          Full Name <span className="text-danger">*</span>
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="form-control"
                        />
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="email" className="form-label">
                          Email <span className="text-danger">*</span>
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="form-control"
                        />
                      </div>

                      <div className="col-12">
                        <label htmlFor="phone" className="form-label">
                          Phone Number <span className="text-danger">*</span>
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className="form-control"
                        />
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className="mb-5">
                    <legend className="h5 border-bottom pb-2 mb-4">Professional Information</legend>
                    
                    <div className="mb-3">
                      <label htmlFor="specialization" className="form-label">
                        Area of Specialization <span className="text-danger">*</span>
                      </label>
                      <input
                        id="specialization"
                        name="specialization"
                        type="text"
                        value={formData.specialization}
                        onChange={handleChange}
                        required
                        className="form-control"
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="experience" className="form-label">
                        Professional Experience <span className="text-danger">*</span>
                      </label>
                      <textarea
                        id="experience"
                        name="experience"
                        rows={4}
                        value={formData.experience}
                        onChange={handleTextAreaChange}
                        required
                        className="form-control"
                      />
                    </div>
                  </fieldset>

                  <div className="mb-5">
                    <label htmlFor="cv" className="form-label">
                      Upload Your CV/Resume <span className="text-danger">*</span>
                    </label>
                    <div className="border border-2 border-dashed rounded p-4 text-center">
                      <div className="d-flex flex-column align-items-center">
                        <i className="bi bi-file-earmark-arrow-up fs-1 text-muted mb-2"></i>
                        <div className="mb-2">
                          <label htmlFor="cv" className="btn btn-outline-primary btn-sm">
                            Select file
                            <input
                              id="cv"
                              name="cv"
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={handleFileChange}
                              required
                              className="d-none"
                            />
                          </label>
                          <span className="ms-2 text-muted">or drag and drop</span>
                        </div>
                        <small className="text-muted">PDF, DOC, DOCX up to 2MB</small>
                      </div>
                    </div>
                    {formData.cv && (
                      <div className="mt-2 text-muted">
                        <i className="bi bi-file-earmark-text me-1"></i>
                        Selected file: {formData.cv.name}
                      </div>
                    )}
                  </div>

                  <div className="mb-5">
                    <label htmlFor="image" className="form-label">
                      Upload profile Image <span className="text-danger">*</span>
                    </label>
                    <div className="border border-2 border-dashed rounded p-4 text-center">
                      <div className="d-flex flex-column align-items-center">
                        <i className="bi bi-file-earmark-arrow-up fs-1 text-muted mb-2"></i>
                        <div className="mb-2">
                          <label htmlFor="image" className="btn btn-outline-primary btn-sm">
                            Select file
                            <input
                              id="image"
                              name="image"
                              type="file"
                              accept=".jpg,.jpeg,.png"
                              onChange={handleFileChange}
                              required
                              className="d-none"
                            />
                          </label>
                          <span className="ms-2 text-muted">or drag and drop</span>
                        </div>
                        <small className="text-muted">jpg, jpeg, png up to 2MB</small>
                      </div>
                    </div>
                    {formData.image && (
                      <div className="mt-2 text-muted">
                        <i className="bi bi-file-earmark-text me-1"></i>
                        Selected file: {formData.image.name}
                      </div>
                    )}
                  </div>

                  <div className="d-grid">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-primary btn-lg"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Processing...
                        </>
                      ) : (
                        'Submit Application'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}