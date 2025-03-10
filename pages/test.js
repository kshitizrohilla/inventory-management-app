import React, { useState, useRef, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

const BarcodeScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const videoRef = useRef(null);
  const codeReader = useRef(new BrowserMultiFormatReader());

  useEffect(() => {
    if (scanning) {
      startScanning();
    } else {
      stopScanning();
    }

    return () => stopScanning();
  }, [scanning]);

  const startScanning = () => {
    codeReader.current.decodeFromVideoDevice(
      null,
      videoRef.current,
      (result, err) => {
        if (result) {
          setResult(result.getText());
          setScanning(false);
        }
        if (err && !(err.name === "NotFoundException")) {
          console.error(err);
        }
      }
    );
  };

  const stopScanning = () => {
    codeReader.current.reset();
    const stream = videoRef.current?.srcObject;
    const tracks = stream?.getTracks();
    if (tracks) {
      tracks.forEach((track) => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleClick = () => {
    setResult(null);
    setScanning(true);
  };

  return (
    <div>
      <button onClick={handleClick}>Start Scanning</button>
      {scanning && (
        <div>
          <video
            ref={videoRef}
            width="300"
            height="200"
            style={{ border: "1px solid black" }}
          />
        </div>
      )}

      {
        result && (
          <div>
            <h3>Scanned Result:</h3>
            <p>{result}</p>
          </div>
        )
      }
    </div >
  );
};

export default BarcodeScanner;