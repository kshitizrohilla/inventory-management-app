import { useState } from 'react';
import { uploadImage } from '@/lib/cloudinary';

export default function ImageUpload({ onUpload, disabled, value }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const url = await uploadImage(file);
      onUpload(url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {value && <img src={value} alt="Preview" className="max-w-xs mb-2" />}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled || isLoading}
        className="mt-2 text-sm"
      />
      {isLoading && <span className="text-xs ml-2">Uploading...</span>}
    </div>
  );
}