import React, { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { MapPin, Car, ArrowRight, Clock, Navigation, Compass, Lightbulb, Bike, Sparkles } from "lucide-react";
import { Button } from "@/ui/button";
import { useNavigate } from "react-router-dom";

const SOLAPUR_ROUTES = {
  akkalkot: {
    id: "akkalkot",
    name: "Akkalkot Swami Samarth Pilgrimage",
    tagline: "40 km from Solapur · Peaceful & Divine One-Day Road Trip",
    badge: "Most Popular Pilgrimage",
    distance: "40 km",
    duration: "50 mins",
    recommendedVehicle: "Sedan or 7-Seater Ertiga / Innova",
    highlights: [
      "Swami Samarth Maharaj Vatavruksha Mandir",
      "Annachhatra Prasad & Peaceful Darshan",
      "Smooth Solapur-Akkalkot 4-Lane Highway",
      "Ideal for family & elderly devotees"
    ],
    schedule: [
      { time: "07:00 AM", title: "Pickup Vehicle from Solapur Railway Station", desc: "Collect your sanitized self-drive car with instant KYC verification." },
      { time: "08:00 AM", title: "Arrive at Akkalkot Vatavruksha Mandir", desc: "Attend morning Kakad Aarti and holy Samadhi Darshan under the sacred Banyan tree." },
      { time: "12:30 PM", title: "Mahaprasad at Annachhatra", desc: "Enjoy sacred Satvik Mahaprasad with thousands of devotees." },
      { time: "04:30 PM", title: "Return to Solapur via Main Road", desc: "Optional stop at Bhuikot Fort on the way back." }
    ],
    tips: "Start early in the morning to avoid darshan queues. Ample parking is available near the Annachhatra complex."
  },
  tuljapur: {
    id: "tuljapur",
    name: "Tuljapur Bhavani Mata Temple",
    tagline: "45 km via NH 52 · Maharashtra's Renowned Shakti Peetha",
    badge: "Sacred Shakti Peetha",
    distance: "45 km",
    duration: "55 mins",
    recommendedVehicle: "SUV (Creta / Fortuner) or Swift",
    highlights: [
      "Kulswamini Shri Tulja Bhavani Mata Temple",
      "Ghat Shila Mandir & Gomukh Teerth",
      "Panoramic views from Tuljapur Ghat road",
      "Traditional Solapuri Kandi Pedha"
    ],
    schedule: [
      { time: "08:00 AM", title: "Depart from Solapur Central Hub", desc: "Smooth high-speed drive on NH 52 Solapur-Aurangabad National Highway." },
      { time: "09:00 AM", title: "Darshan at Tuljabhavani Mandir", desc: "Walk through the historic temple courtyard and receive Goddess blessings." },
      { time: "01:30 PM", title: "Local Maharashtrian Lunch & Shopping", desc: "Shop for handcrafted Khana choli and fresh traditional pedha." },
      { time: "05:00 PM", title: "Scenic Sunset Drive back to Solapur", desc: "Enjoy scenic ghat views with comfortable AC drive." }
    ],
    tips: "VIP darshan passes can be booked online. Carry comfortable footwear for the temple staircase."
  },
  pandharpur: {
    id: "pandharpur",
    name: "Pandharpur Vitthal Rukmini Mandir",
    tagline: "72 km from Solapur · Spiritual Capital of Maharashtra",
    badge: "Warkari Devotional Hub",
    distance: "72 km",
    duration: "1 hr 25 mins",
    recommendedVehicle: "Comfortable Sedan / 7-Seater MPV",
    highlights: [
      "Shri Vitthal-Rukmini Mandir & Namdev Payari",
      "Holy dip & boating at Chandrabhaga River Ghat",
      "Pundalik Mandir & Vishnupad Mandir",
      "Spiritual energy & serene chanting"
    ],
    schedule: [
      { time: "06:30 AM", title: "Early Morning Departure from Solapur", desc: "Scenic countryside drive on Solapur-Pandharpur 4-lane highway." },
      { time: "08:00 AM", title: "Chandrabhaga River Ghat & Pundalik Temple", desc: "Witness holy river confluence and spiritual rituals." },
      { time: "10:30 AM", title: "Mukh Darshan at Vitthal Rukmini Mandir", desc: "Experience the divine sanctity of Lord Vitthala." },
      { time: "03:30 PM", title: "Leisurely Return Drive to Solapur", desc: "Smooth return journey and vehicle return at Railway Station." }
    ],
    tips: "Book online darshan slots in advance during Ekadashi or festive weekends."
  },
  heritage: {
    id: "heritage",
    name: "Solapur Heritage & Wildlife Tour",
    tagline: "City & Suburbs · Historic Forts, Siddheshwar Lake & Nannaj Sanctuary",
    badge: "Culture & Nature",
    distance: "35 km circuit",
    duration: "Full Day Circuit",
    recommendedVehicle: "Hatchback, Sedan or Sport Bike",
    highlights: [
      "Historic Solapur Bhuikot Fort (Water-moated medieval fort)",
      "Shri Siddheshwar Temple situated in the middle of the lake",
      "Great Indian Bustard Wildlife Sanctuary at Nannaj (22 km)",
      "Authentic Solapuri Shenga Chutney & Chivda tasting"
    ],
    schedule: [
      { time: "09:00 AM", title: "Visit Siddheshwar Lake & Temple", desc: "Peaceful morning walk around the lake and ancient Shiva temple." },
      { time: "11:30 AM", title: "Explore Solapur Bhuikot Fort", desc: "Discover medieval defense architecture and royal gardens." },
      { time: "01:30 PM", title: "Traditional Solapuri Cuisine", desc: "Relish spicy Jowar Roti, Shenga Chutney, and local delicacies." },
      { time: "03:30 PM", title: "Drive to Nannaj Great Indian Bustard Sanctuary", desc: "Spot rare migratory birds and Great Indian Bustards during golden hour." }
    ],
    tips: "Carry binoculars and camera for the Nannaj bird sanctuary. Best visited between October and March."
  }
};

export default function TripPlanner() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("akkalkot");
  const route = SOLAPUR_ROUTES[activeTab] || SOLAPUR_ROUTES.akkalkot;

  return (
    <section id="trips" className="py-12 sm:py-16 bg-[#F6F5FA] text-[#212121] border-t border-[#DFDCE8] font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-left mb-8 sm:mb-10">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#3F5F8C] font-mono mb-1 flex items-center gap-1.5">
            <Compass size={14} />
            <span>Curated Solapur Itineraries</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#212121] tracking-tight font-display">
            Self-Drive Pilgrimage &amp; Road Trip Planner
          </h2>
          <p className="text-sm text-[#6F6E73] mt-1 max-w-2xl">
            Solapur is the gateway to Maharashtra's most revered temples and heritage landmarks. Pick a route, grab your sanitized rental vehicle, and explore at your own pace.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex flex-wrap gap-2 bg-transparent p-0 mb-6 sm:mb-8 justify-start h-auto">
            <TabsTrigger
              value="akkalkot"
              className="rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider border border-[#DFDCE8] bg-white text-[#212121] data-[state=active]:bg-[#212121] data-[state=active]:text-white data-[state=active]:border-[#212121] shadow-2xs cursor-pointer transition-all"
            >
              🙏 Akkalkot (40 km)
            </TabsTrigger>
            <TabsTrigger
              value="tuljapur"
              className="rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider border border-[#DFDCE8] bg-white text-[#212121] data-[state=active]:bg-[#212121] data-[state=active]:text-white data-[state=active]:border-[#212121] shadow-2xs cursor-pointer transition-all"
            >
              🔱 Tuljapur (45 km)
            </TabsTrigger>
            <TabsTrigger
              value="pandharpur"
              className="rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider border border-[#DFDCE8] bg-white text-[#212121] data-[state=active]:bg-[#212121] data-[state=active]:text-white data-[state=active]:border-[#212121] shadow-2xs cursor-pointer transition-all"
            >
              🪘 Pandharpur (72 km)
            </TabsTrigger>
            <TabsTrigger
              value="heritage"
              className="rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider border border-[#DFDCE8] bg-white text-[#212121] data-[state=active]:bg-[#212121] data-[state=active]:text-white data-[state=active]:border-[#212121] shadow-2xs cursor-pointer transition-all"
            >
              🏰 Solapur Heritage &amp; Wildlife
            </TabsTrigger>
          </TabsList>

          {/* Route Content Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            
            {/* Left: Highlights & Specs */}
            <div className="lg:col-span-5 bg-white p-5 sm:p-7 rounded-[24px] border border-[#DFDCE8] shadow-sm text-left space-y-5">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#e1b808] text-[#212121] mb-2 font-mono">
                  {route.badge}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#212121] leading-tight">
                  {route.name}
                </h3>
                <p className="text-xs text-[#6F6E73] mt-1 font-normal">
                  {route.tagline}
                </p>
              </div>

              {/* Quick Route Stats */}
              <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#DFDCE8]">
                <div className="flex items-center gap-2">
                  <Navigation size={16} className="text-[#3F5F8C] shrink-0" />
                  <div>
                    <div className="text-[10px] text-[#99989E] uppercase tracking-wider font-semibold">Distance</div>
                    <div className="text-sm font-bold text-[#212121] font-mono">{route.distance}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-[#4B8039] shrink-0" />
                  <div>
                    <div className="text-[10px] text-[#99989E] uppercase tracking-wider font-semibold">One-Way Time</div>
                    <div className="text-sm font-bold text-[#212121] font-mono">{route.duration}</div>
                  </div>
                </div>
              </div>

              {/* Vehicle Recommendation */}
              <div className="p-3.5 rounded-2xl bg-[#F6F5FA] border border-[#DFDCE8] flex items-center gap-3">
                <Car size={20} className="text-[#212121] shrink-0" />
                <div>
                  <div className="text-[10px] text-[#6F6E73] uppercase tracking-wider font-bold">Recommended Fleet</div>
                  <div className="text-xs font-bold text-[#212121]">{route.recommendedVehicle}</div>
                </div>
              </div>

              {/* Highlights List */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[#212121] font-mono">
                  Route Highlights
                </div>
                <ul className="space-y-1.5 text-xs text-[#6F6E73]">
                  {route.highlights.map((h, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3F5F8C] shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Travel Tip */}
              <div className="p-3.5 rounded-2xl bg-[#CFDECA]/40 border border-[#CFDECA] flex items-start gap-2.5 text-xs text-[#212121]">
                <Lightbulb size={16} className="text-[#4B8039] shrink-0 mt-0.5" />
                <span><strong>Pro Tip:</strong> {route.tips}</span>
              </div>

              {/* CTA Button */}
              <button
                type="button"
                onClick={() => navigate("/fleet")}
                className="w-full bg-[#212121] hover:bg-[#141414] active:bg-[#000000] text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-full flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98 transition-all"
              >
                <span>Book Vehicle for this Trip</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Right: Step-by-Step Timeline */}
            <div className="lg:col-span-7 bg-white p-5 sm:p-7 rounded-[24px] border border-[#DFDCE8] shadow-sm text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#212121] font-mono mb-5 flex items-center gap-2">
                <Sparkles size={14} className="text-[#C4C732]" />
                <span>Suggested Daily Itinerary</span>
              </h4>

              <div className="space-y-4 relative before:absolute before:left-[17px] before:top-3 before:bottom-3 before:w-[2px] before:bg-[#DFDCE8]">
                {route.schedule.map((step, idx) => (
                  <div key={idx} className="relative pl-9 group">
                    <div className="absolute left-2.5 top-1.5 w-4 h-4 rounded-full bg-white border-2 border-[#212121] group-hover:bg-[#212121] transition-colors" />
                    <div className="p-3.5 rounded-2xl bg-[#F6F5FA] border border-[#DFDCE8] group-hover:border-[#212121] transition-all">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-[#212121]">{step.title}</span>
                        <span className="text-[10px] font-bold text-[#3F5F8C] bg-white px-2.5 py-0.5 rounded-full border border-[#DFDCE8] font-mono shrink-0">
                          {step.time}
                        </span>
                      </div>
                      <p className="text-xs text-[#6F6E73] font-normal leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </Tabs>

      </div>
    </section>
  );
}
