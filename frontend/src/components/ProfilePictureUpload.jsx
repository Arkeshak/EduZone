import { useState, useRef } from 'react';
import { Camera, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import client from '@/services/apiClient';

const BACKEND_URL = 'http://localhost:5000';

/**
 * ProfilePictureUpload
 * Props:
 *   - currentPicture: string (URL from backend, e.g. "/uploads/...")
 *   - onUploadSuccess: (newUrl: string) => void
 *   - size: 'sm' | 'md' | 'lg'  (default: 'md')
 *   - shape: 'circle' | 'rounded' (default: 'circle')
 *   - editable: boolean (default: true)
 */
const ProfilePictureUpload = ({ currentPicture, onUploadSuccess, size = 'md', shape = 'circle', editable = true }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  };

  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-3xl';

  const imageUrl = preview
    ? preview
    : currentPicture
    ? `${BACKEND_URL}${currentPicture}`
    : null;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    // Upload to backend
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const { data } = await client.post('/auth/profile/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.success) {
        toast.success('Profile picture updated!');
        onUploadSuccess?.(data.profilePicture);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload picture');
      setPreview(null); // Revert preview on error
    } finally {
      setUploading(false);
    }
  };

  return (
    <div 
      className={`relative inline-block ${editable ? 'group cursor-pointer' : 'cursor-default'}`} 
      onClick={() => editable && !uploading && fileInputRef.current?.click()}
    >
      {/* Avatar */}
      <div className={`${sizeClasses[size]} ${shapeClass} overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 border-4 border-white shadow-xl flex items-center justify-center`}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <User className={`${iconSizes[size]} text-blue-400`} />
        )}
      </div>

      {/* Hover overlay - Only if editable */}
      {editable && (
        <div className={`absolute inset-0 ${shapeClass} bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
          {uploading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Camera className="w-5 h-5 text-white" />
              <span className="text-white text-[10px] font-bold">Change</span>
            </div>
          )}
        </div>
      )}

      {/* Camera badge - Only if editable */}
      {editable && (
        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-md">
          <Camera className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ProfilePictureUpload;
