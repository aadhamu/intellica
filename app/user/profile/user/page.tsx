'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { getCookie } from 'cookies-next';
import { toast } from 'react-toastify';
import { Mail, User, Trash2 } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from '../../../../component/loader';

const ErrorAlert = ({ message }: { message: string }) => (
  <div className="alert alert-danger text-center">{message}</div>
);

const ProfileHeader = ({ 
  title, 
  isEditing, 
  onEditToggle, 
  onDelete,
  deleting 
}: { 
  title: string, 
  isEditing: boolean, 
  onEditToggle: () => void, 
  onDelete: () => void,
  deleting: boolean
}) => (
  <div className="d-flex justify-content-between align-items-center mb-4">
    <h4 className="mb-0 fw-bold">{title}</h4>
    <div className="d-flex gap-2">
      <button 
        className={`btn btn-${isEditing ? 'outline-secondary' : 'outline-primary'}`} 
        onClick={onEditToggle}
        disabled={deleting}
      >
        {isEditing ? 'Cancel Edit' : 'Edit'}
      </button>
      {!isEditing && (
        <button 
          className="btn btn-outline-danger" 
          onClick={onDelete}
          disabled={deleting}
        >
          {deleting ? (
            <span className="spinner-border spinner-border-sm me-1" />
          ) : (
            <Trash2 size={18} className="me-1" />
          )}
          Delete
        </button>
      )}
    </div>
  </div>
);

const ProfileField = ({
  label,
  icon,
  name,
  value,
  isEditing,
  onChange,
  required = false,
  type = 'text',
  disabled = false
}: {
  label: string,
  icon: React.ReactNode,
  name: string,
  value: string,
  isEditing: boolean,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  required?: boolean,
  type?: string,
  disabled?: boolean
}) => (
  <div className="mb-3">
    <label className="form-label fw-semibold d-flex align-items-center gap-2">
      {icon}
      {label}
    </label>
    {isEditing ? (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="form-control"
        disabled={disabled}
      />
    ) : (
      <div className="form-control-plaintext">{value}</div>
    )}
  </div>
);

const FormActions = ({ 
  onCancel, 
  loading 
}: { 
  onCancel: () => void, 
  loading: boolean 
}) => (
  <div className="mt-4 d-flex justify-content-end gap-2">
    <button 
      type="button" 
      className="btn btn-outline-secondary" 
      onClick={onCancel} 
      disabled={loading}
    >
      Cancel
    </button>
    <button 
      type="submit" 
      className="btn btn-primary" 
      disabled={loading}
    >
      {loading ? 'Updating...' : 'Save Changes'}
    </button>
  </div>
);

const DeleteConfirmationModal = ({ 
  show, 
  onConfirm, 
  onCancel,
  deleting
}: { 
  show: boolean, 
  onConfirm: () => void, 
  onCancel: () => void,
  deleting: boolean
}) => {
  if (!show) return null;

  return (
    <div className="modal fade show pt-5 mt-5" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', }}>
      <div className="modal-dialog modal-dialog-centered mt-5">
        <div className="modal-content border-danger">
          <div className="modal-header border-danger bg-danger text-white">
            <h5 className="modal-title">⚠️ Confirm Account Deletion</h5>
          </div>
          <div className="modal-body">
            <p className="fw-bold">This action cannot be undone!</p>
            <p>All your data will be permanently deleted.</p>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onCancel}
              disabled={deleting}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-danger" 
              onClick={onConfirm}
              disabled={deleting}
            >
              {deleting ? (
                <span className="spinner-border spinner-border-sm me-1" />
              ) : null}
              I understand, delete my account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function UserProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getCookie('auth_token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data);
        setFormData({
          name: response.data.name,
          email: response.data.email,
        });
      } catch (error) {
        toast.error('Failed to fetch profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = getCookie('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/update`,
        {
          name: formData.name,
          email: formData.email,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUser((prev: any) => (prev ? { ...prev, ...formData } : null));
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) {
      toast.error('No user ID found');
      return;
    }

    try {
      // Convert to number if it's a string
      const userId = Number(user.id);
      if (isNaN(userId)) {
        toast.error('Invalid user ID format');
        return;
      }

      setDeleting(true);
      const token = getCookie('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        // Clear auth and redirect
        document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        toast.success('Account deleted successfully');
        router.push('/');
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      if (error.response) {
        switch (error.response.status) {
          case 400:
            toast.error('Invalid user ID format');
            break;
          case 403:
            toast.error('You are not authorized to delete this account');
            break;
          case 404:
            toast.error('User account not found');
            break;
          default:
            toast.error(error.response.data?.message || 'Failed to delete account');
        }
      } else {
        toast.error('Network error - please try again');
      }
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!user) return <ErrorAlert message="Failed to load profile data" />;

  return (
    <div className="container py-5 mt-5">
      <DeleteConfirmationModal
        show={showDeleteModal}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
        deleting={deleting}
      />
      
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm p-4">
            <ProfileHeader
              title="My Profile"
              isEditing={isEditing}
              onEditToggle={() => setIsEditing(!isEditing)}
              onDelete={() => setShowDeleteModal(true)}
              deleting={deleting}
            />

            {/* Avatar Display */}
            <div className="text-center mb-4">
              <div
                className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center"
                style={{ width: '80px', height: '80px', fontSize: '2rem' }}
              >
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <p className="mt-2 fw-semibold">{user.name}</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <ProfileField
                    label="Name"
                    icon={<User size={18} />}
                    name="name"
                    value={formData.name}
                    isEditing={isEditing}
                    onChange={handleInputChange}
                    required
                    disabled={deleting}
                  />
                </div>
                <div className="col-md-6">
                  <ProfileField
                    label="Email"
                    icon={<Mail size={18} />}
                    name="email"
                    value={formData.email}
                    isEditing={isEditing}
                    onChange={handleInputChange}
                    required
                    type="email"
                    disabled={deleting}
                  />
                </div>
              </div>
              {isEditing && (
                <FormActions 
                  onCancel={() => setIsEditing(false)} 
                  loading={loading || deleting} 
                />
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}