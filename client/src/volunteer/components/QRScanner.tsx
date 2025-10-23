import React, { useState, useEffect, useRef } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import axios from "axios";

interface QRScannerProps {
  eventToken: string;
  eventName: string;
}

const QRScanner: React.FC<QRScannerProps> = ({ eventToken, eventName }) => {
  const [scanResult, setScanResult] = useState<string>("");
  const [message, setMessage] = useState<string>("Scan a team QR code!");
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserQRCodeReader | null>(null);
  const lastScanRef = useRef<string>("");

  useEffect(() => {
    // Initialize the QR code reader
    readerRef.current = new BrowserQRCodeReader();
    startScanning();

    // Cleanup on unmount
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    if (!videoRef.current || isScanning) return;

    try {
      setIsScanning(true);
      const reader = readerRef.current;
      
      if (reader) {
        await reader.decodeFromVideoDevice(
          undefined, // Use default camera
          videoRef.current,
          (result, error) => {
            if (result) {
              const text = result.getText();
              // Prevent duplicate scans
              if (text !== lastScanRef.current) {
                lastScanRef.current = text;
                handleScan(text);
              }
            }
            // Silently handle errors (common during scanning)
            if (error && !(error.name === "NotFoundException")) {
              console.error("Scan error:", error);
            }
          }
        );
      }
    } catch (err) {
      console.error("Failed to start scanner:", err);
      setMessage(
        "❌ Scanner error. Make sure camera permissions are allowed."
      );
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (readerRef.current) {
      readerRef.current.reset();
    }
    setIsScanning(false);
  };

  const handleScan = async (data: string) => {
    if (!data || loading) return;

    setLoading(true);
    setScanResult(data);

    try {
      const res = await axios.post(
        "/api/volunteer/scan",
        { team_id: data },
        {
          headers: {
            Authorization: `Bearer ${eventToken}`,
          },
        }
      );

      setMessage(
        `✅ ${res.data.message} | Team Points: ${res.data.team_points}`
      );
      
      // Clear last scan after 3 seconds to allow rescanning
      setTimeout(() => {
        lastScanRef.current = "";
      }, 3000);
    } catch (err: any) {
      setMessage(
        `❌ ${err.response?.data?.detail || "Failed to scan team QR"}`
      );
      // Clear last scan on error to allow retry
      lastScanRef.current = "";
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full p-4 relative">
      <h2 className="text-xl font-bold text-pink-500 mb-4">
        Event: {eventName}
      </h2>

      <div className="w-full max-w-md border-4 border-cyan-400 rounded-xl overflow-hidden shadow-lg mb-4 relative">
        <video
          ref={videoRef}
          className="w-full h-auto"
          style={{ maxHeight: "400px", objectFit: "cover" }}
        />
        
        {/* Scanning overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 border-2 border-pink-500 opacity-50" />
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-pink-500 animate-pulse shadow-lg" 
               style={{ 
                 boxShadow: "0 0 10px #ff00ff, 0 0 20px #ff00ff" 
               }} 
          />
        </div>
      </div>

      <div className="w-full max-w-md p-4 border-2 border-pink-500 rounded-lg text-center text-cyan-200 shadow-lg bg-black bg-opacity-60">
        {loading
          ? "⏳ Processing..."
          : scanResult
          ? `Scanned ID: ${scanResult}`
          : message}
      </div>

      {!isScanning && (
        <button
          onClick={startScanning}
          className="mt-4 px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          Start Scanner
        </button>
      )}

      <style>{`
        @keyframes scan-line {
          0%, 100% { transform: translateY(-200%); }
          50% { transform: translateY(200%); }
        }
      `}</style>
    </div>
  );
};

export default QRScanner;