/* Vijapur Road Car Rental Hub Page */
import React from "react";
import HubLandingTemplate from "../../components/HubLandingTemplate";

export default function VijapurRoadHub() {
  return (
    <HubLandingTemplate
      seoTitle="Self-Drive Car Rental Vijapur Road Solapur | NH-52 Gateway"
      seoDescription="Book self-drive cars and hourly scooters on Vijapur Road Solapur. Best rates for outstation travel towards Bijapur & Karnataka from ₹1,400/day."
      canonicalUrl="https://journeyrentals.in/locations/vijapur-road"
      badgeText="🛣️ Vijapur Road & NH-52 Hub"
      heroHeading="Self-Drive Car Rental: Vijapur Road, Solapur"
      heroSubheading="Direct access to the NH-52 national highway towards Bijapur, Gol Gumbaz, and North Karnataka. Fast car pickup and sanitized vehicle handover."
      answerFirstSummary="Journey Rentals provides self-drive cars and hourly two-wheelers with express pickup along Vijapur Road in Solapur. Perfect for travelers exploring historical Bijapur / Vijayapura (Gol Gumbaz, 98 km via NH-52) or commuting across South Solapur. Daily car rentals start at ₹1,400/day and hourly scooters from ₹150 for 3 hours with ₹500 online booking advance."
      quickFacts={[
        { label: "Location", value: "Vijapur Road, Solapur", subtext: "NH-52 Highway Gateway" },
        { label: "Distance to Bijapur", value: "98 Kilometers", subtext: "Approx 1 hr 45 mins" },
        { label: "Starting Daily Fare", value: "₹1,400 / day", subtext: "Clean CNG/Petrol cars" },
        { label: "Advance Booking Token", value: "₹500 Online", subtext: "Instant confirmation" },
      ]}
      recommendedVehicles={[
        {
          name: "Maruti Suzuki Swift",
          category: "Hatchback",
          fuelType: "CNG / Petrol",
          dailyRate: 1400,
          description: "Top-mileage hatchback for cost-effective highway roadtrips down NH-52.",
        },
        {
          name: "Tata Punch Micro SUV",
          category: "Micro SUV",
          fuelType: "CNG / Petrol",
          dailyRate: 1700,
          description: "High ground clearance, sturdy build, and comfortable high driving stance.",
        },
        {
          name: "Maruti Suzuki Ertiga (7-Seater)",
          category: "7-Seater MPV",
          fuelType: "CNG / Petrol",
          dailyRate: 2500,
          description: "Spacious 7-seater for group trips to historical monuments in Bijapur.",
        },
      ]}
      routeHighlights={[
        {
          title: "Gateway to Bijapur & Gol Gumbaz",
          description: "Vijapur Road connects directly to the 4-lane NH-52 highway, putting you on the fast track to Bijapur (98 km, approx 1 hr 45 mins).",
        },
        {
          title: "Clean Level-to-Level Fuel Policy",
          description: "Receive the vehicle with a documented fuel level and simply return it with the same level upon completion.",
        },
        {
          title: "Zero Security Deposit Anxiety",
          description: "No large security cash deposits blocked on your card. Nominal digital verification for peace of mind.",
        },
      ]}
      faqs={[
        {
          question: "Can I drive the rental car from Solapur to Bijapur (Karnataka)?",
          answer: "Yes, our cars carry valid permits for seamless travel across Maharashtra and Karnataka borders.",
        },
        {
          question: "How do I book a car on Vijapur Road?",
          answer: "Choose your dates and vehicle on our website, pay the ₹500 advance token via Razorpay, and our executive will deliver the keys at your preferred Vijapur Road location.",
        },
      ]}
      breadcrumbs={[
        { name: "Locations", url: "/locations/vijapur-road" },
        { name: "Vijapur Road", url: "/locations/vijapur-road" },
      ]}
    />
  );
}
