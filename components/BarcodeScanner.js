import { useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

const BarcodeScanner = ({ onDetected, onError }) => {
  const videoRef = useRef(null);
  const codeReader = new BrowserMultiFormatReader();

  useEffect(() => {
    if (!videoRef.current) return;

    const startScanning = (deviceId) => {
      codeReader.decodeFromVideoDevice(deviceId, videoRef.current, (result, error) => {
        if (result) {
          onDetected(result.getText());
        }
        if (
          error &&
          error.name !== 'NotFoundException' &&
          !(error.message && error.message.includes("getImageData"))
        ) {
          onError && onError(error);
        }
      });
    };

    if (
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.enumerateDevices === 'function'
    ) {
      codeReader
        .listVideoInputDevices()
        .then((videoInputDevices) => {
          if (videoInputDevices && videoInputDevices.length > 0) {
            const selectedDeviceId = videoInputDevices[0].deviceId;
            startScanning(selectedDeviceId);
          } else {
            onError && onError(new Error('No video input devices found'));
          }
        })
        .catch((err) => {
          onError && onError(err);
        });
    } else {
      startScanning(null);
    }

    return () => {
      codeReader.reset();
    };
  }, [onDetected, onError]);

  return (
    <div className="barcode-scanner">
      <video ref={videoRef} className="viewport" />
      <style jsx>{`
        .barcode-scanner {
          position: relative;
          width: 100%;
        }
        .viewport {
          width: 100%;
          height: 320px;
          object-fit: cover;
          border: 2px solid #333;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default BarcodeScanner;