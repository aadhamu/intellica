'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Consultant = {
  id: number;
  user_id: number;
  name: string;
  email: string;
  specialization: string;
  experience: string;
  status: 'pending' | 'approved' | 'rejected';
  cv_path: string;
  image_path: string;
  rejection_reason?: string;
};

export default function ConsultantsAdmin() {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedConsultant, setSelectedConsultant] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/consultants`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.status === 403) {
          router.push('../user/home');
          return;
        }
        
        setConsultants(response.data);
      } catch (err) {
        handleError(err, 'Failed to fetch consultants');
      } finally {
        setLoading(false);
      }
    };

    fetchConsultants();
  }, []);

  const handleError = (err: unknown, defaultMessage: string) => {
    if (axios.isAxiosError(err)) {
      const message = err.response?.data?.message || defaultMessage;
      setError(message);
      toast.error(message);
    } else {
      setError(defaultMessage);
      toast.error(defaultMessage);
    }
  };

  const handleApprove = async (consultantId: number) => {
    console.log('Attempting to approve consultant:', consultantId);
    
    try {
      const token = localStorage.getItem('token');
      console.log('Using token:', token?.substring(0, 10) + '...');

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/consultants/${consultantId}/approve`,
        {},
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Full response:', response);
      
      if (response.data.success) {
        toast.success(response.data.message || 'Approved successfully!');
        setConsultants(prev => prev.map(c => 
          c.id === consultantId ? { ...c, status: 'approved' } : c
        ));
      } else {
        toast.error(response.data.message || 'Approval failed');
      }
    } catch (error) {
      console.error('Full error:', error);
      
      if (axios.isAxiosError(error)) {
        console.log('Error response data:', error.response?.data);
        console.log('Error status:', error.response?.status);
        
        if (error.response?.status === 404) {
          toast.error('User not found: ' + error.response.data.message);
        } else {
          toast.error(error.response?.data?.message || 'Failed to approve');
        }
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  const handleReject = async () => {  
    if (!selectedConsultant || !rejectionReason) {
      toast.warning('Please provide a rejection reason');
      return;
    }
    
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/consultants/${selectedConsultant}/reject`, {
        rejection_reason: rejectionReason
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setConsultants(consultants.map(c => 
        c.id === selectedConsultant ? { 
          ...c, 
          status: 'rejected',
          rejection_reason: rejectionReason 
        } : c
      ));
      
      setSelectedConsultant(null);
      setRejectionReason('');
      toast.success('Application rejected successfully');
    } catch (err) {
      handleError(err, 'Failed to reject consultant');
    }
  };

  const handleDelete = async (consultantId: number, userId: number) => {
    if (!window.confirm('Are you sure you want to delete this consultant and revert them to regular user?')) {
      return;
    }

    setIsDeleting(consultantId);
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/consultants/${consultantId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          data: {
            user_id: userId
          }
        }
      );

      if (response.data.success) {
        toast.success('Consultant deleted and reverted to regular user');
        setConsultants(prev => prev.filter(c => c.id !== consultantId));
      } else {
        toast.error(response.data.message || 'Failed to delete consultant');
      }
    } catch (err) {
      handleError(err, 'Failed to delete consultant');
    } finally {
      setIsDeleting(null);
    }
  };

  if (loading) return <div className="d-flex justify-content-center my-5"><div className="spinner-border"></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container py-4">
      <div className="card shadow-sm">
        <div className="card-header bg-white border-bottom">
          <h2 className="h4 mb-0">Consultant Applications</h2>
        </div>
        
        <div className="card-body p-0">
          {consultants.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No consultant applications found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Specialization</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {consultants.map((consultant) => (
                    <tr key={consultant.id}>
                      <td className="fw-semibold">{consultant.name}</td>
                      <td>{consultant.email}</td>
                      <td>{consultant.specialization}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(consultant.status)}`}>
                          {consultant.status}
                        </span>
                        {consultant.rejection_reason && (
                          <div className="text-muted small mt-1">
                            Reason: {consultant.rejection_reason}
                          </div>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <DocumentViewButton 
                            path={consultant.cv_path} 
                            label="View CV" 
                          />
                          <DocumentViewButton 
                            path={consultant.image_path} 
                            label="View Profile" 
                          />
                          {consultant.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(consultant.id)}
                                className="btn btn-sm btn-success"
                                disabled={loading}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setSelectedConsultant(consultant.id)}
                                className="btn btn-sm btn-danger"
                                disabled={loading}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(consultant.id, consultant.user_id)}
                            className="btn btn-sm btn-outline-danger"
                            disabled={isDeleting === consultant.id}
                          >
                            {isDeleting === consultant.id ? (
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ) : (
                              'Delete'
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      {selectedConsultant && (
        <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reject Application</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setSelectedConsultant(null)}
                  disabled={loading}
                ></button>
              </div>
              <div className="modal-body">
                <p>Please provide a reason for rejection:</p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection"
                  className="form-control mb-3"
                  rows={4}
                  required
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedConsultant(null)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleReject}
                  disabled={loading || !rejectionReason}
                >
                  {loading ? 'Processing...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for document viewing
function DocumentViewButton({ path, label }: { path: string, label: string }) {
  return (
    <a 
      href={`http://localhost:8000/storage/${path}`}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-sm btn-outline-primary"
    >
      {label}
    </a>
  );
}

// Helper function for status badge classes
function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'approved': return 'bg-success';
    case 'rejected': return 'bg-danger';
    default: return 'bg-warning';
  }
}