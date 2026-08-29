/* Pandharpur Temple Self-Drive Car Rental Hub Page with Marathi & English Content */
import React from "react";
import HubLandingTemplate from "../../components/HubLandingTemplate";

export default function PandharpurTempleTrip() {
  return (
    <HubLandingTemplate
      seoTitle="Self-Drive Car Rental Solapur to Pandharpur | Vitthal Darshan Tour"
      seoDescription="Book self-drive cars from Solapur to Pandharpur Vitthal-Rukmini temple. 7-seater Ertiga & Swift from ₹1,400/day. Express Solapur railway station pickup & unlimited km options."
      canonicalUrl="https://journeyrentals.in/locations/pandharpur-temple-trip"
      badgeText="🚩 Pandharpur Devotional Route Special"
      heroHeading="Self-Drive Car Rental: Solapur to Pandharpur"
      heroSubheading="Comfortable, sanitized, and family-ready self-drive cars for your holy Shri Vitthal-Rukmini Mandir darshan in Pandharpur. Fast 72 km highway drive with complete travel flexibility."
      answerFirstSummary="Journey Rentals provides sanitized self-drive cars for pilgrims traveling from Solapur to Pandharpur (72 km via NH-65 / Mohol bypass, approx. 1 hr 15 mins). Popular vehicles include 7-seater Maruti Ertiga (₹2,500/day) and Maruti Swift (₹1,400/day). Direct handover available at Solapur Railway Station so you can start your Vitthal darshan without public bus crowding or expensive taxi negotiations."
      quickFacts={[
        { label: "Distance from Solapur", value: "72 Kilometers", subtext: "Via NH-65 & Mohol" },
        { label: "Driving Duration", value: "1 hr 15 mins", subtext: "Smooth 4-lane highway" },
        { label: "Recommended Car", value: "Ertiga 7-Seater / Swift", subtext: "Spacious for families" },
        { label: "Starting Fare", value: "₹1,400 / day", subtext: "Transparent pricing" },
      ]}
      marathiSection={{
        title: "सोलापूर ते पंढरपूर विठ्ठल दर्शन — सेल्फ ड्राईव्ह कार सेवा",
        description: "पंढरपूर येथील श्री विठ्ठल-रुक्मिणी दर्शनासाठी सोलापूर रेल्वे स्टेशनवरून थेट स्वच्छ व सॅनिटाइज्ड गाड्या भाड्याने मिळतील. कुटुंबासह सुखकर आणि वेळेचे बंधन नसलेला प्रवास करा.",
        bulletPoints: [
          "सोलापूर स्टेशनवर थेट गाडीची डिलिव्हरी आणि परतीवेळी तिथेच हँडओव्हर.",
          "७ सीटर अर्टिगा आणि ५ सीटर स्विफ्ट गाड्या उपलब्ध (CNG/Petrol पर्याय).",
          "फक्त ₹५०० ऑनलाईन ॲडव्हान्स टोकन देऊन बुकिंग कन्फर्म करा.",
          "चंद्रभागा नदी घाट आणि मंदिर परिसराजवळील सोयीस्कर पार्किंगसाठी उत्तम गाड्या.",
        ],
      }}
      recommendedVehicles={[
        {
          name: "Maruti Suzuki Ertiga 7-Seater",
          category: "7-Seater MPV",
          fuelType: "CNG / Petrol",
          dailyRate: 2500,
          description: "Top recommendation for family pilgrimage. Generous legroom, chilled dual AC, and luggage space for senior citizens and children.",
        },
        {
          name: "Hyundai Creta SX (O) Automatic",
          category: "Midsize SUV",
          fuelType: "Petrol Auto",
          dailyRate: 2600,
          description: "Effortless highway cruiser with panoramic sunroof, cruise control, and plush comfort for the Pandharpur corridor.",
        },
        {
          name: "Maruti Suzuki Swift",
          category: "Hatchback",
          fuelType: "CNG / Petrol",
          dailyRate: 1400,
          description: "Economical choice for couples or small groups of 3–4 pilgrims seeking high mileage and easy temple lane parking.",
        },
      ]}
      routeHighlights={[
        {
          title: "Road Condition & Route",
          description: "Take NH-65 from Solapur towards Mohol, then take the smooth Pandharpur bypass road. Excellent 4-lane highway with minimal traffic bumps.",
        },
        {
          title: "Temple Parking Guidance",
          description: "Spacious official paid parking grounds are available near ISKCON Temple and 65th Mile Stone, situated a comfortable 5–10 minute e-rickshaw ride from the main Vitthal Mandir gate.",
        },
        {
          title: "Ideal Combined Circuit",
          description: "Many devotees comfortably combine Pandharpur, Akkalkot, and Tuljapur across a 2-day or 3-day self-drive itinerary from Solapur Station.",
        },
      ]}
      faqs={[
        {
          question: "How long does it take to drive from Solapur to Pandharpur?",
          answer: "The 72 km drive typically takes 1 hour 15 minutes to 1 hour 30 minutes via NH-65 and the Mohol-Pandharpur highway.",
        },
        {
          question: "Which car is best for a family visiting Pandharpur?",
          answer: "For families of 5 to 7 members with elderly parents or luggage, the Maruti Ertiga 7-Seater (CNG/Petrol) is the most comfortable and cost-effective vehicle. For smaller families, the Swift or Hyundai Venue is ideal.",
        },
        {
          question: "Can I pick up the car at Solapur station and drop it after the Pandharpur trip?",
          answer: "Yes, you can collect the vehicle right outside Solapur Railway Station when your train arrives, complete your Pandharpur darshan, and hand it back at the station before boarding your return train.",
        },
        {
          question: "Are toll charges and Fastag included?",
          answer: "All our rental cars are equipped with an active bank Fastag for cashless toll booths. Toll amounts used during your highway trip are settled transparently at vehicle return.",
        },
      ]}
      breadcrumbs={[
        { name: "Locations", url: "/locations/pandharpur-temple-trip" },
        { name: "Pandharpur Temple Trip", url: "/locations/pandharpur-temple-trip" },
      ]}
    />
  );
}
