import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, MapPin, Car, Bike, Clock, Sparkles } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { Calendar } from "@/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { format, addDays } from "date-fns";
import Tilt3DCard from "./Tilt3DCard";
import CustomSelect from "./CustomSelect";

const CAR_CATEGORIES = ["All", "Sedan", "SUV", "Hatchback"];
const BIKE_CATEGORIES = ["All", "Sports", "Cruiser", "Scooter"];

const SOLAPUR_LOCATIONS = [
  "Solapur Railway Station",
  "Hotgi Road & Airport Hub",
  "Vijapur Road Hub",
  "Akkalkot Road Hub",
  "Doorstep Delivery (Solapur City)",
];

const BIKE_SLOTS = [
  { id: "24hr", label: "24 Hours (Full Day)" },
];

const TIME_OPTIONS = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
  "20:00", "21:00", "22:00", "23:00"
];

function formatTime12(time24) {
  if (!time24) return "";
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, "0")}:${String(m || 0).padStart(2, "0")} ${period}`;
}

export default function SearchWidget({ variant = "hero" }) {
  const navigate = useNavigate();
  const [vehicleType, setVehicleType] = useState("car"); // 'car' or 'bike'
  const [location, setLocation] = useState(SOLAPUR_LOCATIONS[0]);
  const [category, setCategory] = useState("All");

  // Car Booking Dates
  const [pickupDate, setPickupDate] = useState(() => {
    const d = new Date();
    d.setHours(9, 0, 0, 0);
    return d;
  });
  const [returnDate, setReturnDate] = useState(() => {
    const d = addDays(new Date(), 1);
    d.setHours(9, 0, 0, 0);
    return d;
  });
  const [pickupTime, setPickupTime] = useState("09:00");
  const [returnTime, setReturnTime] = useState("09:00");
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Bike Booking Dates & Slots
  const [bikeDate, setBikeDate] = useState(new Date());
  const [bikeSlot, setBikeSlot] = useState("24hr");
  const [bikeCalendarOpen, setBikeCalendarOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("type", vehicleType);
    params.set("location", location);
    if (category !== "All") params.set("category", category);

    if (vehicleType === "car") {
      params.set("pickup", format(pickupDate, "yyyy-MM-dd"));
      params.set("drop", format(returnDate, "yyyy-MM-dd"));
      params.set("pickupTime", pickupTime);
      params.set("dropTime", returnTime);
    } else {
      params.set("date", format(bikeDate, "yyyy-MM-dd"));
      params.set("slot", bikeSlot);
    }

    navigate(`/fleet?${params.toString()}`);
  };

  return (
    <Tilt3DCard maxTilt={2} scale={1.005} className="w-full max-w-5xl mx-auto font-body">
      <div className="bg-white rounded-[24px] border border-[#DFDCE8] shadow-md p-4 sm:p-6 text-left">
        {/* Vehicle Type Toggle Tabs */}
        <div className="flex items-center justify-between gap-2 border-b border-[#DFDCE8] pb-4 mb-5">
          <div className="flex items-center gap-2 bg-[#F6F5FA] p-1 rounded-full border border-[#DFDCE8]">
            <button
              type="button"
              onClick={() => { setVehicleType("car"); setCategory("All"); }}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                vehicleType === "car"
                  ? "bg-[#212121] text-white shadow-xs"
                  : "text-[#6F6E73] hover:text-[#212121]"
              }`}
            >
              <Car size={15} />
              <span>Self-Drive Cars</span>
            </button>

            <button
              type="button"
              onClick={() => { setVehicleType("bike"); setCategory("All"); }}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                vehicleType === "bike"
                  ? "bg-[#212121] text-white shadow-xs"
                  : "text-[#6F6E73] hover:text-[#212121]"
              }`}
            >
              <Bike size={15} />
              <span>Hourly &amp; Daily Bikes</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#4B8039] font-semibold bg-[#CFDECA]/50 px-3 py-1.5 rounded-full">
            <Sparkles size={13} />
            <span>Instant Booking Confirmation</span>
          </div>
        </div>

        {/* Search Inputs Grid */}
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-end">
            {/* 1. Location Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#6F6E73] mb-1.5">
                Pickup Hub
              </label>
              <Select value={location || undefined} onValueChange={setLocation}>
                <SelectTrigger className="w-full h-12 rounded-xl border-[#DFDCE8] bg-[#F6F5FA] text-[#212121] text-xs font-medium focus:ring-1 focus:ring-[#212121]">
                  <div className="flex items-center gap-2 truncate">
                    <MapPin size={15} className="text-[#3F5F8C] shrink-0" />
                    <SelectValue placeholder="select your pickup location" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl border-[#DFDCE8] shadow-lg">
                  {SOLAPUR_LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc} className="text-xs font-medium cursor-pointer">
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 2. Category Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#6F6E73] mb-1.5">
                Category
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full h-12 rounded-xl border-[#DFDCE8] bg-[#F6F5FA] text-[#212121] text-xs font-medium focus:ring-1 focus:ring-[#212121]">
                  <div className="flex items-center gap-2 truncate">
                    {vehicleType === "car" ? <Car size={15} className="text-[#212121] shrink-0" /> : <Bike size={15} className="text-[#212121] shrink-0" />}
                    <SelectValue placeholder="All Categories" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl border-[#DFDCE8] shadow-lg">
                  {(vehicleType === "car" ? CAR_CATEGORIES : BIKE_CATEGORIES).map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-xs font-medium cursor-pointer">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 3. Dates & Slots */}
            {vehicleType === "car" ? (
              <div className="lg:col-span-1">
                <label className="block text-xs font-semibold text-[#6F6E73] mb-1.5">
                  Trip Dates
                </label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-full h-12 px-3 rounded-xl border border-[#DFDCE8] bg-[#F6F5FA] text-[#212121] text-xs font-medium flex items-center justify-between gap-2 text-left cursor-pointer hover:border-[#212121] transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <CalendarIcon size={15} className="text-[#3F5F8C] shrink-0" />
                        <span className="truncate">
                          {format(pickupDate, "dd MMM")} – {format(returnDate, "dd MMM")}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#6F6E73] font-mono shrink-0">
                        {Math.max(1, Math.ceil((returnDate - pickupDate) / (1000 * 60 * 60 * 24)))}d
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3 bg-white rounded-2xl border-[#DFDCE8] shadow-xl z-60" align="start">
                    <Calendar
                      mode="range"
                      selected={{ from: pickupDate, to: returnDate }}
                      onSelect={(range) => {
                        if (range?.from) setPickupDate(range.from);
                        if (range?.to) {
                          setReturnDate(range.to);
                          setCalendarOpen(false);
                        }
                      }}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <div className="lg:col-span-1">
                <label className="block text-xs font-semibold text-[#6F6E73] mb-1.5">
                  Rental Duration
                </label>
                <Select value={bikeSlot} onValueChange={setBikeSlot}>
                  <SelectTrigger className="w-full h-12 rounded-xl border-[#DFDCE8] bg-[#F6F5FA] text-[#212121] text-xs font-medium focus:ring-1 focus:ring-[#212121]">
                    <div className="flex items-center gap-2 truncate">
                      <Clock size={15} className="text-[#3F5F8C] shrink-0" />
                      <SelectValue placeholder="Select Slot" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl border-[#DFDCE8] shadow-lg">
                    {BIKE_SLOTS.map((slot) => (
                      <SelectItem key={slot.id} value={slot.id} className="text-xs font-medium cursor-pointer">
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* 4. Submit Search Button */}
            <div>
              <button
                type="submit"
                className="w-full h-12 bg-[#212121] hover:bg-[#141414] active:bg-[#000000] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
              >
                <span>Find Available Fleet</span>
                <span className="text-sm font-normal">→</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </Tilt3DCard>
  );
}
