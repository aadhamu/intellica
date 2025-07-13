
'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

type Consultant = {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: string;
  cv_path: string;
  image_path: string;
  status: 'approved' | 'pending' | 'rejected';
};

export default function ConsultantsPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
const [searchPerformed, setSearchPerformed] = useState(false);


  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        const token = getAuthToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/consultants`,
          { headers }
        );
        
        setConsultants(response.data.filter((c: { status: string }) => c.status === 'approved'));
      } catch (error) {
        toast.error('Failed to load consultants');
        console.error('Error fetching consultants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultants();
  }, []);

  const handleViewDetails = (consultant: Consultant) => {
    setSelectedConsultant(consultant);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedConsultant(null);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-gradient">
        <div className="spinner-border text-white" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const handleSearch = async () => {
  try {
    setLoading(true);
    setSearchPerformed(true); // Mark that a search was performed

    const token = getAuthToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/consultants`,
      { headers }
    );

    const filtered = response.data.filter(
      (c: Consultant) =>
        c.status === 'approved' &&
        c.specialization.toLowerCase().includes(searchTerm.toLowerCase()) &&
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) 
    );

    if (filtered.length === 0) {
      toast.info('No consultants found for this specialization');
    }

    setConsultants(filtered);
  } catch (error) {
    toast.error('Search failed');
    console.error('Search error:', error);
  } finally {
    setLoading(false);
  }
};




  return (
    <div className="consultants-page mt-5">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h1 className="hero-title">
                Meet Our <span className="text-highlight">Expert</span> Consultants
              </h1>
              <p className="hero-subtitle">
                Leverage industry-leading expertise to drive your business forward
              </p>
              <div className="search-box mt-4">
  <input
    type="text"
    placeholder="Search by specialization..."
    className="search-input"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}

  />
  <button className="search-button" onClick={() => handleSearch()}>
    <i className="bi bi-search"></i>
  </button>
</div>

            </div>
          </div>
        </div>
      </section>

      {/* Consultants Grid */}
<section className="consultants-section">
  <div className="container">
    <div className="section-header">
      <h2>Featured Consultants</h2>
      <p>Professionals ready to help you succeed</p>
    </div>

    <div className="row g-4">
      {consultants.length === 0 ? (
        <div className="col-12 text-center">
          <p>
            {searchPerformed
              ? <>No consultants found for "<strong>{searchTerm}</strong>"</>
              : 'No consultants available at the moment.'}
          </p>
          {searchPerformed && (
            <button
              className="btn btn-secondary mt-2"
              onClick={() => {
                setSearchTerm('');
                setSearchPerformed(false);
                // Re-fetch all consultants
                (async () => {
                  setLoading(true);
                  try {
                    const token = getAuthToken();
                    const headers = token ? { Authorization: `Bearer ${token}` } : {};

                    const response = await axios.get(
                      `${process.env.NEXT_PUBLIC_API_URL}/api/consultants`,
                      { headers }
                    );
                    setConsultants(
                      response.data.filter((c: { status: string }) => c.status === 'approved')
                    );
                  } catch (error) {
                    toast.error('Failed to reload consultants');
                  } finally {
                    setLoading(false);
                  }
                })();
              }}
            >
              Back to All Consultants
            </button>
          )}
        </div>
      ) : (
        consultants.map((consultant) => (
          <div key={consultant.id} className="col-md-6 col-lg-4">
            <div className="consultant-card">
              <div className="card-header">
                <div className="avatar-container">
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${consultant.image_path}`}
                    alt={consultant.name}
                    className="consultant-avatar"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/default-avatar.png';
                    }}
                  />
                </div>
              </div>
              <div className="card-body">
                <h3 className="consultant-name">{consultant.name}</h3>
                <span className="consultant-specialization">{consultant.specialization}</span>
                <div className="consultant-meta">
                  <div className="meta-item">
                    <i className="bi bi-telephone"></i>
                    <span>{consultant.phone}</span>
                  </div>
                  <div className="meta-item">
                    <i className="bi bi-envelope"></i>
                    <span>{consultant.email}</span>
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <a href={`mailto:${consultant.email}`} className="btn btn-outline-primary">
                  <i className="bi bi-envelope me-2"></i> Contact
                </a>
                <button
                  onClick={() => handleViewDetails(consultant)}
                  className="btn btn-primary"
                >
                  <i className="bi bi-file-earmark-text me-2"></i> View Details
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
</section>


      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="row">
            <div className="col-md-3 col-6">
              <div className="stat-card">
                <h3>150+</h3>
                <p>Experts</p>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="stat-card">
                <h3>25+</h3>
                <p>Specializations</p>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="stat-card">
                <h3>90%</h3>
                <p>Success Rate</p>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="stat-card">
                <h3>24h</h3>
                <p>Avg Response</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Can't find what you're looking for?</h2>
            <p>We have more experts available. Contact us to discuss your specific needs.</p>
            <button 
              className="btn btn-light"
              onClick={() => router.push('/contact')}
            >
              Contact Our Team
            </button>
          </div>
        </div>
      </section>

      {/* Consultant Details Modal */}
      {showModal && selectedConsultant && (
        <div className="modal-backdrop">
          <div className="modal-container">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{selectedConsultant.name}'s Profile</h3>
                <button onClick={closeModal} className="close-button">
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4 text-center">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${selectedConsultant.image_path}`}
                      alt={selectedConsultant.name}
                      className="modal-avatar"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/default-avatar.png';
                      }}
                    />
                    <h4 className="mt-3">{selectedConsultant.name}</h4>
                    <div className="specialization-badge">
                      <h6 className="section-subtitle">Specialization</h6>
                      <span className="badge bg-primary">{selectedConsultant.specialization}</span>
                    </div>
                  </div>
                  
                  <div className="col-md-8">
                    <div className="details-section">
                      <h5 className="section-title">Contact Information</h5>
                      <div className="detail-group">
                        <h6 className="detail-label text-black">Phone Number</h6>
                        <div className="detail-item">
                          <i className="bi bi-telephone"></i>
                          <span>{selectedConsultant.phone}</span>
                        </div>
                      </div>
                      
                      <div className="detail-group">
                        <h6 className="detail-label text-black">Email Address</h6>
                        <div className="detail-item">
                          <i className="bi bi-envelope"></i>
                          <span>{selectedConsultant.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="details-section">
                      <h5 className="section-title">Professional Experience</h5>
                      <div className="detail-group">
                        <h6 className="detail-label text-black">Background & Expertise</h6>
                        <div className="experience-content">
                          <p className='text-black'>{selectedConsultant.experience}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={closeModal} className="btn btn-secondary">
                  Close
                </button>
                <a
                  href={`mailto:${selectedConsultant.email}`}
                  className="btn btn-primary"
                >
                  <i className="bi bi-envelope me-2"></i> Contact Consultant
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        .consultants-page {
          background-color: #f8f9fa;
          position: relative;
        }
        
        .hero-section {
          background: linear-gradient(135deg, #1a3a8f, #2563eb);
          color: white;
          padding: 5rem 0;
          margin-bottom: 3rem;
        }
        
        .hero-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        
        .text-highlight {
          color: #ffd700;
        }
        
        .hero-subtitle {
          font-size: 1.2rem;
          opacity: 0.9;
          margin-bottom: 1.5rem;
        }
        
        .search-box {
          display: flex;
          max-width: 500px;
          margin: 0 auto;
        }
        
        .search-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 0.5rem 0 0 0.5rem;
          font-size: 1rem;
        }
        
        .search-button {
          background: #ffd700;
          color: #1a3a8f;
          border: none;
          padding: 0 1.5rem;
          border-radius: 0 0.5rem 0.5rem 0;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .search-button:hover {
          background: #ffc107;
        }
        
        .consultants-section {
          padding: 4rem 0;
        }
        
        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        .section-header h2 {
          font-size: 2rem;
          font-weight: 700;
          color: #1a3a8f;
          margin-bottom: 0.5rem;
        }
        
        .section-header p {
          color: #6c757d;
          font-size: 1.1rem;
        }
        
        .consultant-card {
          background: white;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .consultant-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
        }
        
        .card-header {
          background: linear-gradient(135deg, #2563eb, #1a3a8f);
          height: 100px;
          position: relative;
        }
        
        .avatar-container {
          position: absolute;
          bottom: -50px;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 100px;
          border-radius: 50%;
          border: 5px solid white;
          overflow: hidden;
          background: white;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .consultant-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .card-body {
          padding: 4rem 1.5rem 1.5rem;
          flex-grow: 1;
        }
        
        .consultant-name {
          font-size: 1.4rem;
          font-weight: 600;
          color: #1a3a8f;
          margin-bottom: 0.5rem;
          text-align: center;
        }
        
        .consultant-specialization {
          display: block;
          text-align: center;
          background: #e9f0ff;
          color: #2563eb;
          padding: 0.25rem 0.75rem;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 500;
          margin: 0 auto 1rem;
          width: fit-content;
        }
        
        .consultant-meta {
          margin-top: 1.5rem;
          border-top: 1px solid #eee;
          padding-top: 1rem;
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
          color: #6c757d;
          font-size: 0.9rem;
        }
        
        .meta-item i {
          margin-right: 0.5rem;
          color: #2563eb;
        }
        
        .card-footer {
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          border-top: 1px solid #eee;
        }
        
        .card-footer .btn {
          flex: 1;
          margin: 0 0.25rem;
          padding: 0.5rem;
          font-size: 0.85rem;
        }
        
        .stats-section {
          padding: 3rem 0;
          background: white;
          margin: 3rem 0;
        }
        
        .stat-card {
          text-align: center;
          padding: 1.5rem;
        }
        
        .stat-card h3 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a3a8f;
          margin-bottom: 0.5rem;
        }
        
        .stat-card p {
          color: #6c757d;
          font-size: 1rem;
          margin: 0;
        }
        
        .cta-section {
          background: linear-gradient(135deg, #1a3a8f, #2563eb);
          color: white;
          padding: 4rem 0;
          text-align: center;
        }
        
        .cta-content h2 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        
        .cta-content p {
          font-size: 1.1rem;
          opacity: 0.9;
          margin-bottom: 2rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .cta-content .btn {
          padding: 0.75rem 2rem;
          font-weight: 500;
          border-radius: 50px;
          transition: all 0.3s ease;
        }
        
        .cta-content .btn:hover {
          background: #ffd700;
          color: #1a3a8f;
        }
        
        /* Modal Styles */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1050;
        }
        
        .modal-container {
          max-width: 800px;
          width: 90%;
          margin: 0 auto;
        }
        
        .modal-content {
          background-color: white;
          border-radius: 0.5rem;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
        
        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #2563eb, #1a3a8f);
          color: white;
        }
        
        .modal-header h3 {
          margin: 0;
          font-size: 1.5rem;
        }
        
        .close-button {
          background: none;
          border: none;
          font-size: 2rem;
          color: white;
          cursor: pointer;
          line-height: 1;
        }
        
        .modal-body {
          padding: 2rem;
        }
        
        .modal-avatar {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          object-fit: cover;
          border: 5px solid #e9f0ff;
        }
        
        .details-section {
          margin-bottom: 1.5rem;
        }
        
        .details-section h5 {
          color: #1a3a8f;
          margin-bottom: 1rem;
          font-weight: 600;
        }
        
        .detail-item {
          display: flex;
          align-items: center;
          margin-bottom: 0.75rem;
          color: #495057;
        }
        
        .detail-item i {
          margin-right: 0.75rem;
          color: #2563eb;
          font-size: 1.25rem;
          width: 25px;
          text-align: center;
        }
        
        .modal-footer {
          padding: 1.5rem;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }
        
        .modal-footer .btn {
          padding: 0.5rem 1.5rem;
        }
        
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }
          
          .hero-subtitle {
            font-size: 1rem;
          }
          
          .consultant-card {
            margin-bottom: 2rem;
          }
          
          .stat-card {
            padding: 1rem;
          }
          
          .stat-card h3 {
            font-size: 2rem;
          }
          
          .modal-container {
            width: 95%;
          }
          
          .modal-body .row {
            flex-direction: column;
          }
          
          .modal-body .col-md-4 {
            margin-bottom: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}