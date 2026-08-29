/* Tuljapur Bhavani Temple Self-Drive Car Rental Hub Page with Marathi & English Content */
import React from "react";
import HubLandingTemplate from "../../components/HubLandingTemplate";

export default function TuljapurTempleTrip() {
  return (
    <HubLandingTemplate
      seoTitle="Self-Drive Car Rental Solapur to Tuljapur | Bhavani Mata Darshan"
      seoDescription="Rent self-drive cars from Solapur to Tuljapur Bhavani Mata Temple (45 km). 7-seater Ertiga, Swift & SUVs from ₹1,400/day. Express Solapur station delivery & Fastag equipped."
      canonicalUrl="https://journeyrentals.in/locations/tuljapur-temple-trip"
      badgeText="🚩 Tuljapur Bhavani Devi Special"
      heroHeading="Self-Drive Car Rental: Solapur to Tuljapur"
      heroSubheading="Sanitized self-drive cars for your holy pilgrimage to the historic Shri Tulja Bhavani Mata Temple in Tuljapur. Just a 45 km drive on the smooth 4-lane NH-52 national highway."
      answerFirstSummary="Journey Rentals offers self-drive car rentals from Solapur to Tuljapur (45 km via NH-52 4-lane highway, approx. 45–50 mins). Popular choices include Maruti Ertiga 7-seater (₹2,500/day) and Maruti Swift (₹1,400/day). Delivered directly to Solapur Railway Station or city hubs with ₹500 online booking advance via Razorpay."
      quickFacts={[
        { label: "Distance from Solapur", value: "45 Kilometers", subtext: "Via NH-52 Highway" },
        { label: "Driving Duration", value: "45 to 50 Minutes", subtext: "4-lane express highway" },
        { label: "Recommended Car", value: "Ertiga 7S / Venue / Swift", subtext: "Safe & comfortable" },
        { label: "Advance Booking Token", value: "₹500 Online", subtext: "Balance at vehicle pickup" },
      ]}
      marathiSection={{
        title: "सोलापूर ते तुळजापूर भवानी माता दर्शन — सेल्फ ड्राईव्ह कार",
        description: "महाराष्ट्राची कुलस्वामिनी श्री तुळजाभवानी मातेच्या दर्शनासाठी सोलापूरवरून थेट स्वच्छ, सुरक्षित व आधुनिक गाड्या भाड्याने मिळतील. कुटुंबासह सुखकर प्रवास करा.",
        bulletPoints: [
          "४-लेन NH-52 राष्ट्रीय महामार्गावरून फक्त ४५ मिनिटांत तुळजापूरला पोहोचा.",
          "सोलापूर रेल्वे स्टेशनवर गाडी थेट उपलब्ध.",
          "मोठ्या कुटुंबांसाठी ७ सीटर अर्टिगा आणि ५ सीटर कार्स.",
          "किमान ₹५०० ॲडव्हान्स देऊन त्वरित बुकिंग.",
        ],
      }}
      recommendedVehicles={[
        {
          name: "Maruti Suzuki Ertiga 7-Seater",
          category: "7-Seater MPV",
          fuelType: "CNG / Petrol",
          dailyRate: 2500,
          description: "Spacious 7-seater with rear AC vents, ideal for family groups traveling to Tuljapur with puja offerings.",
        },
        {
          name: "Hyundai Venue SX Automatic",
          category: "Compact SUV",
          fuelType: "Petrol Auto",
          dailyRate: 2000,
          description: "Comfortable high-riding SUV with automatic transmission, making the NH-52 ghat approach effortless.",
        },
        {
          name: "Maruti Suzuki Swift",
          category: "Hatchback",
          fuelType: "CNG / Petrol",
          dailyRate: 1400,
          description: "Fuel-efficient hatchback, easy to park in crowded temple parking zones.",
        },
      ]}
      routeHighlights={[
        {
          title: "4-Lane NH-52 National Highway",
          description: "The Solapur-Tuljapur highway is a world-class 4-lane stretch with smooth asphalt, clear toll lanes, and family food stops.",
        },
        {
          title: "Temple Ghat & Parking",
          description: "Upon reaching Tuljapur, follow the bypass road towards Ghatshila or Mahadwar road where designated vehicle parking complexes are available.",
        },
        {
          title: "Combined Pilgrimage Route",
          description: "Many devotees visit Tuljapur in the morning and proceed to Akkalkot (65 km) in the afternoon via the dedicated bypass road.",
        },
      ]}
      faqs={[
        {
          question: "How long does it take to reach Tuljapur from Solapur Railway Station?",
          answer: "The 45 km drive takes approximately 45 to 50 minutes via the 4-lane NH-52 highway.",
        },
        {
          question: "What are the temple opening hours in Tuljapur?",
          answer: "The Shri Tulja Bhavani Temple opens daily from 05:00 AM to 10:00 PM. Charnamrit and Aarti ceremonies take place in the morning and evening.",
        },
        {
          question: "Is Fastag enabled on the rental car for the toll booth?",
          answer: "Yes, all our cars are fitted with active bank Fastag for automatic, cashless toll booth passage on NH-52.",
        },
        {
          question: "Can I book a car for a same-day return trip from Solapur to Tuljapur?",
          answer: "Yes! You can take a 24-hour car rental starting at ₹1,400, complete your darshan at your own pace, and return the car back at Solapur Station in the evening.",
        },
      ]}
      breadcrumbs={[
        { name: "Locations", url: "/locations/tuljapur-temple-trip" },
        { name: "Tuljapur Temple Trip", url: "/locations/tuljapur-temple-trip" },
      ]}
    />
  );
}
