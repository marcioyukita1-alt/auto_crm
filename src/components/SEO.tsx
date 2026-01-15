import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    name?: string;
    type?: string;
    keywords?: string;
}

export default function SEO({
    title,
    description,
    name = 'Gyoda Softwares',
    type = 'website',
    keywords
}: SEOProps) {
    const siteTitle = title ? `${title} | ${name}` : 'Gyoda - Desenvolvimento de Software de Elite';
    const metaDescription = description || "Transformamos ideias em sistemas de alta performance. Especialistas em desenvolvimento de Web Apps escaláveis, Inteligência Artificial e infraestrutura DevOps & Cloud.";

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{siteTitle}</title>
            <meta name='description' content={metaDescription} />
            {keywords && <meta name="keywords" content={keywords} />}

            {/* Open Graph tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:site_name" content={name} />

            {/* Twitter tags */}
            <meta name="twitter:creator" content={name} />
            <meta name="twitter:card" content={type === 'article' ? 'summary_large_image' : 'summary'} />
            <meta name="twitter:title" content={siteTitle} />
            <meta name="twitter:description" content={metaDescription} />
        </Helmet>
    );
}
