/* Hourly Bike & Scooter Rental Category Page */
import React from "react";
import HubLandingTemplate from "../../components/HubLandingTemplate";

export default function HourlyBikeRental() {
  return (
    <HubLandingTemplate
      seoTitle="Hourly Bike & Scooter Rental in Solapur | Activa & RE from ₹150 (3 hrs)"
      seoDescription="Rent Activa scooters & Royal Enfield bikes in Solapur on hourly slots. ₹150 for 3 hrs, ₹200 for 6 hrs, ₹500/day. Free helmets, station delivery & instant KYC."
      canonicalUrl="https://journeyrentals.in/bike-rental/hourly-bikes"
      badgeText="🛵 Hourly Scooter & Bike Fleet"
      heroHeading="Hourly Bike &amp; Scooter Rental in Solapur"
      heroSubheading="Flexible hourly and daily two-wheeler rentals. Honda Activa 6G, TVS Jupiter, and Royal Enfield Classic 350 with complimentary sanitized helmets and station delivery."
      answerFirstSummary="Journey Rentals provides hourly and daily two-wheeler rentals across Solapur starting at ₹150 for 3 Hours, ₹200 for 6 Hours, ₹400 for 12 Hours, and ₹500 for a Full Day (24 Hours) for automatic scooters (Honda Activa 6G, TVS Jupiter). Cruiser motorcycles like Royal Enfield Classic 350 are available from ₹400 for 6 hours. Free sanitized helmets included with 24/7 delivery at Solapur Railway Station."
      quickFacts={[
        { label: "3-Hour Scooter Slot", value: "₹150", subtext: "Honda Activa 6G / TVS Jupiter" },
        { label: "6-Hour Scooter Slot", value: "₹200", subtext: "Quick city errands" },
        { label: "12-Hour Day Slot", value: "₹400", subtext: "Full day local exploration" },
        { label: "24-Hour Full Day", value: "₹500 / day", subtext: "Complimentary helmets" },
      ]}
      ctaVehicleCategory="Bike"
      recommendedVehicles={[
        {
          name: "Honda Activa 6G",
          category: "Automatic Scooter",
          fuelType: "Petrol Auto",
          dailyRate: 500,
          description: "India's most trusted scooter. Effortless automatic ride, mobile charger, and top city mileage.",
        },
        {
          name: "TVS Jupiter 110",
          category: "Automatic Scooter",
          fuelType: "Petrol Auto",
          dailyRate: 500,
          description: "Ultra-comfortable suspension, external fuel lid, and generous footboard storage.",
        },
        {
          name: "Royal Enfield Classic 350",
          category: "Cruiser Motorcycle",
          fuelType: "Petrol Manual",
          dailyRate: 900,
          description: "Iconic cruiser with dual-channel ABS and comfortable saddle for leisure highway rides.",
        },
      ]}
      routeHighlights={[
        {
          title: "Complimentary Clean Helmets",
          description: "Every bike rental includes ISI-certified sanitized helmets for rider and pillion safety at zero extra cost.",
        },
        {
          title: "Railway Station Handover",
          description: "Collect your scooter right at Solapur Railway Station (Platform 1 gate exit) to beat city traffic and taxi queues.",
        },
        {
          title: "Minimal Paperwork",
          description: "Quick 2-minute digital verification using your Driving License (MCWG) and Aadhaar card.",
        },
      ]}
      faqs={[
        {
          question: "What are the hourly rates for renting an Activa scooter in Solapur?",
          answer: "Our Honda Activa rental rates are: ₹150 for 3 hours, ₹200 for 6 hours, ₹400 for 12 hours, and ₹500 for a full 24-hour day.",
        },
        {
          question: "Do you provide helmets with the bike rental?",
          answer: "Yes, we provide sanitized, ISI-certified safety helmets complimentary with every two-wheeler rental.",
        },
        {
          question: "What documents do I need to rent a bike or scooter?",
          answer: "You need a valid Indian Motorcycle Driving License (MCWG / Two-Wheeler with Gear / Without Gear) and an Aadhaar Card or Passport.",
        },
      ]}
      breadcrumbs={[
        { name: "Bike Rental", url: "/fleet" },
        { name: "Hourly Bikes & Scooters", url: "/bike-rental/hourly-bikes" },
      ]}
    />
  );
}
