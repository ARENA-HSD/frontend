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
        <div className="bg-card p-8 rounded-lg shadow-lg text-center">
            {/* QR Code Placeholder */}
            <div className="w-64 h-64 mx-auto bg-gray-900 rounded-lg flex items-center justify-center mb-4">
                <QrCode className="w-32 h-32 text-inverse" />
            </div>

            {/* Session Code */}
            <div className="mb-2">
                <div className="text-sm text-secondary mb-1">Session Code</div>
                <div className="text-4xl font-bold text-role-primary tracking-wider">
                    {code}
                </div>
            </div>

            {/* URL */}
            <div className="text-sm text-tertiary mt-4">
                {url}
            </div>
        </div>
    );
};

export default QRCodeDisplay;
