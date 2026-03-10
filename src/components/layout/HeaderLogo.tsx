import maskot from '@/assets/maskot.png';


const COLORS = ["#E63329", "#2196F3", "#F5A623", "#4CAF50"] as const;

interface HeaderLogoProps {
    size?: 'sm' | 'md' | 'lg';
}

const HeaderLogo = ({ size }: HeaderLogoProps) => {
    let strokeWidth = `${11}px`;
    let fontSize = `${50}px`;
    let gap = `${16}px`;
    let imgWidth = `${200}px`;

    if (size === 'sm') {
        strokeWidth = `${6}px`;
        fontSize = `${25}px`;
        gap = `${8}px`;
        imgWidth = `${100}px`;
    } else if (size === 'md') {
        strokeWidth = `${9}px`;
        fontSize = `${37.5}px`;
        gap = `${12}px`;
        imgWidth = `${150}px`;
    }

    const textStyle: React.CSSProperties = {
        fontSize,
        lineHeight: 0.95,
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
                className={`w-auto object-contain relative top-[6px] left-[-72px] ${size === 'md' && 'left-[-53px]'}`}
                style={{ width: imgWidth }}
            />
        </div>
    );
};

export default HeaderLogo;