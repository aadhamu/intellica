'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ArrowRight } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import 'bootstrap/dist/css/bootstrap.min.css';

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
  consultants_id: number | null;
  title: string;
  content: string;
  featured_image?: string;
  featured_image_url?: string;
  created_at: string;
  consultants: Consultant[] | null; // Allow for null
  ratings: Rating[];
  ratings_avg_rating: number | null;
  ratings_count: number;
}
const BlogCard = ({ blog }: { blog: Blog }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    if (inView) controls.start('visible');
  }, [inView, controls]);

  const variants = {
    visible: { opacity: 1, y: 0, scale: 1 },
    hidden: { opacity: 0, y: 50, scale: 0.95 },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
      whileHover={{ y: -2 }}
      className="col-md-6 col-lg-4 d-flex mb-4"
    >
      <div
        className="card border-0 w-100 h-100 overflow-hidden bg-white"
        style={{
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease',
        }}
      >
        {blog.featured_image_url ? (
          <div className="ratio ratio-16x9 position-relative overflow-hidden">
            <Image
              src={blog.featured_image_url}
              alt={blog.title}
              fill
              className="object-fit-cover"
              style={{ 
                objectFit: 'cover',
              }}
            />
            <div
              className="position-absolute bottom-0 start-0 p-3 w-100"
              style={{
                background: 'linear-gradient(transparent, rgba(255,255,255,0.9))',
              }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <span 
                  className="badge bg-white text-primary border border-primary"
                  style={{
                    borderRadius: '12px',
                    padding: '5px 10px',
                    fontWeight: '500'
                  }}
                >
                  {new Date(blog.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span 
                  className="badge bg-white text-dark border border-secondary d-flex align-items-center"
                  style={{
                    borderRadius: '12px',
                    padding: '5px 10px',
                    fontWeight: '500'
                  }}
                >
                  <Star size={14} className="me-1" fill="#ffd700" color="#ffd700" />
                  {typeof blog.ratings_avg_rating === 'number'
                    ? blog.ratings_avg_rating.toFixed(1)
                    : '0.0'}{' '}
                  ({blog.ratings_count || 0})
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="ratio ratio-16x9 d-flex align-items-center justify-content-center bg-primary"
            style={{
              color: 'white',
            }}
          >
            <div className="text-center p-3">
              <h5 className="mb-0">{blog.title}</h5>
            </div>
          </div>
        )}

        <div className="card-body d-flex flex-column p-4">
          <h5 className="card-title fw-bold mb-3 text-dark">
            {blog.title}
          </h5>

          {blog.consultants && blog.consultants.length > 0 && blog.consultants[0] && (
            <div className="d-flex align-items-center mt-auto mb-3">
              {blog.consultants[0].avatar ? (
                <Image
                  src={blog.consultants[0].avatar}
                  alt={blog.consultants[0].name}
                  width={40}
                  height={40}
                  className="rounded-circle me-3 border border-2 border-primary"
                  style={{
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center me-3 bg-primary"
                  style={{ 
                    width: '40px', 
                    height: '40px',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                >
                  {blog.consultants[0].name.charAt(0)}
                </div>
              )}
              <div>
                <small className="text-muted">Author</small>
                <h6 className="mb-0 text-dark">{blog.consultants[0].name}</h6>
              </div>
            </div>
          )}

          <Link
            href={`/user/blog/${blog.id}`}
            className="btn btn-primary mt-3 d-inline-flex align-items-center justify-content-center"
            style={{
              borderRadius: '6px',
              fontWeight: '500',
              padding: '8px 16px',
            }}
          >
            Continue Reading <ArrowRight size={16} className="ms-2" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include',
        });

        if (!response.ok) throw new Error(`Failed to fetch blogs: ${response.statusText}`);
        const data = await response.json();
        const blogsData = Array.isArray(data) ? data : data.data ?? [];
        setBlogs(blogsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unexpected error');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="container py-5 d-flex justify-content-center align-items-center min-vh-80">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center p-4 rounded">
          <h4 className="mb-3">Error Loading Content</h4>
          <p className="mb-4">{error}</p>
          <button
            className="btn btn-outline-primary px-4 py-2 rounded-pill"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="container py-5 text-center min-vh-80 mt-5">
        <div className="p-5 rounded bg-white shadow-sm">
          <h4 className="mb-3">No blogs found</h4>
          <p className="text-muted mb-4">We couldn't find any blog posts to display.</p>
          <Link
            href="/blog/create"
            className="btn btn-primary px-4 py-2 rounded-pill"
          >
            Create your first blog post
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 bg-white mt-5">
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold mb-3 text-primary">
          Latest Articles
        </h1>
        <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
          Expert insights and industry perspectives from our team of consultants
        </p>
        <div className="mx-auto bg-primary" style={{ width: '80px', height: '4px', borderRadius: '2px' }} />
      </div>

      <div className="row g-4">
        {blogs.map((blog) => (
          <BlogCard key={blog.id.toString()} blog={blog} />
        ))}
      </div>

      <div className="text-center mt-5 pt-4">
        <button className="btn btn-outline-primary px-4 py-2 rounded-pill">
          Load More Articles
        </button>
      </div>
    </div>
  );
}