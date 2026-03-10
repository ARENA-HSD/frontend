import React from 'react';
import maskot from '@/assets/maskot.png';

export interface HeaderLogoProps {
    size?: 'sm' | 'md' | 'lg';
    scale?: number;
    className?: string;
}

const COLORS = ["#E63329", "#2196F3", "#F5A623", "#4CAF50"] as const;

const HeaderLogo = ({ size, scale = 1, className = "" }: HeaderLogoProps) => {
    let baseStrokeWidth = 11;
    let baseFontSize = 50;
    let baseGap = 16;
    let baseImgWidth = 200;
    let baseLeftOffset = -72;

    if (size === 'sm') {
        baseStrokeWidth = 6;
        baseFontSize = 25;
        baseGap = 8;
        baseImgWidth = 100;
        baseLeftOffset = -36;
    } else if (size === 'md') {
        baseStrokeWidth = 9;
        baseFontSize = 37.5;
        baseGap = 12;
        baseImgWidth = 150;
        baseLeftOffset = -53;
    }

    const sStrokeWidth = `${baseStrokeWidth * scale}px`;
    const sFontSize = `${baseFontSize * scale}px`;
    const sGap = `${baseGap * scale}px`;
    const sImgWidth = `${baseImgWidth * scale}px`;
    const sLeftOffset = `${baseLeftOffset * scale}px`;

    const textStyle: React.CSSProperties = {
        fontSize: sFontSize,
        lineHeight: 0.95,
        WebkitTextStroke: `${sStrokeWidth} #111`,
        paintOrder: "stroke fill",
    };

    return (
        <div
            className={`inline-flex items-end ${className}`}
            style={{ gap: sGap }}
        >
            <div className="flex flex-col" style={{ gap: `${2 * scale}px` }}>
                <span
                    className="block select-none font-['Titan_One',sans-serif]"
                    style={textStyle}
                >
                    <span style={{ color: COLORS[0] }}>Qu</span>
                    <span style={{ color: COLORS[1] }}>iz</span>
                </span>
                <span
                    className="block select-none font-['Titan_One',sans-serif]"
                    style={textStyle}
                >
                    <span style={{ color: COLORS[2] }}>Str</span>
                    <span style={{ color: COLORS[3] }}>ike</span>
                </span>
            </div>
            <img
                src={maskot}
                alt="Quiz Strike Maskot"
                className="w-auto object-contain relative"
                style={{ width: sImgWidth, marginLeft: sLeftOffset, top: `${6 * scale}px` }}
            />
        </div>
    );
};

export default HeaderLogo;