import { useNavigate } from 'react-router-dom';
import maskot from '@/assets/maskot.png';
import maskot160Webp from '@/assets/optimized/maskot-160.webp';
import maskot320Webp from '@/assets/optimized/maskot-320.webp';
import maskot480Webp from '@/assets/optimized/maskot-480.webp';

interface HeaderLogoProps {
    size?: 'sm' | 'md' | 'lg';
}

const HeaderLogo = ({ size }: HeaderLogoProps) => {
    const navigate = useNavigate();
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

    return (
        <div
            className={`inline-flex items-end cursor-pointer ${containerMargin} ${containerHeight}`}
            style={{ gap }}
            onClick={() => navigate('/')}
        >
            <div className="flex flex-col gap-[2px]">
                <span
                    className="block select-none font-['Titan_One',sans-serif]"
                    style={textStyle}
                >
                    <span className="text-[#E63329]" translate='no'>Qu</span>
                    <span className="text-[#2196F3]" translate='no'>iz</span>
                </span>
                <span
                    className="block select-none font-['Titan_One',sans-serif]"
                    style={textStyle}
                >
                    <span className="text-[#F5A623]" translate='no'>Str</span>
                    <span className="text-[#4CAF50]" translate='no'>ike</span>
                </span>
            </div>
            <picture className="w-auto object-contain relative top-[6px]" style={{ width: imgWidth, left: imgLeft }}>
                <source
                    type="image/webp"
                    srcSet={`${maskot160Webp} 160w, ${maskot320Webp} 320w, ${maskot480Webp} 480w`}
                    sizes="(max-width: 640px) 88px, (max-width: 1024px) 150px, 200px"
                />
                <img
                    src={maskot}
                    alt="Quiz Strike Maskot"
                    className="w-full h-auto"
                    width={1051}
                    height={758}
                    loading="eager"
                    decoding="async"
                />
            </picture>
        </div>
    );
};

export default HeaderLogo;