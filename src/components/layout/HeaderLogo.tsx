import maskot from '@/assets/maskot.png';


const COLORS = ["#E63329", "#2196F3", "#F5A623", "#4CAF50"] as const;

interface HeaderLogoProps {
    size?: number;
}

const HeaderLogo = () => {
    const strokeWidth = `${12}px`;
    const fontSize = `${50}px`;
    const gap = `${16}px`;
    const imgWidth = `${200}px`;

    const textStyle: React.CSSProperties = {
        fontSize,
        lineHeight: 0.9,
        WebkitTextStroke: `${strokeWidth} #111`,
        paintOrder: "stroke fill",
    };

    return (
        <div
            className="inline-flex items-end m-5 h-[100px]"
            style={{ gap }}
        >
            <div className="flex flex-col" style={{ gap: `${2}px` }}>
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
                className="w-auto object-contain relative top-[6px] left-[-72px]"
                style={{ width: imgWidth }}
            />
        </div>
    );
};

export default HeaderLogo;