'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect } from 'react';

export default function AddBlogForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    featured_image: null as File | null
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConsultant, setIsConsultant] = useState<boolean | null>(null);

  // Check consultant status when component mounts
 useEffect(() => {
  const checkConsultantStatus = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/current`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('API Response:', data); // Debug log
      
      // Now correctly checking the consultant relationship
      setIsConsultant(data.is_consultant);
      
    } catch (error) {
      console.error('Error:', error);
      setIsConsultant(false);
    }
  };

  checkConsultantStatus();
}, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        featured_image: file
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isConsultant === false) {
      toast.error('Only consultants can create blogs');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      if (formData.featured_image) {
        formDataToSend.append('featured_image', formData.featured_image);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs`, {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create blog');
      }

      toast.success('Blog created successfully!');
      router.push('view');
    } catch (error: any) {
      console.error('Error creating blog:', error);
      toast.error(error.message || 'An error occurred while creating the blog');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isConsultant === null) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

 if (!isConsultant) {
  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-body text-center">
          <h2 className="card-title mb-4">Authorization Required</h2>
          <p className="card-text mb-4">
            You need to be registered as a consultant or administrator to create blog posts.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link href="/become-consultant" className="btn btn-primary">
              Register as Consultant
            </Link>
            <Link href="/user/blog/view" className="btn btn-outline-secondary">
              Back to Blogs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
  return (
    <div className="container py-5 mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Create New Blog Post</h1>
        <Link href="/blogs" className="btn btn-outline-secondary">
          &larr; Back to Blogs
        </Link>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="form-control"
                placeholder="Enter blog title"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="content" className="form-label">Content *</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={10}
                className="form-control"
                placeholder="Write your blog content here..."
              />
            </div>

            <div className="mb-3">
              <label htmlFor="featured_image" className="form-label">Featured Image</label>
              <input
                type="file"
                id="featured_image"
                name="featured_image"
                accept="image/jpeg,image/png,image/jpg,image/gif"
                onChange={handleImageChange}
                className="form-control"
              />
              <div className="form-text">JPEG, PNG, JPG, or GIF (Max: 2MB)</div>
              
              {previewImage && (
                <div className="mt-3">
                  <p className="form-label">Image Preview:</p>
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="img-thumbnail"
                    style={{ maxWidth: '300px', maxHeight: '300px' }}
                  />
                </div>
              )}
            </div>

            <div className="d-flex justify-content-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating...
                  </>
                ) : 'Create Blog'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}