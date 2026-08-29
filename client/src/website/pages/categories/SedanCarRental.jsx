/* Premium Sedan Self-Drive Car Rental Category Page */
import React from "react";
import HubLandingTemplate from "../../components/HubLandingTemplate";

export default function SedanCarRental() {
  return (
    <HubLandingTemplate
      seoTitle="Sedan Car Rental in Solapur | Maruti Dzire & Hyundai Aura from ₹1,800/day"
      seoDescription="Rent comfortable sedan self-drive cars in Solapur. Maruti Dzire & Hyundai Aura (CNG/Petrol) from ₹1,800/day. Large boot space, plush seating & station delivery."
      canonicalUrl="https://journeyrentals.in/car-rental/sedan"
      badgeText="💼 Executive Sedan Fleet"
      heroHeading="Executive Sedan Self-Drive Car Rental in Solapur"
      heroSubheading="Cruise in sophisticated comfort. Extra boot space for heavy luggage, plush rear seating for family members, and smooth highway stability."
      answerFirstSummary="Journey Rentals provides comfortable executive sedans in Solapur starting at ₹1,800/day for Maruti Dzire and Hyundai Aura (available in CNG and Petrol). Featuring deep 400L+ boot capacity, comfortable suspension, and high highway fuel economy. Available with 24/7 delivery at Solapur Railway Station and doorstep hubs with a ₹500 online booking advance."
      quickFacts={[
        { label: "Starting Fare", value: "₹1,800 / day", subtext: "Maruti Dzire & Hyundai Aura" },
        { label: "Boot Space", value: "400+ Liters", subtext: "Fits 3–4 large suitcases" },
        { label: "Seating", value: "5 Passengers", subtext: "Plush sedan comfort" },
        { label: "Booking Advance", value: "₹500 Online", subtext: "Razorpay secure" },
      ]}
      ctaVehicleCategory="Sedan"
      recommendedVehicles={[
        {
          name: "Maruti Suzuki Dzire (CNG/Petrol)",
          category: "Sedan",
          fuelType: "CNG / Petrol",
          dailyRate: 1800,
          description: "India's favorite sedan with plush rear seat comfort, rear AC vents, and massive trunk space.",
        },
        {
          name: "Hyundai Aura (CNG)",
          category: "Sedan",
          fuelType: "CNG",
          dailyRate: 1800,
          description: "Modern styling, touchscreen infotainment, and refined highway cruising.",
        },
      ]}
      routeHighlights={[
        {
          title: "Superior Trunk Capacity",
          description: "400+ liters of boot space easily accommodates large outstation trolley bags, gift boxes, and temple offerings.",
        },
        {
          title: "Rear Seat Passenger Comfort",
          description: "Enhanced legroom, soft cushioning, and rear armrests make long highway journeys comfortable for senior citizens.",
        },
        {
          title: "High Highway Mileage",
          description: "Efficient CNG engineering ensures low fuel consumption across outstation highway trips.",
        },
      ]}
      faqs={[
        {
          question: "Can sedan cars carry large suitcases in the boot?",
          answer: "Yes, our sedans feature deep 400+ liter luggage trunks that easily hold 2 large suitcases plus multiple smaller duffle bags.",
        },
        {
          question: "What is the daily rental price for a Maruti Dzire in Solapur?",
          answer: "The daily rental price for a Maruti Dzire starts at ₹1,800/day for a 24-hour period.",
        },
      ]}
      breadcrumbs={[
        { name: "Car Rental", url: "/fleet" },
        { name: "Sedan Rental", url: "/car-rental/sedan" },
      ]}
    />
  );
}
