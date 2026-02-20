/**
 * HSD Arena - Image Placeholder Component
 * 
 * Displays a placeholder for images (since we're not using actual images yet)
 */

interface ImagePlaceholderProps {
    alt?: string;
    className?: string;
}

const ImagePlaceholder = ({ alt, className = '' }: ImagePlaceholderProps) => {
    return (
        <div
            className={`bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium ${className}`}
            title={alt}
        >
            {alt || 'Image'}
        </div>
    );
};

export default ImagePlaceholder;
