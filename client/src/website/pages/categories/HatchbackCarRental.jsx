/* Economy Hatchback Self-Drive Car Rental Category Page */
import React from "react";
import HubLandingTemplate from "../../components/HubLandingTemplate";

export default function HatchbackCarRental() {
  return (
    <HubLandingTemplate
      seoTitle="Budget Hatchback Car Rental Solapur | Swift & i10 from ₹1,400/day"
      seoDescription="Rent affordable hatchback self-drive cars in Solapur. Maruti Swift & Hyundai i10 Nios from ₹1,400/day. High fuel efficiency, zero hidden charges & station delivery."
      canonicalUrl="https://journeyrentals.in/car-rental/hatchback-economy"
      badgeText="🚗 Economy & Budget Fleet"
      heroHeading="Budget Hatchback Self-Drive Car Rental in Solapur"
      heroSubheading="Zip through Solapur traffic and cruise highway roads with ease. Top fuel efficiency, compact parking, and rates starting from just ₹1,400/day."
      answerFirstSummary="Journey Rentals offers budget hatchback self-drive cars in Solapur starting at ₹1,400/day for Maruti Swift (CNG/Petrol) and ₹1,500/day for Hyundai i10 Nios Automatic. Perfect for couples, small families (up to 4–5 people), and budget road trips to Akkalkot, Pandharpur, and Tuljapur. Book online with a ₹500 advance token via Razorpay."
      quickFacts={[
        { label: "Starting Daily Fare", value: "₹1,400 / day", subtext: "Maruti Swift CNG/Petrol" },
        { label: "Seating Capacity", value: "5 Passengers", subtext: "Spacious compact cabin" },
        { label: "Transmission", value: "Manual & Automatic", subtext: "Easy city maneuvering" },
        { label: "Booking Advance", value: "₹500 Online", subtext: "Razorpay secure" },
      ]}
      ctaVehicleCategory="Hatchback"
      recommendedVehicles={[
        {
          name: "Maruti Suzuki Swift",
          category: "Hatchback",
          fuelType: "CNG / Petrol",
          dailyRate: 1400,
          description: "Fun to drive, exceptional fuel mileage, touchscreen infotainment, and easy to park anywhere in Solapur.",
        },
        {
          name: "Hyundai Grand i10 Nios Auto",
          category: "Hatchback",
          fuelType: "Petrol Auto",
          dailyRate: 1500,
          description: "Refined automatic hatchback with premium cabin quality and smooth gearshifts.",
        },
        {
          name: "Maruti WagonR (CNG)",
          category: "Tall-Boy Hatchback",
          fuelType: "CNG",
          dailyRate: 1400,
          description: "High seating posture, excellent headroom, and unbeatable CNG cost savings.",
        },
      ]}
      routeHighlights={[
        {
          title: "Maximum Fuel Economy",
          description: "Our CNG hatchbacks deliver over 30 km/kg on the highway, keeping your round-trip pilgrimage fuel cost under ₹500.",
        },
        {
          title: "Effortless City Parking",
          description: "Compact dimensions make parking near crowded Solapur markets, station gates, and temple streets hassle-free.",
        },
        {
          title: "AC & Digital Audio",
          description: "All vehicles feature high-output air conditioning and Bluetooth audio connectivity for your roadtrip playlist.",
        },
      ]}
      faqs={[
        {
          question: "What is the daily rate for a Maruti Swift in Solapur?",
          answer: "The daily rental rate for a Maruti Swift starts at ₹1,400/day for a 24-hour rental period with a transparent level-to-level fuel policy.",
        },
        {
          question: "Is there any kilometer limit on hatchback rentals?",
          answer: "We offer generous standard packages as well as unlimited kilometer options for long-distance pilgrimage travel.",
        },
      ]}
      breadcrumbs={[
        { name: "Car Rental", url: "/fleet" },
        { name: "Hatchback Rental", url: "/car-rental/hatchback-economy" },
      ]}
    />
  );
}
