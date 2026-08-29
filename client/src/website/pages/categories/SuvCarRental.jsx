/* 7-Seater SUV & 4x4 Self-Drive Car Rental Category Page */
import React from "react";
import HubLandingTemplate from "../../components/HubLandingTemplate";

export default function SuvCarRental() {
  return (
    <HubLandingTemplate
      seoTitle="7-Seater SUV & 4x4 Car Rental in Solapur | Ertiga, Creta & Thar"
      seoDescription="Rent 7-seater MPVs, premium SUVs & Thar 4x4 in Solapur. Maruti Ertiga (₹2,500/day), Creta & Thar from ₹1,700/day. Perfect for family temple roadtrips with Fastag."
      canonicalUrl="https://journeyrentals.in/car-rental/suv-7-seater"
      badgeText="👑 7-Seater & SUV Fleet"
      heroHeading="7-Seater SUV &amp; 4x4 Self-Drive Car Rental in Solapur"
      heroSubheading="Spacious 7-seater Ertigas, premium Creta SUVs, and iconic Mahindra Thar 4x4 vehicles with commanding highway presence, dual AC, and abundant luggage space."
      answerFirstSummary="Journey Rentals offers a verified fleet of 7-seater MPVs and SUVs in Solapur starting from ₹1,700/day (Tata Punch), ₹2,500/day (Maruti Ertiga 7-Seater CNG), and ₹3,500/day (Mahindra Thar 4x4). Handover available at Solapur Railway Station and doorstep city hubs with a ₹500 online booking advance via Razorpay."
      quickFacts={[
        { label: "Starting SUV Fare", value: "₹1,700 / day", subtext: "Tata Punch Micro SUV" },
        { label: "7-Seater Ertiga Fare", value: "₹2,500 / day", subtext: "CNG / Petrol 7-Seater" },
        { label: "Thar 4x4 Fare", value: "₹3,500 / day", subtext: "Automatic Hard Top" },
        { label: "Handover Hubs", value: "Solapur Station & City", subtext: "24/7 express delivery" },
      ]}
      ctaVehicleCategory="SUV"
      recommendedVehicles={[
        {
          name: "Maruti Suzuki Ertiga 7-Seater",
          category: "7-Seater MPV",
          fuelType: "CNG / Petrol",
          dailyRate: 2500,
          description: "The most popular family 7-seater for pilgrimage and wedding group travel. Generous luggage room and dual-zone cooling.",
        },
        {
          name: "Mahindra Thar 4x4 Hard Top",
          category: "Off-Road SUV",
          fuelType: "Diesel Auto",
          dailyRate: 3500,
          description: "Iconic 4x4 hard top SUV with rugged capabilities, automatic transmission, and striking road presence.",
        },
        {
          name: "Hyundai Creta SX (O)",
          category: "Midsize SUV",
          fuelType: "Petrol Auto",
          dailyRate: 2600,
          description: "Panoramic sunroof, ventilated seats, and smooth suspension for long highway roadtrips.",
        },
      ]}
      routeHighlights={[
        {
          title: "Ultimate Family Comfort",
          description: "7-seater Ertiga features foldable 3rd-row seats, accommodating up to 7 passengers with luggage without feeling cramped.",
        },
        {
          title: "Highway Stability & Safety",
          description: "Equipped with ABS, dual/quad airbags, reverse parking camera, and high ground clearance for rural and temple approach roads.",
        },
        {
          title: "Fuel Savings with CNG",
          description: "Our Ertiga CNG models deliver up to 26 km/kg on the highway, drastically reducing outstation trip costs.",
        },
      ]}
      faqs={[
        {
          question: "Can 7 adults comfortably fit in the Maruti Ertiga?",
          answer: "Yes, the Maruti Ertiga is ergonomically engineered for 7 passengers (2 front, 3 middle, 2 rear) with independent rear air conditioning vents.",
        },
        {
          question: "Is the Mahindra Thar available in automatic transmission?",
          answer: "Yes, our Mahindra Thar 4x4 fleet includes automatic transmission hard-top diesel models for effortless highway and trail driving.",
        },
        {
          question: "How do I book a 7-seater SUV in advance for a weekend trip?",
          answer: "Choose your dates on our website, select the 7-Seater Ertiga or SUV, and pay the ₹500 advance token via Razorpay. We reserve and lock the vehicle for your dates.",
        },
      ]}
      breadcrumbs={[
        { name: "Car Rental", url: "/fleet" },
        { name: "7-Seater & SUV Rental", url: "/car-rental/suv-7-seater" },
      ]}
    />
  );
}
