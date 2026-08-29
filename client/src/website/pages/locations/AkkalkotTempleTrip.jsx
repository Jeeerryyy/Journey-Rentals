/* Akkalkot Temple Self-Drive Car Rental Hub Page with Marathi & English Content */
import React from "react";
import HubLandingTemplate from "../../components/HubLandingTemplate";

export default function AkkalkotTempleTrip() {
  return (
    <HubLandingTemplate
      seoTitle="Self-Drive Car Rental Solapur to Akkalkot | Swami Samarth Darshan"
      seoDescription="Rent self-drive cars from Solapur to Akkalkot (40 km). 7-seater Ertiga & Swift from ₹1,400/day. Express pickup at Solapur Railway Station for Shri Swami Samarth darshan."
      canonicalUrl="https://journeyrentals.in/locations/akkalkot-temple-trip"
      badgeText="🚩 Akkalkot Swami Samarth Special"
      heroHeading="Self-Drive Car Rental: Solapur to Akkalkot"
      heroSubheading="Comfortable, sanitized self-drive cars for your holy darshan at Shri Swami Samarth Maharaj Vatavruksha Mandir in Akkalkot. Just a 40 km scenic drive from Solapur Railway Station."
      answerFirstSummary="Journey Rentals provides self-drive cars for devotees traveling from Solapur to Akkalkot (40 km via Akkalkot Road, approx. 45–50 mins). Hatchbacks start from ₹1,400/day, 7-seater Ertigas at ₹2,500/day, and hourly two-wheelers from ₹150 for 3 hours. Vehicles are delivered directly to Solapur Railway Station Platform 1 exit with ₹500 advance booking."
      quickFacts={[
        { label: "Distance from Solapur", value: "40 Kilometers", subtext: "Via Akkalkot Road" },
        { label: "Travel Time", value: "45 to 50 Minutes", subtext: "Scenic state highway" },
        { label: "Recommended Vehicles", value: "Ertiga (7S) / Swift / Thar", subtext: "Spacious & reliable" },
        { label: "Advance Booking Token", value: "₹500 Online", subtext: "Balance upon key delivery" },
      ]}
      marathiSection={{
        title: "सोलापूर ते अक्कलकोट स्वामी समर्थ दर्शन — कार भाड्याने",
        description: "अक्कलकोट येथील श्री स्वामी समर्थ महाराज वटवृक्ष मंदिर आणि समाधी दर्शनासाठी सोलापूर स्टेशनवरून थेट खात्रीशीर गाड्या उपलब्ध आहेत. कुटुंबियांसमवेत शांततेत व वेळेच्या सोयीनुसार दर्शन घ्या.",
        bulletPoints: [
          "सोलापूर रेल्वे स्टेशनवर गाडी थेट हँडओव्हर.",
          "वटवृक्ष मंदिर व भक्तनिवास परिसराजवळ सोयीस्कर पार्किंग.",
          "अक्कलकोट सोबतच गाणगापूर (दत्तात्रेय मंदिर) दर्शनासाठी उत्तम गाड्या.",
          "किमान ₹५०० ॲडव्हान्स देऊन झटपट डिजिटल बुकिंग.",
        ],
      }}
      recommendedVehicles={[
        {
          name: "Maruti Suzuki Ertiga 7-Seater",
          category: "7-Seater MPV",
          fuelType: "CNG / Petrol",
          dailyRate: 2500,
          description: "Spacious and ultra-comfortable 7-seater, perfect for joint families carrying pooja items and senior citizens to Akkalkot.",
        },
        {
          name: "Maruti Suzuki Swift",
          category: "Hatchback",
          fuelType: "CNG / Petrol",
          dailyRate: 1400,
          description: "Solapur's most economical self-drive car for quick half-day darshan trips to Akkalkot and back.",
        },
        {
          name: "Tata Punch Micro SUV",
          category: "Micro SUV",
          fuelType: "CNG / Petrol",
          dailyRate: 1700,
          description: "High ground clearance, sturdy ride, and commanding view for the state highway stretch to Akkalkot and Gangapur.",
        },
      ]}
      routeHighlights={[
        {
          title: "Smooth Direct Highway",
          description: "Take the Akkalkot Road directly from Solapur city. The 40 km road is well-tarred with clear signboards guiding devotees directly to the temple gates.",
        },
        {
          title: "Mahaprasad & Darshan Timings",
          description: "Vatavruksha Temple is open from 05:00 AM to 10:00 PM. Annachhatra Mahaprasad is served daily between 11:30 AM to 03:00 PM and 07:30 PM to 09:30 PM.",
        },
        {
          title: "Extension to Gangapur (Karnataka)",
          description: "Akkalkot is only 50 km from Gangapur (Narasimha Saraswati Temple). A Journey Rentals car lets you easily complete both Akkalkot and Gangapur in a single day.",
        },
      ]}
      faqs={[
        {
          question: "How far is Akkalkot from Solapur Railway Station?",
          answer: "Akkalkot is 40 kilometers from Solapur Railway Station. The drive takes approximately 45 to 50 minutes on a smooth, 2-lane road.",
        },
        {
          question: "Can I take the rental car from Akkalkot to Gangapur (Karnataka)?",
          answer: "Yes! Gangapur is approximately 50 km from Akkalkot (approx. 1 hour drive). All Journey Rentals vehicles carry inter-state permits allowing seamless cross-border travel into Karnataka.",
        },
        {
          question: "Where can I park the car in Akkalkot near the temple?",
          answer: "There are dedicated multi-acre open parking grounds operated by the Vatavruksha Devasthan and Annachhatra Trust located within 200 meters of the temple entrance.",
        },
        {
          question: "What is the advance payment required for Akkalkot trip booking?",
          answer: "You only pay ₹500 online via Razorpay to reserve the car. The remaining balance is payable when you receive the keys at Solapur Railway Station.",
        },
      ]}
      breadcrumbs={[
        { name: "Locations", url: "/locations/akkalkot-temple-trip" },
        { name: "Akkalkot Temple Trip", url: "/locations/akkalkot-temple-trip" },
      ]}
    />
  );
}
