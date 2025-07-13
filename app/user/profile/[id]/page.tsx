'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getCookie } from 'cookies-next';
import { toast } from 'react-toastify';
import { User, Mail, Phone, Briefcase, Camera } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from '../../../../component/loader';

interface Consultant {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: string;
  image_path: string | null;
}

interface ValidationErrors {
  [key: string]: string[];
}

export default function UpdateConsultantByUserId() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [consultant, setConsultant] = useState<Consultant | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    image: null as File | null,
  });

  useEffect(() => {
    const fetchConsultant = async () => {
      try {
        const token = getCookie('auth_token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/consultants/by-user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = response.data.data;
        setConsultant(data);
        setFormData({
          name: data.name,
          email: data.email,
          phone: data.phone,
          specialization: data.specialization,
          experience: data.experience,
          image: null,
        });

        if (data.image_path) {
          setImagePreview(`${process.env.NEXT_PUBLIC_API_URL}/storage/${data.image_path}`);
        }
      } catch (error: any) {
        toast.error('Failed to fetch consultant data');
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchConsultant();
  }, [userId, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, image: file }));

      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const token = getCookie('auth_token');
      if (!token || !consultant?.id) {
        router.push('/login');
        return;
      }

      const formDataToSend = new FormData();
      if (formData.name !== consultant.name) formDataToSend.append('name', formData.name);
      if (formData.email !== consultant.email) formDataToSend.append('email', formData.email);
      if (formData.phone !== consultant.phone) formDataToSend.append('phone', formData.phone);
      if (formData.specialization !== consultant.specialization)
        formDataToSend.append('specialization', formData.specialization);
      if (formData.experience !== consultant.experience)
        formDataToSend.append('experience', formData.experience);
      if (formData.image) formDataToSend.append('image', formData.image);

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/consultants/${consultant.id}?_method=PUT`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.success('Consultant updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
        toast.error('Validation error.');
      } else {
        toast.error('Update failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!consultant) return <div className="alert alert-danger text-center mt-5">Consultant not found</div>;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h4 className="text-primary mb-0">
                <User className="me-2" size={24} />
                Consultant Profile
              </h4>
              <button
                className={`btn btn-sm ${isEditing ? 'btn-outline-secondary' : 'btn-outline-primary'}`}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row mb-4">
                  <div className="col-md-4 text-center mb-4 mb-md-0">
                    <div className="position-relative mx-auto" style={{ width: '180px', height: '180px' }}>
                      <div className="rounded-circle bg-light d-flex align-items-center justify-content-center w-100 h-100 border border-3 border-primary overflow-hidden">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Profile"
                            className="w-100 h-100 object-fit-cover"
                          />
                        ) : (
                          <span className="display-4 text-primary">
                            {consultant.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      {isEditing && (
                        <>
                          <button
                            type="button"
                            className="btn btn-primary position-absolute bottom-0 end-0 rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: '40px', height: '40px' }}
                            onClick={triggerFileInput}
                          >
                            <Camera size={16} />
                          </button>
                          <input
                            type="file"
                            name="image"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="d-none"
                          />
                        </>
                      )}
                    </div>
                  </div>

                  <div className="col-md-8">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Full Name</label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="form-control"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                          />
                        ) : (
                          <p className="form-control-plaintext">{consultant.name}</p>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-bold">Email</label>
                        <p className="form-control-plaintext">{consultant.email}</p>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-bold">Phone</label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="form-control"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                          />
                        ) : (
                          <p className="form-control-plaintext">{consultant.phone}</p>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-bold">Specialization</label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="form-control"
                            name="specialization"
                            value={formData.specialization}
                            onChange={handleInputChange}
                          />
                        ) : (
                          <p className="form-control-plaintext">{consultant.specialization}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">Experience</label>
                  {isEditing ? (
                    <textarea
                      className="form-control"
                      name="experience"
                      rows={4}
                      value={formData.experience}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p className="form-control-plaintext">{consultant.experience}</p>
                  )}
                </div>

                {isEditing && (
                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setIsEditing(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
