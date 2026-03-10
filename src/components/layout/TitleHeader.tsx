import { Button } from "../ui";

interface TitleHeaderProps {
    title: string
    description?: string
    isButton?: boolean
    buttonIcon?: string
    onClick?: () => void
    buttonText?: string
}

const TitleHeader = (props: TitleHeaderProps) => {
    const { title, description, isButton, buttonIcon, onClick, buttonText } = props
    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-4xl font-['Titan_One',sans-serif] text-primary">
                    {title}
                </h1>
                {description && (
                    <p className="text-lg">
                        {description}
                    </p>
                )}
            </div>

            {isButton && (
                <Button
                    variant="secondary"
                    onClick={onClick}
                    className="px-6 pb-3 pt-2 flex items-center justify-center font-bold gap-2"
                >
                    {buttonIcon && (buttonIcon)}
                    <div className="font-['Titan_One',sans-serif] font-thin pt-1">
                        {buttonText ?? "Create New"}
                    </div>
                </Button>
            )}
        </div>
    );
};

export default TitleHeader;
