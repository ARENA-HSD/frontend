/**
 * HSD Arena - QR Code Display Component
 * 
 * Shows QR code for quiz session
 */

import { QrCode } from 'lucide-react';

interface QRCodeDisplayProps {
    code: string;
    url: string;
}

const QRCodeDisplay = ({ code, url }: QRCodeDisplayProps) => {
    return (
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            {/* QR Code Placeholder */}
            <div className="w-64 h-64 mx-auto bg-gray-900 rounded-lg flex items-center justify-center mb-4">
                <QrCode className="w-32 h-32 text-white" />
            </div>

            {/* Session Code */}
            <div className="mb-2">
                <div className="text-sm text-gray-600 mb-1">Session Code</div>
                <div className="text-4xl font-bold text-indigo-600 tracking-wider">
                    {code}
                </div>
            </div>

            {/* URL */}
            <div className="text-sm text-gray-500 mt-4">
                {url}
            </div>
        </div>
    );
};

export default QRCodeDisplay;
