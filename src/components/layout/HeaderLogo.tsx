import { CSSProperties } from 'react';
import maskot from '@/assets/maskot.png';


const COLORS = ["#E63329", "#2196F3", "#F5A623", "#4CAF50"] as const;

interface HeaderLogoProps {
    className?: string;
    scale?: number;
}

const HeaderLogo = ({ className = "", scale = 1 }: HeaderLogoProps) => {
    const strokeWidth = `${12 * scale}px`;
    const fontSize = `${50 * scale}px`;
    const gap = `${16 * scale}px`;
    const imgWidth = `${200 * scale}px`;

    const textStyle: CSSProperties = {
        fontSize,
        lineHeight: 0.9,
        WebkitTextStroke: `${strokeWidth} #111`,
        paintOrder: "stroke fill",
    };

    return (
        <div
            className={`inline-flex items-end ${className}`}
            style={{ gap }}
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
                className="w-auto object-contain relative top-[6px]"
                style={{ width: imgWidth }}
            />
        </div>
    );
};

export default HeaderLogo;