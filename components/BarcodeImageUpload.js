import { useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

const BarcodeImageUpload = ({ onDetected, onError }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const codeReader = new BrowserMultiFormatReader();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    const imageUrl = URL.createObjectURL(file);

    const img = new Image();
    img.src = imageUrl;
    img.onload = async () => {
      try {
        const result = await codeReader.decodeFromImageElement(img);
        if (result && result.getText()) {
          onDetected(result.getText());
        } else {
          if (onError) onError(new Error('No barcode detected in the image'));
        }
      } catch (err) {
        if (onError) {
          onError(new Error('No barcode detected in the image'));
        } else {
          console.error('Error processing barcode image:', err);
        }
      }
      URL.revokeObjectURL(imageUrl);
      setIsProcessing(false);
    };

    img.onerror = (err) => {
      setIsProcessing(false);
      if (onError) onError(err);
    };
  };

  return (
    <div className="barcode-image-upload">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        disabled={isProcessing}
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {isProcessing && <p className="mt-2 text-sm text-gray-600">Processing image...</p>}
    </div>
  );
};

export default BarcodeImageUpload;