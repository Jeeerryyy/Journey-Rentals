/* Solapur Railway Station Car Rental Hub Landing Page */
import React from "react";
import HubLandingTemplate from "../../components/HubLandingTemplate";

export default function SolapurRailwayStation() {
  return (
    <HubLandingTemplate
      seoTitle="Self-Drive Car Rental Solapur Railway Station | 24/7 Gate Handover"
      seoDescription="Rent verified self-drive cars directly at Solapur Railway Station (Platform 1 Exit). Zero waiting time, express train handover, zero deposit anxiety from ₹1,400/day."
      canonicalUrl="https://journeyrentals.in/locations/solapur-railway-station"
      badgeText="🚂 Solapur Station 24/7 Express Dispatch"
      heroHeading="Self-Drive Car Rental at Solapur Railway Station"
      heroSubheading="Step off your train and take the wheel immediately. Seamless vehicle delivery at Solapur Railway Station Platform 1 exit with zero deposit stress and instant digital KYC."
      answerFirstSummary="Journey Rentals delivers verified self-drive cars and hourly two-wheelers directly to the Solapur Railway Station main gate (Platform 1 exit). Available 24/7 timed with incoming express trains including Mumbai-Solapur Vande Bharat, Siddheshwar Express, and Hutatma Express. Daily car rentals start at ₹1,400/day with transparent level-to-level fuel policy and minimal ₹500 advance booking token via Razorpay."
      quickFacts={[
        { label: "Handover Location", value: "Platform 1 Exit Gate", subtext: "Solapur Central Station" },
        { label: "Starting Daily Rate", value: "₹1,400 / day", subtext: "Clean CNG/Petrol fleet" },
        { label: "Advance Booking Token", value: "₹500 Online", subtext: "Balance at key delivery" },
        { label: "Dispatch Timings", value: "24/7 On Schedule", subtext: "Synchronized with train arrivals" },
      ]}
      recommendedVehicles={[
        {
          name: "Maruti Suzuki Swift (CNG/Petrol)",
          category: "Hatchback",
          fuelType: "CNG / Petrol",
          dailyRate: 1400,
          description: "Solapur's most economical self-drive car. Smooth city driving and peppy highway mileage for quick trips.",
        },
        {
          name: "Maruti Suzuki Ertiga (7-Seater)",
          category: "7-Seater MPV",
          fuelType: "CNG / Petrol",
          dailyRate: 2500,
          description: "The #1 choice for families arriving by train for Akkalkot, Pandharpur, or Tuljapur temple tours.",
        },
        {
          name: "Mahindra Thar 4x4 Hard Top",
          category: "Off-Road SUV",
          fuelType: "Diesel Auto",
          dailyRate: 3500,
          description: "Commanding road presence with automatic transmission and 4WD capability for outstation highway trips.",
        },
      ]}
      routeHighlights={[
        {
          title: "Zero Waiting Time Handover",
          description: "Share your PNR or train arrival time during checkout. Our executive waits with your sanitised vehicle right outside Platform 1 exit.",
        },
        {
          title: "Direct Highway Exit Access",
          description: "Solapur Station provides quick 5-minute access to NH-65 (Pune-Hyderabad) and NH-52 (Solapur-Aurangabad / Bijapur) avoiding crowded city traffic.",
        },
        {
          title: "Complimentary Return Drop-off",
          description: "Catching your return train? Hand over the car right back at the station parking before boarding your train.",
        },
      ]}
      faqs={[
        {
          question: "Where exactly does the vehicle handover happen at Solapur Railway Station?",
          answer: "Our executive meets you directly at the main entrance gate outside Platform No. 1 (near the VIP parking & auto stand). We track your train schedule so the car is parked and ready upon your arrival.",
        },
        {
          question: "What documents do I need to collect my car at the station?",
          answer: "You only need your original Indian Driving License and Aadhaar Card. You can upload digital photos during online checkout for instant pre-verification.",
        },
        {
          question: "What happens if my train arrives late at night or early in the morning?",
          answer: "We provide 24/7 delivery for pre-booked reservations. If your train is delayed, our dispatch team monitors the live train status and adjusts the handover time at no additional charge.",
        },
        {
          question: "How much advance do I have to pay to book a car at Solapur station?",
          answer: "You only pay a nominal ₹500 advance token online via Razorpay (UPI, Debit/Credit Card). The remaining rental balance is paid when you inspect the vehicle and receive the keys.",
        },
        {
          question: "Can I take the car from Solapur Station to Akkalkot, Tuljapur, and Pandharpur?",
          answer: "Yes! All Journey Rentals vehicles carry valid Maharashtra commercial tourist permits and fastag, allowing unrestricted travel across all pilgrimage and tourist destinations.",
        },
      ]}
      breadcrumbs={[
        { name: "Locations", url: "/locations/solapur-railway-station" },
        { name: "Solapur Railway Station", url: "/locations/solapur-railway-station" },
      ]}
    />
  );
}
