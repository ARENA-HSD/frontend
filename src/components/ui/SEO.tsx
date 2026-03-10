/**
 * SEO Component
 *
 * Renders document metadata (title, meta, og, twitter) using React 19's
 * native document metadata hoisting — no external library needed.
 */

interface SEOProps {
    /** Page-specific title. Full tag becomes "<title> | Quiz Strike". */
    title?: string;
    /** Page meta description (≤ 160 chars). */
    description?: string;
    /** Canonical URL for this page. */
    canonical?: string;
    /** Prevent search engines from indexing this page. */
    noIndex?: boolean;
    /** Open Graph image URL. */
    ogImage?: string;
    /** Open Graph type. Defaults to "website". */
    ogType?: string;
}

const SITE_NAME = 'Quiz Strike';
const DEFAULT_DESCRIPTION =
    'Create and host interactive quizzes for your organization with Quiz Strike.';
const DEFAULT_OG_IMAGE = '/og-image.png';

const SEO = ({
    title,
    description = DEFAULT_DESCRIPTION,
    canonical,
    noIndex = false,
    ogImage = DEFAULT_OG_IMAGE,
    ogType = 'website',
}: SEOProps) => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Interactive Quiz Platform`;

    return (
        <>
            {/* Primary */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {canonical && <link rel="canonical" href={canonical} />}
            {noIndex
                ? <meta name="robots" content="noindex, nofollow" />
                : <meta name="robots" content="index, follow" />
            }

            {/* Open Graph */}
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:type" content={ogType} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage} />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />
        </>
    );
};

export default SEO;
