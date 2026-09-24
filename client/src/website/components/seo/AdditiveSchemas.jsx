import React from "react";
import { Helmet } from "react-helmet-async";

const SITE_URL = "https://journeyrentals.in";

export function FAQStructuredData({ faqs = [] }) {
  if (!faqs || faqs.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

export function BreadcrumbStructuredData({ items = [] }) {
  if (!items || items.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => {
      const rawUrl = item.url || item.item || "/";
      const fullUrl = typeof rawUrl === "string" && rawUrl.startsWith("http") 
        ? rawUrl 
        : `${SITE_URL}${typeof rawUrl === "string" && rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`}`;
      return {
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": fullUrl,
      };
    }),
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

export function WebSiteSearchSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Journey Rentals Solapur",
    "alternateName": "Journey Rentals Self Drive Cars & Bikes",
    "url": SITE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_URL}/fleet?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

export function OrganizationFounderSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    "name": "Journey Rentals Solapur",
    "legalName": "Journey Rentals Self-Drive & Bike Services",
    "url": SITE_URL,
    "logo": `${SITE_URL}/favicon.svg`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Near Solapur Railway Station",
      "addressLocality": "Solapur",
      "addressRegion": "Maharashtra",
      "postalCode": "413001",
      "addressCountry": "IN"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91 96044 37794",
      "contactType": "customer service",
      "areaServed": "IN",
      "availableLanguage": ["English", "Hindi", "Marathi"]
    },
    "knowsAbout": [
      "Self-Drive Car Rentals in Solapur",
      "Hourly Bike Rentals Solapur",
      "Akkalkot & Tuljapur Temple Trip Cars",
      "Pandharpur Devotee Transportation",
      "Solapur Railway Station Car Handover"
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

export function VehicleProductSchema({ vehicle }) {
  if (!vehicle) return null;
  const isBike = vehicle.type === 'bike';
  const title = vehicle.title || `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() || 'Vehicle';
  const price = isBike ? (vehicle.bikeSlots?.price24hr || vehicle.bikeSlots?.price12hr || vehicle.pricePerDay || 500) : (vehicle.pricePerDay || 1500);

  const schema = {
    "@context": "https://schema.org",
    "@type": isBike ? "Product" : "Car",
    "name": title,
    "image": vehicle.image || vehicle.images?.[0] || `${SITE_URL}/favicon.svg`,
    "description": vehicle.description || `${title} self-drive rental in Solapur with verified documents.`,
    "brand": {
      "@type": "Brand",
      "name": vehicle.brand || "Journey Rentals"
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "INR",
      "price": price,
      "priceValidUntil": "2027-12-31",
      "availability": "https://schema.org/InStock",
      "url": `${SITE_URL}/fleet`,
      "seller": {
        "@type": "AutoRental",
        "name": "Journey Rentals Solapur"
      }
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

export default {
  FAQStructuredData,
  BreadcrumbStructuredData,
  WebSiteSearchSchema,
  OrganizationFounderSchema,
  VehicleProductSchema,
};
