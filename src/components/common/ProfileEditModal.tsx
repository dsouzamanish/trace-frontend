import { useState, useEffect } from 'react';
import { User, Designation } from '../../types';
import { authApi, UpdateProfileData } from '../../services/api';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onProfileUpdate: (updatedUser: User) => void;
}

const DESIGNATIONS: Designation[] = [
  'Engineer',
  'Sr. Engineer',
  'Tech Lead',
  'QA',
  'Manager',
  'Other',
];

export default function ProfileEditModal({
  isOpen,
  onClose,
  user,
  onProfileUpdate,
}: ProfileEditModalProps) {
  const [formData, setFormData] = useState<UpdateProfileData>({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    profilePic: user.profilePic || '',
    designation: user.designation as Designation,
    joinedDate: user.joinedDate || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        profilePic: user.profilePic || '',
        designation: user.designation as Designation,
        joinedDate: user.joinedDate ? user.joinedDate.split('T')[0] : '',
      });
      setError(null);
    }
  }, [isOpen, user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Only send fields that have changed
      const updateData: UpdateProfileData = {};
      if (formData.firstName !== user.firstName) updateData.firstName = formData.firstName;
      if (formData.lastName !== user.lastName) updateData.lastName = formData.lastName;
      if (formData.profilePic !== user.profilePic) updateData.profilePic = formData.profilePic;
      if (formData.designation !== user.designation) updateData.designation = formData.designation;
      if (formData.joinedDate && formData.joinedDate !== user.joinedDate?.split('T')[0]) {
        updateData.joinedDate = formData.joinedDate;
      }

      // If nothing changed, just close
      if (Object.keys(updateData).length === 0) {
        onClose();
        return;
      }

      const response = await authApi.updateProfile(updateData);
      const { user: updatedUser, accessToken } = response.data;
      
      // Update token in localStorage
      if (accessToken) {
        localStorage.setItem('momentum_token', accessToken);
      }

      // Notify parent of update
      onProfileUpdate(updatedUser);
      onClose();
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-[var(--color-bg-secondary)] rounded-xl border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-[var(--color-text-secondary)] hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Profile Picture Preview */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {formData.profilePic ? (
                <img
                  src={formData.profilePic}
                  alt="Profile preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-white/10"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-2xl">
                  {formData.firstName?.[0]}{formData.lastName?.[0]}
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                Profile Picture URL
              </label>
              <input
                type="url"
                name="profilePic"
                value={formData.profilePic}
                onChange={handleChange}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-3 py-2 bg-[var(--color-bg-primary)] border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50"
              />
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-[var(--color-bg-primary)] border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-[var(--color-bg-primary)] border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50"
              />
            </div>
          </div>

          {/* Designation */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
              Designation
            </label>
            <select
              name="designation"
              value={formData.designation || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-[var(--color-bg-primary)] border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50"
            >
              <option value="">Select designation</option>
              {DESIGNATIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Joined Date */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
              Joining Date
            </label>
            <input
              type="date"
              name="joinedDate"
              value={formData.joinedDate}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-[var(--color-bg-primary)] border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 [color-scheme:dark]"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-3 py-2 bg-[var(--color-bg-primary)]/50 border border-white/5 rounded-lg text-[var(--color-text-secondary)] cursor-not-allowed"
            />
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Email cannot be changed
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 disabled:bg-primary-600/50 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

