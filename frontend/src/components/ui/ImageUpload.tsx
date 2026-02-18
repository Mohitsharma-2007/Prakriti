import React, { useState, useRef } from 'react';

interface ImageUploadProps {
    onImageSelected: (file: File) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelected }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
            onImageSelected(file);
        };
        reader.readAsDataURL(file);
    };

    const triggerUpload = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="w-full">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />

            {!preview ? (
                <div
                    onClick={triggerUpload}
                    className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer hover:bg-slate-100 transition-colors"
                >
                    <div className="text-4xl mb-4">📷</div>
                    <p className="font-semibold text-slate-700">Tap to Take Photo</p>
                    <p className="text-xs text-slate-500 mt-2">or upload from gallery</p>
                </div>
            ) : (
                <div className="relative rounded-2xl overflow-hidden shadow-md">
                    <img src={preview} alt="Crop Preview" className="w-full h-64 object-cover" />
                    <button
                        onClick={triggerUpload}
                        className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-full shadow-sm text-sm font-semibold text-slate-700"
                    >
                        Retake
                    </button>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
