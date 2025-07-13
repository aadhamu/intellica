'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Star, ArrowLeft, Clock, User } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import RatingStars from '../../../../component/RatingStars';

interface Consultant {
  id: bigint;
  name: string;
  title: string;
  avatar?: string;
}

interface Rating {
  id: bigint;
  rating: number;
  comment?: string;
  created_at: string;
  user: {
    id: number;
    name: string;
  };
}

interface Blog {
  id: bigint;
  consultant_id: number | null;
  title: string;
  content: string;
  featured_image_url?: string;
  created_at: string;
  updated_at: string;
  consultant?: Consultant | null;
  ratings?: Rating[];
  ratings_avg_rating?: number;
  ratings_count?: number;
}

export default function BlogDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Invalid blog ID');
      setLoading(false);
      return;
    }

    const fetchBlog = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 404) {
            router.push('user/home');
            return;
          }
          throw new Error(`Failed to fetch blog: ${response.statusText}`);
        }

        const data = await response.json();
        setBlog(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id, router]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light mt-5">
        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger shadow-sm">
          <h4 className="alert-heading">Error Loading Blog</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => router.push('/user/blog')}>
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning shadow-sm">
          <h4 className="alert-heading">Blog Not Found</h4>
          <p>The requested blog post could not be found.</p>
          <button className="btn btn-primary" onClick={() => router.push('/user/blog')}>
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  // Function to parse and style HTML content with proper list formatting
  const parseAndStyleContent = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Style unordered lists
    const ulElements = doc.querySelectorAll('ul');
    ulElements.forEach(ul => {
      ul.style.listStyleType = 'disc';
      ul.style.paddingLeft = '1.5rem';
      ul.style.marginBottom = '1rem';
    });
    
    // Style ordered lists
    const olElements = doc.querySelectorAll('ol');
    olElements.forEach(ol => {
      ol.style.listStyleType = 'decimal';
      ol.style.paddingLeft = '1.5rem';
      ol.style.marginBottom = '1rem';
    });
    
    // Style list items
    const liElements = doc.querySelectorAll('li');
    liElements.forEach(li => {
      li.style.marginBottom = '0.5rem';
      li.style.lineHeight = '1.6';
    });
    
    // Style paragraphs
    const pElements = doc.querySelectorAll('p');
    pElements.forEach(p => {
      p.style.marginBottom = '1rem';
      p.style.lineHeight = '1.8';
    });
    
    return doc.body.innerHTML;
  };

  return (
    <div className="bg-light min-vh-100 py-5 mt-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <button className="btn btn-outline-primary mb-4 d-flex align-items-center" onClick={() => router.back()}>
              <ArrowLeft className="me-2" size={18} />
              Back to Articles
            </button>

            <div className="card shadow-sm border-0 mb-5 overflow-hidden">
              <div className="card-header bg-white border-0 pb-0 text-center">
                <h1 className="display-5 fw-bold text-dark mb-3">{blog.title}</h1>

                {blog.featured_image_url && (
                  <Image
                    src={blog.featured_image_url}
                    alt={blog.title}
                    width={600}
                    height={600}
                    className="rounded-circle img-fluid border border-3 border-primary mx-auto d-block mb-3"
                    style={{ objectFit: 'cover', width: '200px', height: '200px' }}
                  />
                )}

                <div className="d-flex flex-wrap justify-content-center gap-3 text-muted mb-3">
                  <div className="d-flex align-items-center">
                    <Clock size={16} className="me-2" />
                    <span>
                      {new Date(blog.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  {blog.ratings_avg_rating && (
                    <div className="d-flex align-items-center">
                      <Star className="me-1 text-warning" size={16} fill="#f59e0b" />
                      <span>
                        {blog.ratings_avg_rating.toFixed(1)}
                        <span className="text-muted"> ({blog.ratings_count} ratings)</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="card-body px-4 px-md-5 py-4">
                <div
                  className="blog-content mb-5"
                  style={{ fontSize: '1.1rem', lineHeight: '1.8' }}
                  dangerouslySetInnerHTML={{ __html: parseAndStyleContent(blog.content) }}
                />

                {blog.consultant_id ? (
                  <div className="bg-light p-4 rounded mb-5 border">
                    <h5 className="text-primary fw-bold mb-3">Rate this article</h5>
                    <RatingStars
                      consultantId={Number(blog.consultant_id)}
                      blogId={Number(blog.id)}
                      rating={0}
                    />
                  </div>
                ) : (
                  <div className="alert alert-info">
                    This article doesn't have an associated consultant for rating.
                  </div>
                )}

                {blog.consultant && (
                  <div className="border rounded p-4 mb-5 bg-white text-center">
                    <h5 className="text-primary fw-bold mb-4">About the Contributor</h5>
                    <div className="d-flex flex-column align-items-center">
                      {blog.consultant.avatar ? (
                        <Image
                          src={blog.consultant.avatar}
                          alt={blog.consultant.name}
                          width={100}
                          height={100}
                          className="rounded-circle border border-2 mb-3"
                          style={{ objectFit: 'cover', width: '100px', height: '100px' }}
                        />
                      ) : (
                        <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mb-3"
                          style={{ width: '100px', height: '100px', fontSize: '2rem' }}>
                          {blog.consultant.name.charAt(0)}
                        </div>
                      )}
                      <h6 className="fw-bold mb-1">{blog.consultant.name}</h6>
                      <p className="text-muted mb-0">{blog.consultant.title}</p>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-top">
                  <h5 className="text-primary fw-bold mb-4">Ratings & Reviews</h5>
                  {blog.ratings && blog.ratings.length > 0 ? (
                    blog.ratings.map((rating) => (
                      <div key={rating.id.toString()} className="mb-4 pb-3 border-bottom">
                        <div className="d-flex justify-content-between mb-2">
                          <strong>{rating.user.name}</strong>
                          <div className="d-flex align-items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={18}
                                className={i < Math.round(rating.rating) ? 'text-warning' : 'text-muted'}
                                fill={i < Math.round(rating.rating) ? '#f59e0b' : 'none'}
                              />
                            ))}
                            <span className="ms-2 text-muted">{rating.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        {rating.comment && <p className="text-secondary">{rating.comment}</p>}
                        <small className="text-muted">
                          {new Date(rating.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </small>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 bg-light rounded">
                      <Star size={32} className="mb-3 text-muted" />
                      <p className="text-muted">No ratings yet. Be the first to rate this article!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}