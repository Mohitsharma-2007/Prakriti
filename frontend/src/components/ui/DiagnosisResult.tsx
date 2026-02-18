import React from 'react';

interface DiagnosisResultProps {
    diagnosis: {
        disease_name: string;
        confidence: number;
        treatment: string;
        prevention: string;
    };
    loading?: boolean;
}

const DiagnosisResult: React.FC<DiagnosisResultProps> = ({ diagnosis, loading }) => {
    if (loading) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 animate-pulse space-y-4">
                <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-20 bg-slate-200 rounded w-full"></div>
            </div>
        );
    }

    const isHealthy = diagnosis.disease_name.toLowerCase().includes('health');

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className={`p-4 ${isHealthy ? 'bg-green-100' : 'bg-red-50'} border-b ${isHealthy ? 'border-green-200' : 'border-red-200'}`}>
                <h3 className={`text-xl font-bold ${isHealthy ? 'text-green-800' : 'text-red-800'}`}>
                    {diagnosis.disease_name}
                </h3>
                <span className="text-xs font-medium text-slate-500 bg-white/50 px-2 py-1 rounded inline-block mt-1">
                    Confidence: {(diagnosis.confidence * 100).toFixed(1)}%
                </span>
            </div>

            <div className="p-4 space-y-4">
                <div>
                    <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                        💊 Treatment
                    </h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                        {diagnosis.treatment}
                    </p>
                </div>

                {diagnosis.prevention && (
                    <div>
                        <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                            🛡️ Prevention
                        </h4>
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                            {diagnosis.prevention}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiagnosisResult;
