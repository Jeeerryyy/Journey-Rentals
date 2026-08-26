/* Brex / Urbanist Design System — Exact 1:1 Parity with DriveHub Goa */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import SEO from "../components/seo/SEO";
import { BreadcrumbStructuredData } from "../components/seo/AdditiveSchemas";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import VehicleCard from "../components/VehicleCard";
import FleetFilterSidebar from "../components/FleetFilterSidebar";
import CustomSelect from "../components/CustomSelect";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/ui/sheet";
import { Skeleton } from "@/ui/skeleton";
import api from "@/lib/api";
import {
  SlidersHorizontal,
  Search,
  X,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  Car,
  MapPin,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { format, addDays } from "date-fns";

const CATEGORIES = ["All", "SUV", "Sedan", "Hatchback", "Crossover", "Bike"];
const TRANSMISSIONS = ["All", "Manual", "Automatic"];
const FUEL_TYPES = ["All", "Petrol", "Diesel", "Hybrid", "CNG", "EV"];

export default function FleetPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pickup, setPickup] = useState(() => {
    const s = params.get("pickup") || params.get("start");
    if (s && !isNaN(new Date(s).getTime())) return new Date(s);
    const d = new Date();
    d.setHours(9, 0, 0, 0);
    return d;
  });

  const [drop, setDrop] = useState(() => {
    const e = params.get("drop") || params.get("end");
    if (e && !isNaN(new Date(e).getTime())) return new Date(e);
    return addDays(new Date(), 2);
  });

  const [location, setLocation] = useState(params.get("location") || "Solapur Railway Station (Main Hub)");
  const [category, setCategory] = useState(params.get("category") || (params.get("type") === "bike" ? "Bike" : "All"));
  const [transmission, setTransmission] = useState(params.get("transmission") || "All");
  const [fuelType, setFuelType] = useState(params.get("fuel") || "All");
  const [searchQuery, setSearchQuery] = useState(params.get("search") || "");
  const [sortBy, setSortBy] = useState("recommended");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Fetch Fleet
  const fetchFleet = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.vehicles.getAll();
      const list = res.vehicles || res.data || (Array.isArray(res) ? res : []);
      setVehicles(list);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFleet();
  }, [fetchFleet]);

  // Sync params to URL
  useEffect(() => {
    const newParams = new URLSearchParams();
    if (pickup) newParams.set("pickup", pickup.toISOString());
    if (drop) newParams.set("drop", drop.toISOString());
    if (location && location !== "Solapur Railway Station (Main Hub)") newParams.set("location", location);
    if (category && category !== "All") newParams.set("category", category);
    if (transmission && transmission !== "All") newParams.set("transmission", transmission);
    if (fuelType && fuelType !== "All") newParams.set("fuel", fuelType);
    setParams(newParams, { replace: true });
  }, [pickup, drop, location, category, transmission, fuelType, setParams]);

  // Quick preset for 1-Day Express
  const handleOneDayExpress = () => {
    const p = new Date();
    p.setHours(9, 0, 0, 0);
    const d = new Date(p);
    d.setHours(21, 0, 0, 0);
    setPickup(p);
    setDrop(d);
  };

  // Reset all filters
  const handleResetFilters = () => {
    const p = new Date();
    p.setHours(9, 0, 0, 0);
    const d = addDays(p, 2);
    d.setHours(9, 0, 0, 0);
    setPickup(p);
    setDrop(d);
    setLocation("Solapur Railway Station (Main Hub)");
    setCategory("All");
    setTransmission("All");
    setFuelType("All");
    setSearchQuery("");
    setSortBy("recommended");
  };

  // Dynamic category counts
  const categoryCounts = useMemo(() => {
    const counts = {};
    for (const cat of CATEGORIES) {
      if (cat === "All") continue;
      if (cat === "Bike") {
        counts[cat] = vehicles.filter((v) => v.type === "bike").length;
      } else {
        counts[cat] = vehicles.filter((v) => v.category?.toLowerCase() === cat.toLowerCase() || (v.type === "car" && v.category?.toLowerCase() === cat.toLowerCase())).length;
      }
    }
    return counts;
  }, [vehicles]);

  const hasActiveFilters =
    category !== "All" ||
    transmission !== "All" ||
    fuelType !== "All" ||
    location !== "Solapur Railway Station (Main Hub)" ||
    searchQuery.trim() !== "";

  const activeFilterCount = [
    category !== "All",
    transmission !== "All",
    fuelType !== "All",
    location !== "Solapur Railway Station (Main Hub)",
    searchQuery.trim() !== "",
  ].filter(Boolean).length;

  // Filter & sort
  const filteredVehicles = useMemo(() => {
    let list = [...vehicles];

    // Category / Type filter
    if (category !== "All") {
      if (category === "Bike") {
        list = list.filter((v) => v.type === "bike");
      } else {
        list = list.filter((v) => v.category?.toLowerCase() === category.toLowerCase());
      }
    }

    // Transmission
    if (transmission !== "All") {
      list = list.filter((v) => (v.transmission || "Manual").toLowerCase() === transmission.toLowerCase());
    }

    // Fuel Type
    if (fuelType !== "All") {
      list = list.filter((v) => {
        const f = (v.fuelType || v.fuel_type || "").toLowerCase();
        return f === fuelType.toLowerCase();
      });
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((v) => {
        const full = `${v.brand || ''} ${v.model || ''} ${v.title || ''}`.toLowerCase();
        const cat = (v.category || '').toLowerCase();
        return full.includes(q) || cat.includes(q);
      });
    }

    // Sort order
    if (sortBy === "price-asc") {
      list.sort((a, b) => {
        const pA = a.type === "bike" ? (a.bikeSlots?.price3hr || 150) : (a.pricePerDay || 2000);
        const pB = b.type === "bike" ? (b.bikeSlots?.price3hr || 150) : (b.pricePerDay || 2000);
        return pA - pB;
      });
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => {
        const pA = a.type === "bike" ? (a.bikeSlots?.price3hr || 150) : (a.pricePerDay || 2000);
        const pB = b.type === "bike" ? (b.bikeSlots?.price3hr || 150) : (b.pricePerDay || 2000);
        return pB - pA;
      });
    } else if (sortBy === "seats") {
      list.sort((a, b) => (b.sittingCapacity || (b.type === "bike" ? 2 : 5)) - (a.sittingCapacity || (a.type === "bike" ? 2 : 5)));
    }

    return list;
  }, [vehicles, category, transmission, fuelType, searchQuery, sortBy]);

  const cardQueryParams = useMemo(() => {
    const p = new URLSearchParams();
    if (pickup) p.set("pickup", pickup.toISOString());
    if (drop) p.set("drop", drop.toISOString());
    if (location) p.set("location", location);
    return p.toString();
  }, [pickup, drop, location]);

  return (
    <div className="no-scroll-x min-h-screen bg-[#FCFCFD] text-[#212121] relative overflow-x-hidden font-body">
      <SEO
        title="Self-Drive Fleet in Solapur — Cars & Hourly Bikes | Journey Rentals"
        description="Browse Journey Rentals full fleet of self-drive cars and hourly bikes in Solapur. Filter by SUV, Sedan, Hatchback & Bikes. Direct railway station handover."
        canonical="/fleet"
      />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: "/" },
          { name: "Our Fleet", url: "/fleet" },
        ]}
      />
      <Navbar />

      {/* Header Banner */}
      <section className="pt-24 sm:pt-28 pb-4 sm:pb-6 max-w-7xl mx-auto px-4 sm:px-6 font-body text-left">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6F6E73] mb-3 sm:mb-4">
          <Link to="/" className="hover:text-[#212121] transition-colors">Home</Link>
          <ChevronRight size={13} className="text-[#99989E]" />
          <span className="text-[#212121] font-bold">Our Fleet</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl text-[#212121] font-bold tracking-tight font-display">
              Choose Your Self-Drive Vehicle
            </h1>
            <p className="text-xs sm:text-sm text-[#6F6E73] mt-1 max-w-xl font-normal">
              Verified sanitized cars &amp; hourly bikes delivered to Solapur Railway Station or your hotel with zero security deposit hassle.
            </p>
          </div>

          {/* Active Search Summary Badge */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono bg-white px-4 py-2 rounded-full border border-[#DFDCE8] text-[#6F6E73] shadow-xs">
            <Calendar size={13} className="text-[#212121]" />
            <span className="font-bold text-[#212121]">
              {format(pickup, "dd MMM")} – {format(drop, "dd MMM")}
            </span>
            <span className="text-[#DFDCE8]">|</span>
            <MapPin size={13} className="text-[#212121]" />
            <span className="truncate max-w-[180px] font-medium text-[#212121]">{location}</span>
          </div>
        </div>

        {/* Mobile Quick Category Bar & Filter Trigger */}
        <div className="lg:hidden mt-5 pt-3 border-t border-[#DFDCE8] space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="flex-1 flex items-center justify-between h-10 px-5 rounded-full bg-[#212121] hover:bg-[#141414] text-white font-mono text-xs font-medium uppercase tracking-wider shadow-sm active:scale-98 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal size={14} />
                Filters &amp; Dates
              </span>
              {activeFilterCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#e1b808] text-[#212121] text-[10px] font-bold">
                  {activeFilterCount} Active
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="h-10 px-4 rounded-full bg-white border border-[#DFDCE8] text-xs font-mono font-medium text-[#6F6E73] hover:text-[#212121] flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
              >
                <RotateCcw size={12} />
                Reset
              </button>
            )}
          </div>

          {/* Horizontal scrollable category pill bar on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar pt-1">
            {CATEGORIES.map((c) => {
              const isSelected = category.toLowerCase() === c.toLowerCase();
              const count = c === "All" ? vehicles.length : (categoryCounts[c] ?? 0);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`h-9 px-3.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all shrink-0 cursor-pointer active:scale-95 flex items-center gap-2 border ${
                    isSelected
                      ? "bg-[#212121] text-white border-[#212121] shadow-xs font-bold"
                      : "bg-white text-[#212121] border-[#DFDCE8] hover:border-[#212121]"
                  }`}
                >
                  <span>{c}</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
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
      </section>

      {/* Main 2-Column Section (Left Sidebar + Right Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* ── Left Sidebar (Desktop) ── */}
          <aside className="hidden lg:block w-[300px] xl:w-[320px] shrink-0">
            <FleetFilterSidebar
              pickup={pickup}
              drop={drop}
              onPickupChange={setPickup}
              onDropChange={setDrop}
              onOneDayExpress={handleOneDayExpress}
              location={location}
              onLocationChange={setLocation}
              category={category}
              onCategoryChange={setCategory}
              transmission={transmission}
              onTransmissionChange={setTransmission}
              fuelType={fuelType}
              onFuelTypeChange={setFuelType}
              categories={CATEGORIES}
              transmissions={TRANSMISSIONS}
              fuelTypes={FUEL_TYPES}
              categoryCounts={categoryCounts}
              totalCount={vehicles.length}
              onReset={handleResetFilters}
              hasActiveFilters={hasActiveFilters}
              activeFilterCount={activeFilterCount}
              variant="desktop"
            />
          </aside>

          {/* ── Right Content Area (Catalog Grid) ── */}
          <main className="flex-1 min-w-0 w-full text-left">
            {/* Top Toolbar: Search + Count + Sorting */}
            <div className="bg-white rounded-[24px] p-3 sm:p-4 border border-[#DFDCE8] shadow-sm mb-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search input (Urbanist Pill) */}
              <div className="relative flex-1">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#99989E]" />
                <input
                  type="text"
                  placeholder="Search vehicle make or model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-10 pr-8 rounded-full bg-[#F6F5FA] border border-[#DFDCE8] text-xs font-normal text-[#212121] placeholder:text-[#99989E] focus:outline-none focus:bg-white focus:border-[#212121] transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#99989E] hover:text-[#212121] p-1 cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Sorting & Count */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <div className="text-xs font-normal text-[#6F6E73]">
                  <span className="text-[#212121] font-bold">{filteredVehicles.length}</span>{" "}
                  {filteredVehicles.length === 1 ? "Vehicle" : "Vehicles"} Available
                </div>

                <div className="w-[180px]">
                  <CustomSelect
                    value={sortBy}
                    onChange={setSortBy}
                    options={[
                      { value: "recommended", label: "Recommended" },
                      { value: "price-asc", label: "Price: Low to High" },
                      { value: "price-desc", label: "Price: High to Low" },
                      { value: "seats", label: "Most Seats First" },
                    ]}
                    icon={ArrowUpDown}
                    placeholder="Sort Fleet"
                    align="right"
                  />
                </div>
              </div>
            </div>

            {/* Active Filters Pill Bar (if any active) */}
            {hasActiveFilters && (
              <div className="flex items-center gap-1.5 flex-wrap mb-4">
                <span className="text-[11px] font-mono uppercase font-bold text-[#6F6E73]">Active:</span>

                {category !== "All" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#212121] text-white shadow-xs">
                    {category}
                    <button type="button" onClick={() => setCategory("All")} className="hover:text-white/80 ml-0.5 cursor-pointer">
                      <X size={11} />
                    </button>
                  </span>
                )}

                {transmission !== "All" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#212121] text-white shadow-xs">
                    {transmission}
                    <button type="button" onClick={() => setTransmission("All")} className="hover:text-white/80 ml-0.5 cursor-pointer">
                      <X size={11} />
                    </button>
                  </span>
                )}

                {fuelType !== "All" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#212121] text-white shadow-xs">
                    {fuelType}
                    <button type="button" onClick={() => setFuelType("All")} className="hover:text-white/80 ml-0.5 cursor-pointer">
                      <X size={11} />
                    </button>
                  </span>
                )}

                {location !== "Solapur Railway Station (Main Hub)" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white border border-[#DFDCE8] text-[#212121]">
                    <MapPin size={11} className="text-[#212121]" />
                    {location}
                    <button
                      type="button"
                      onClick={() => setLocation("Solapur Railway Station (Main Hub)")}
                      className="hover:text-[#212121] ml-0.5 cursor-pointer"
                    >
                      <X size={11} />
                    </button>
                  </span>
                )}

                {searchQuery.trim() && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white border border-[#DFDCE8] text-[#212121]">
                    "{searchQuery}"
                    <button type="button" onClick={() => setSearchQuery("")} className="hover:text-[#212121] ml-0.5 cursor-pointer">
                      <X size={11} />
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-[#212121] hover:underline ml-1 cursor-pointer font-mono"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Vehicle Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white border border-[#DFDCE8] rounded-[24px] overflow-hidden p-4 space-y-3 shadow-xs">
                    <Skeleton className="aspect-[16/10] w-full rounded-[18px]" />
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24 rounded-full" />
                        <Skeleton className="h-4 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-5 w-44 rounded-lg" />
                      <div className="flex items-center gap-2 pt-1">
                        <Skeleton className="h-3.5 w-14 rounded-full" />
                        <Skeleton className="h-3.5 w-14 rounded-full" />
                        <Skeleton className="h-3.5 w-14 rounded-full" />
                      </div>
                      <div className="pt-3 border-t border-[#DFDCE8] flex items-center justify-between">
                        <Skeleton className="h-6 w-20 rounded-lg" />
                        <Skeleton className="h-9 w-24 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div
                className="py-16 px-4 text-center bg-white rounded-[24px] border border-[#DFDCE8] shadow-sm"
                data-testid="no-vehicles"
              >
                <div className="w-12 h-12 rounded-full bg-[#e1b808] flex items-center justify-center text-[#212121] mx-auto mb-3">
                  <Car size={22} />
                </div>
                <h3 className="text-base font-bold text-[#212121] mb-1 font-display">
                  No vehicles match your filters
                </h3>
                <p className="text-xs text-[#6F6E73] max-w-sm mx-auto mb-5 font-normal">
                  Try clearing some filter criteria, selecting different dates, or choosing another category.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#212121] hover:bg-[#141414] text-white text-xs font-medium uppercase tracking-wider transition-all cursor-pointer active:scale-96 shadow-sm"
                >
                  <RotateCcw size={13} />
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5" data-testid="fleet-grid">
                {filteredVehicles.map((v, i) => (
                  <div key={v._id || v.id || i} className="animate-fadeUp" style={{ animationDelay: `${i * 35}ms` }}>
                    <VehicleCard v={v} index={i} queryParams={cardQueryParams} />
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </section>

      {/* ── Mobile Filter Sheet / Slide-Over Drawer ── */}
      <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
        <SheetContent
          side="left"
          className="w-full sm:max-w-sm p-0 bg-white border-r border-[#DFDCE8] overflow-y-auto z-50 text-[#212121]"
        >
          <SheetHeader className="p-4 border-b border-[#DFDCE8] bg-white sticky top-0 z-20 flex flex-row items-center justify-between">
            <SheetTitle className="text-sm font-bold uppercase tracking-wider text-[#212121] flex items-center gap-2 font-mono">
              <SlidersHorizontal size={14} className="text-[#212121]" />
              Filter Fleet
            </SheetTitle>
          </SheetHeader>

          <div className="p-4">
            <FleetFilterSidebar
              pickup={pickup}
              drop={drop}
              onPickupChange={setPickup}
              onDropChange={setDrop}
              onOneDayExpress={handleOneDayExpress}
              location={location}
              onLocationChange={setLocation}
              category={category}
              onCategoryChange={setCategory}
              transmission={transmission}
              onTransmissionChange={setTransmission}
              fuelType={fuelType}
              onFuelTypeChange={setFuelType}
              categories={CATEGORIES}
              transmissions={TRANSMISSIONS}
              fuelTypes={FUEL_TYPES}
              categoryCounts={categoryCounts}
              totalCount={vehicles.length}
              onReset={handleResetFilters}
              hasActiveFilters={hasActiveFilters}
              activeFilterCount={activeFilterCount}
              variant="mobile"
              onApplyMobile={() => setMobileDrawerOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Footer />
    </div>
  );
}
