/* Brex / Urbanist Design System — Exact DriveHub Goa Parity */
import React from "react";
import { format, addDays } from "date-fns";
import {
  Calendar as CalendarIcon,
  MapPin,
  Car,
  Bike,
  Clock,
  Zap,
  Filter,
  Cog,
  Fuel,
  RotateCcw,
  Check,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { Calendar } from "@/ui/calendar";
import CustomSelect from "./CustomSelect";

const SOLAPUR_LOCATIONS = [
  "Solapur Railway Station (Main Hub)",
  "Hotgi Road & Airport Hub",
  "Vijapur Road Hub",
  "Akkalkot Road Hub",
  "Doorstep Delivery (Solapur City)",
];

const TIME_OPTIONS = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30",
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
  "21:00", "21:30", "22:00", "22:30", "23:00", "23:30", "00:00"
];

function formatTime12(time24) {
  if (!time24) return "";
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, "0")}:${String(m || 0).padStart(2, "0")} ${period}`;
}

function setTimeOnDate(dateObj, timeStr) {
  if (!dateObj) return dateObj;
  const [hours, minutes] = timeStr.split(":").map(Number);
  const newDate = new Date(dateObj);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
}

export default function FleetFilterSidebar({
  pickup,
  drop,
  onPickupChange,
  onDropChange,
  onOneDayExpress,
  location,
  onLocationChange,
  vehicleType = "all",
  onVehicleTypeChange,
  category,
  onCategoryChange,
  transmission,
  onTransmissionChange,
  fuelType,
  onFuelTypeChange,
  categories = ["All", "SUV", "Sedan", "Hatchback", "Convertible", "Bike"],
  transmissions = ["All", "Manual", "Automatic"],
  fuelTypes = ["All", "Petrol", "Diesel", "EV"],
  categoryCounts = {},
  totalCount = 0,
  onReset,
  hasActiveFilters = false,
  activeFilterCount = 0,
  variant = "desktop",
  onApplyMobile,
}) {
  const [pickupCalendarOpen, setPickupCalendarOpen] = React.useState(false);
  const [dropCalendarOpen, setDropCalendarOpen] = React.useState(false);

  const durationHours = pickup && drop ? (drop.getTime() - pickup.getTime()) / (1000 * 60 * 60) : 24;
  const durationDays = Math.max(1, Math.ceil((durationHours - 0.001) / 24));
  const minDropDate = pickup ? new Date(pickup.getFullYear(), pickup.getMonth(), pickup.getDate() + 1) : new Date();

  const handlePickupDateSelect = (newDate) => {
    if (!newDate) return;
    const pTime = pickup ? format(pickup, "HH:mm") : "09:00";
    const updatedPickup = setTimeOnDate(newDate, pTime);
    onPickupChange?.(updatedPickup);
    const targetDays = Math.max(1, durationDays);
    const dTime = drop ? format(drop, "HH:mm") : "09:00";
    onDropChange?.(setTimeOnDate(addDays(newDate, targetDays), dTime));
    setPickupCalendarOpen(false);
  };

  const handleDropDateSelect = (newDate) => {
    if (!newDate) return;
    const dTime = drop ? format(drop, "HH:mm") : "09:00";
    const updatedDrop = setTimeOnDate(newDate, dTime);
    if (pickup && updatedDrop.getTime() <= pickup.getTime()) {
      onDropChange?.(setTimeOnDate(addDays(pickup, 1), dTime));
    } else {
      onDropChange?.(updatedDrop);
    }
    setDropCalendarOpen(false);
  };

  return (
    <aside
      className={`w-full text-[#212121] font-body text-left ${
        variant === "desktop"
          ? "bg-white border border-[#DFDCE8] rounded-[24px] p-5 sm:p-6 shadow-sm sticky top-24"
          : "bg-white p-4"
      }`}
      data-testid="fleet-filter-sidebar"
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#DFDCE8]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#e1b808] flex items-center justify-center text-[#212121]">
            <Filter size={14} className="text-[#212121]" />
          </div>
          <div>
            <h3 className="font-display text-sm font-bold text-[#212121] tracking-tight">
              Refine Fleet
            </h3>
            <p className="text-[11px] text-[#6F6E73] font-normal font-mono">
              {totalCount} vehicles available
            </p>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold text-[#212121] bg-[#EFEDF5] hover:bg-[#DFDCE8] transition-all cursor-pointer font-mono"
            data-testid="reset-filters-btn"
          >
            <RotateCcw size={11} />
            <span>Reset ({activeFilterCount})</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* 1. Rental Dates & Express */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6F6E73] uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <CalendarIcon size={13} className="text-[#212121]" /> Dates &amp; Times
            </span>
            <span className="text-[11px] font-bold text-[#212121] bg-[#e1b808] px-2.5 py-0.5 rounded-full font-mono">
              {durationDays} {durationDays === 1 ? "Day" : "Days"}
            </span>
          </div>

          {/* Quick Preset Strip */}
          <button
            type="button"
            onClick={onOneDayExpress}
            className="w-full mb-2.5 py-1.5 px-3 rounded-full bg-[#e1b808] hover:bg-[#E5E690] text-[#212121] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-98"
          >
            <Zap size={13} /> 1-Day Express (9 AM–9 PM)
          </button>

          <div className="grid grid-cols-2 gap-2">
            {/* Pickup Date Button */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#99989E] mb-1 font-mono">Pickup</label>
              <Popover open={pickupCalendarOpen} onOpenChange={setPickupCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full h-10 px-3 rounded-full border border-[#DFDCE8] bg-[#F6F5FA] hover:border-[#212121] text-left flex items-center justify-between text-xs font-bold text-[#212121] transition-colors cursor-pointer"
                  >
                    <span className="truncate">{pickup ? format(pickup, "dd MMM") : "Select"}</span>
                    <CalendarIcon size={12} className="text-[#6F6E73] shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2 bg-white rounded-2xl border-[#DFDCE8] shadow-xl z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={pickup}
                    onSelect={handlePickupDateSelect}
                    disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Drop Date Button */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#99989E] mb-1 font-mono">Return</label>
              <Popover open={dropCalendarOpen} onOpenChange={setDropCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full h-10 px-3 rounded-full border border-[#DFDCE8] bg-[#F6F5FA] hover:border-[#212121] text-left flex items-center justify-between text-xs font-bold text-[#212121] transition-colors cursor-pointer"
                  >
                    <span className="truncate">{drop ? format(drop, "dd MMM") : "Select"}</span>
                    <CalendarIcon size={12} className="text-[#6F6E73] shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2 bg-white rounded-2xl border-[#DFDCE8] shadow-xl z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={drop}
                    onSelect={handleDropDateSelect}
                    disabled={{ before: minDropDate }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* 2. Pickup Location Selector */}
        <div>
          <label className="block text-xs font-bold text-[#6F6E73] uppercase tracking-wider mb-1.5 font-mono flex items-center gap-1.5">
            <MapPin size={13} className="text-[#212121]" /> Solapur Pickup Hub
          </label>
          <CustomSelect
            value={location}
            onChange={(val) => onLocationChange?.(val)}
            options={SOLAPUR_LOCATIONS}
            placeholder="Select your pickup location"
          />
        </div>

        {/* 3. Categories List with Badges */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6F6E73] uppercase tracking-wider font-mono">
              Vehicle Class
            </span>
          </div>
          <div className="space-y-1">
            {categories.map((c) => {
              const isSelected = (category || "All").toLowerCase() === c.toLowerCase();
              const count = c === "All" ? totalCount : (categoryCounts[c] ?? 0);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => onCategoryChange?.(c)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#212121] text-white shadow-2xs"
                      : "text-[#212121] hover:bg-[#F6F5FA]"
                  }`}
                >
                  <span className="truncate">{c === "All" ? "All Fleet Vehicles" : c}</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isSelected ? "bg-white/20 text-[#e1b808]" : "bg-[#F6F5FA] text-[#6F6E73]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Transmission Selector */}
        <div>
          <label className="block text-xs font-bold text-[#6F6E73] uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
            <Cog size={13} className="text-[#212121]" /> Transmission
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-full bg-[#F6F5FA] border border-[#DFDCE8]">
            {transmissions.map((t) => {
              const isSelected = (transmission || "All").toLowerCase() === t.toLowerCase();
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => onTransmissionChange?.(t)}
                  className={`py-1.5 px-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#212121] text-white shadow-2xs"
                      : "text-[#6F6E73] hover:text-[#212121]"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Fuel Type Selector */}
        <div>
          <label className="block text-xs font-bold text-[#6F6E73] uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
            <Fuel size={13} className="text-[#212121]" /> Fuel Type
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#F6F5FA] border border-[#DFDCE8]">
            {fuelTypes.map((f) => {
              const isSelected = (fuelType || "All").toLowerCase() === f.toLowerCase();
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => onFuelTypeChange?.(f)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center truncate ${
                    isSelected
                      ? "bg-[#212121] text-white shadow-2xs"
                      : "text-[#6F6E73] hover:text-[#212121]"
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
