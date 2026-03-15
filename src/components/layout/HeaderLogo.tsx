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
    let imgLeft = `${-72}px`;
    let containerHeight = 'h-[100px]';
    let containerMargin = 'm-5';

    if (size === 'sm') {
        strokeWidth = `${6}px`;
        fontSize = `${25}px`;
        gap = `${8}px`;
        imgWidth = `${100}px`;
        imgLeft = `${-36}px`;
        containerHeight = 'h-[56px]';
        containerMargin = 'm-2';
    } else if (size === 'md') {
        strokeWidth = `${9}px`;
        fontSize = `${37.5}px`;
        gap = `${12}px`;
        imgWidth = `${150}px`;
        imgLeft = `${-53}px`;
        containerHeight = 'h-[76px]';
        containerMargin = 'm-3';
    } else {
        // Default behavior scales with viewport so logo stays balanced on small screens.
        strokeWidth = 'clamp(4px, 1.1vw, 11px)';
        fontSize = 'clamp(20px, 4.5vw, 50px)';
        gap = 'clamp(8px, 1.6vw, 16px)';
        imgWidth = 'clamp(88px, 18vw, 200px)';
        imgLeft = 'clamp(-72px, -6vw, -30px)';
        containerHeight = 'h-[56px] sm:h-[76px] lg:h-[100px]';
        containerMargin = 'm-2 sm:m-3 lg:m-5';
    }

    const textStyle: React.CSSProperties = {
        fontSize,
        lineHeight: 0.95,
        WebkitTextStroke: `${strokeWidth} #111`,
        paintOrder: "stroke fill",
    };

    // navigate to home page when logo is clicked
    const navigateToHome = () => {
        window.location.href = '/';
    };

    return (
        <div
            className={`inline-flex items-end ${containerMargin} ${containerHeight}`}
            style={{ gap }}
            onClick={navigateToHome}
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
                className="w-auto object-contain relative top-[6px]"
                style={{ width: imgWidth, left: imgLeft }}
            />
        </div>
    );
};

export default HeaderLogo;