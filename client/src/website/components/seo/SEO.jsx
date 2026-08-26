import React from "react";
import { Helmet } from "react-helmet-async";

export default function SEO({
  title = "Journey Rentals Solapur — Self-Drive Car & Hourly Bike Rentals",
  description = "Book sanitized self-drive cars and hourly bikes in Solapur with zero hidden charges. Free pickup at Solapur Railway Station, Hotgi Road, Vijapur Road. Ideal for Akkalkot, Tuljapur & Pandharpur temple trips.",
  canonical = "/",
  ogType = "website",
  ogImage = "/favicon.svg",
  schema = null,
  noindex = false,
}) {
  const siteUrl = "https://journeyrentals.in";
  const safeCanonical = typeof canonical === "string" ? canonical : "/";
  const safeOgImage = typeof ogImage === "string" ? ogImage : "/logo.png";
  const fullCanonical = safeCanonical.startsWith("http") ? safeCanonical : `${siteUrl}${safeCanonical.startsWith("/") ? safeCanonical : `/${safeCanonical}`}`;
  const fullOgImage = safeOgImage.startsWith("http") ? safeOgImage : `${siteUrl}${safeOgImage.startsWith("/") ? safeOgImage : `/${safeOgImage}`}`;

  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    "name": "Journey Rentals Solapur",
    "alternateName": "Journey Rentals Self Drive Cars & Bikes",
    "url": siteUrl,
    "logo": `${siteUrl}/favicon.svg`,
    "description": description,
    "telephone": "+91 96044 37794",
    "email": "rental.journeycars@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Near Solapur Railway Station, Hotgi Road",
      "addressLocality": "Solapur",
      "addressRegion": "Maharashtra",
      "postalCode": "413001",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 17.6599,
      "longitude": 75.9064
    },
    "priceRange": "₹150 (3hr bike) - ₹4500 per day",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "06:00",
      "closes": "23:00"
    },
    "areaServed": [
      { "@type": "City", "name": "Solapur" },
      { "@type": "Place", "name": "Solapur Railway Station" },
      { "@type": "Place", "name": "Akkalkot" },
      { "@type": "Place", "name": "Tuljapur" },
      { "@type": "Place", "name": "Pandharpur" }
    ]
  };

  const activeSchema = schema || defaultSchema;

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullCanonical} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* GEO & AI Search Optimization Tags */}
      <meta name="geo.region" content="IN-MH" />
      <meta name="geo.placename" content="Solapur, Maharashtra" />
      <meta name="geo.position" content="17.6599;75.9064" />
      <meta name="ICBM" content="17.6599, 75.9064" />
      <meta name="ai-site-category" content="Self-Drive Car and Bike Rental Service" />
      <meta name="ai-coverage" content="Solapur Railway Station, Hotgi Road, Vijapur Road, Akkalkot, Tuljapur, Pandharpur" />

      {/* OpenGraph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:site_name" content="Journey Rentals Solapur" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />

      {/* Schema.org Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(activeSchema)}
      </script>
    </Helmet>
  );
}
