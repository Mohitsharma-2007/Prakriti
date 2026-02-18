import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// Standard HTML5 video is used, no external dependency needed.
import ImageUpload from '../components/ui/ImageUpload';
import DiagnosisResult from '../components/ui/DiagnosisResult';

const Scan: React.FC = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleImageSelected = (selectedFile: File) => {
        setFile(selectedFile);
        setResult(null);
    };

    const startCamera = async () => {
        setIsCameraActive(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera Error:", err);
            alert("Could not access camera.");
            setIsCameraActive(false);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0);

            canvas.toBlob((blob) => {
                if (blob) {
                    const capturedFile = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
                    setFile(capturedFile);
                    setIsCameraActive(false);

                    // Stop Stream
                    const stream = video.srcObject as MediaStream;
                    stream?.getTracks().forEach(t => t.stop());
                }
            }, 'image/jpeg');
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setLoading(true);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8000/diagnose', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Analysis failed');

            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error(error);
            alert("Failed to analyze image. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/')}
                    className="text-white/50 hover:text-white transition-colors"
                >
                    ← Back
                </button>
                <h2 className="text-xl font-bold text-white">Live Diagnosis</h2>
                <div className="w-8"></div>
            </div>

            {/* Live Camera Viewfinder */}
            {isCameraActive ? (
                <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black aspect-[3/4]">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Overlay Grid */}
                    <div className="absolute inset-0 pointer-events-none opacity-20">
                        <div className="w-full h-full border-[20px] border-white/10 relative">
                            <div className="absolute top-1/2 left-0 w-full h-px bg-white/50"></div>
                            <div className="absolute left-1/2 top-0 h-full w-px bg-white/50"></div>
                        </div>
                    </div>

                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                        <button
                            onClick={() => {
                                setIsCameraActive(false);
                                const stream = videoRef.current?.srcObject as MediaStream;
                                stream?.getTracks().forEach(t => t.stop());
                            }}
                            className="bg-red-500/20 text-red-400 p-4 rounded-full backdrop-blur-md hover:bg-red-500/30"
                        >
                            <span className="sr-only">Cancel</span>
                            ✕
                        </button>
                        <button
                            onClick={capturePhoto}
                            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center relative hover:scale-105 transition-transform"
                        >
                            <div className="w-16 h-16 bg-white rounded-full"></div>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Camera Trigger */}
                    {!file && !result && (
                        <div
                            onClick={startCamera}
                            className="bg-[#1a1f1a] border-2 border-dashed border-green-500/30 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-[#1a1f1a]/80 hover:border-green-500/50 transition-all group"
                        >
                            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-bold text-white">Open Live Camera</h3>
                                <p className="text-sm text-white/50">Point at affected leaves</p>
                            </div>
                        </div>
                    )}

                    {/* Fallback Upload */}
                    {!isCameraActive && !result && (
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                            <p className="text-xs text-white/40 mb-2 uppercase tracking-wide font-bold">Or Upload File</p>
                            <ImageUpload onImageSelected={handleImageSelected} />
                        </div>
                    )}
                </div>
            )}

            {/* Analysis UI */}
            {file && !loading && !result && !isCameraActive && (
                <div className="animate-fade-in">
                    <div className="relative rounded-2xl overflow-hidden mb-4 border border-white/20">
                        <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-64 object-cover" />
                        <button onClick={() => setFile(null)} className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-full">✕</button>
                    </div>
                    <button
                        onClick={handleAnalyze}
                        className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-black font-bold text-lg rounded-2xl shadow-lg shadow-green-500/20 hover:scale-[1.02] transition-all"
                    >
                        Analyze Crop Disease 🔍
                    </button>
                </div>
            )}

            {(loading || result) && (
                <DiagnosisResult
                    diagnosis={result || { disease_name: '', confidence: 0, treatment: '', prevention: '' }}
                    loading={loading}
                />
            )}
        </div>
    );
};

export default Scan;
