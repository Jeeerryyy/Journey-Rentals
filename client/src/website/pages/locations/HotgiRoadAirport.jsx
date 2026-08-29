/* Hotgi Road & Solapur Airport Car Rental Hub Page */
import React from "react";
import HubLandingTemplate from "../../components/HubLandingTemplate";

export default function HotgiRoadAirport() {
  return (
    <HubLandingTemplate
      seoTitle="Self-Drive Car Rental Hotgi Road & Solapur Airport | Express Handover"
      seoDescription="Rent verified self-drive cars on Hotgi Road & Solapur Airport hub. Instant delivery for MIDC, business, and outstation trips from ₹1,400/day."
      canonicalUrl="https://journeyrentals.in/locations/hotgi-road-airport"
      badgeText="✈️ Hotgi Road & Airport Hub"
      heroHeading="Self-Drive Car Rental: Hotgi Road &amp; Solapur Airport"
      heroSubheading="Fast, seamless car and hourly scooter delivery near Solapur Airport, Hotgi Road industrial corridor, and South Solapur. Zero hidden charges with instant digital KYC."
      answerFirstSummary="Journey Rentals operates a dedicated dispatch hub on Hotgi Road near the Solapur Airport area, catering to business travelers, MIDC visitors, and outstation tourists. Hatchbacks start at ₹1,400/day, sedans at ₹1,800/day, SUVs at ₹2,500/day, and hourly scooters from ₹150 for 3 hours. Secure your reservation with a ₹500 advance token via Razorpay."
      quickFacts={[
        { label: "Dispatch Hub", value: "Hotgi Road / Airport", subtext: "South Solapur Corridor" },
        { label: "Starting Fare", value: "₹1,400 / day", subtext: "CNG / Petrol fleet" },
        { label: "Two-Wheeler Slot", value: "From ₹150 (3 hrs)", subtext: "Complimentary helmets" },
        { label: "Advance Token", value: "₹500 Online", subtext: "Razorpay secure" },
      ]}
      recommendedVehicles={[
        {
          name: "Hyundai Aura (CNG/Petrol)",
          category: "Executive Sedan",
          fuelType: "CNG / Petrol",
          dailyRate: 1800,
          description: "Comfortable sedan with large boot space, preferred by business executives visiting Solapur MIDC and textile hubs.",
        },
        {
          name: "Kia Seltos Automatic",
          category: "Premium SUV",
          fuelType: "Petrol Auto",
          dailyRate: 2800,
          description: "Feature-packed SUV with panoramic sunroof and plush ventilated seats for client and family travel.",
        },
        {
          name: "Honda Activa 6G",
          category: "Hourly Scooter",
          fuelType: "Petrol",
          dailyRate: 500,
          description: "Convenient automatic scooter available for 3-hour, 6-hour, or daily city commutes across Hotgi Road.",
        },
      ]}
      routeHighlights={[
        {
          title: "Direct MIDC & Industrial Access",
          description: "Hotgi Road provides immediate, uninterrupted access to Solapur MIDC industrial manufacturing units and corporate hubs.",
        },
        {
          title: "Airport Transit Convenience",
          description: "Pre-book vehicle pickup right outside the airport or hotel gates with zero paperwork delays upon arrival.",
        },
        {
          title: "Outstation Route Start Point",
          description: "Hotgi Road connects directly to the Akkalkot and Gangapur highways, avoiding core city market bottlenecks.",
        },
      ]}
      faqs={[
        {
          question: "Can I get doorstep delivery of a self-drive car on Hotgi Road?",
          answer: "Yes! We offer doorstep car and scooter delivery to all hotels, residential societies, and MIDC industrial zones along Hotgi Road.",
        },
        {
          question: "What is the minimum rental duration for cars and bikes?",
          answer: "Cars are available on a 24-hour daily basis (from ₹1,400/day). Two-wheelers and scooters are available on flexible hourly slots (starting from ₹150 for 3 hours) as well as full 24-hour rentals.",
        },
        {
          question: "What documents are required for business traveler rentals?",
          answer: "You only need your personal Driving License and Aadhaar Card. Company GST invoices can also be generated directly upon request.",
        },
      ]}
      breadcrumbs={[
        { name: "Locations", url: "/locations/hotgi-road-airport" },
        { name: "Hotgi Road & Airport", url: "/locations/hotgi-road-airport" },
      ]}
    />
  );
}
