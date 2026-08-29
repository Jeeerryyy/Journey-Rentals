/* Brex / Urbanist Design System — Exact DriveHub Goa Parity */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import SEO from "../components/seo/SEO";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { Calendar } from "@/ui/calendar";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Checkbox } from "@/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { format, addDays } from "date-fns";
import {
  Calendar as CalIcon, MapPin, User, Phone, Mail,
  Check, ArrowRight, ArrowLeft, Loader2, ShieldCheck, Fuel, Cog, Users, Clock,
  UploadCloud, FileText, Image, ChevronRight, ChevronLeft, Sparkles, X, Shield, Lock, Bike, Car,
  Ticket, Tag, Percent
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import CustomSelect from "../components/CustomSelect";
import api, { formatApiError, formatINR, getOptimizedImageUrl, safeFormatDate } from "@/lib/api";
import { loadRazorpayScript } from "@/lib/razorpay";

const STEPS = ["Dates & Add-ons", "Your Details & KYC", "Review & Payment"];
const SOLAPUR_LOCATIONS = [
  "Solapur Railway Station",
  "Hotgi Road & Airport Hub",
  "Vijapur Road Hub",
  "Akkalkot Road Hub",
  "Doorstep Delivery (Solapur City)",
];

const TIME_OPTIONS = [
  { value: "06:00", label: "06:00 AM" },
  { value: "07:00", label: "07:00 AM" },
  { value: "08:00", label: "08:00 AM" },
  { value: "09:00", label: "09:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "13:00", label: "01:00 PM" },
  { value: "14:00", label: "02:00 PM" },
  { value: "15:00", label: "03:00 PM" },
  { value: "16:00", label: "04:00 PM" },
  { value: "17:00", label: "05:00 PM" },
  { value: "18:00", label: "06:00 PM" },
  { value: "19:00", label: "07:00 PM" },
  { value: "20:00", label: "08:00 PM" },
  { value: "21:00", label: "09:00 PM" },
  { value: "22:00", label: "10:00 PM" },
  { value: "23:00", label: "11:00 PM" },
];

function setTimeOnDate(dateObj, timeStr) {
  if (!dateObj) return dateObj;
  const [hours, minutes] = timeStr.split(":").map(Number);
  const newDate = new Date(dateObj);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
}

export default function BookingPage() {
  const { vehicleId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { customer, user } = useAuth();
  const activeUser = customer || user;

  const [step, setStep] = useState(0);
  const [vehicle, setVehicle] = useState(null);
  const [loadingVehicle, setLoadingVehicle] = useState(true);

  // Form State
  const [location, setLocation] = useState(params.get("location") || "");
  const [start, setStart] = useState(() => {
    const p = params.get("pickup") || params.get("start");
    if (p && !isNaN(new Date(p).getTime())) return new Date(p);
    const d = new Date();
    d.setHours(9, 0, 0, 0);
    return d;
  });
  const [end, setEnd] = useState(() => {
    const e = params.get("drop") || params.get("end");
    if (e && !isNaN(new Date(e).getTime())) return new Date(e);
    return addDays(new Date(), 2);
  });
  const [pickupTime, setPickupTime] = useState("09:00");
  const [dropoffTime, setDropoffTime] = useState("09:00");
  const [startCalendarOpen, setStartCalendarOpen] = useState(false);
  const [endCalendarOpen, setEndCalendarOpen] = useState(false);
  const [bikeSlot, setBikeSlot] = useState(params.get("slot") || "6hr");

  // Customer KYC State
  const [customerForm, setCustomerForm] = useState({
    name: activeUser?.name || "",
    email: activeUser?.email || "",
    phone: activeUser?.phone || "",
    aadhar: "",
    driving_license: "",
    aadhar_image_url: "",
    license_image_url: "",
  });

  const [aadharFileName, setAadharFileName] = useState("");
  const [licenseFileName, setLicenseFileName] = useState("");
  const [uploadingAadhar, setUploadingAadhar] = useState(false);
  const [uploadingLicense, setUploadingLicense] = useState(false);
  const [payProcessing, setPayProcessing] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Fetch Vehicle Details
  useEffect(() => {
    async function loadVehicle() {
      try {
        setLoadingVehicle(true);
        if (vehicleId) {
          try {
            const res = await api.vehicles.getById(vehicleId);
            if (res.vehicle || res.data) {
              setVehicle(res.vehicle || res.data);
              return;
            }
          } catch {}
        }
        const allRes = await api.vehicles.getAll();
        const list = allRes.vehicles || allRes.data || (Array.isArray(allRes) ? allRes : []);
        const found = list.find((v) => (v._id || v.id) === vehicleId) || list[0];
        setVehicle(found || null);
      } catch (err) {
        console.error("Failed to load vehicle:", err);
      } finally {
        setLoadingVehicle(false);
      }
    }
    loadVehicle();
  }, [vehicleId]);

  useEffect(() => {
    if (activeUser) {
      setCustomerForm((prev) => ({
        ...prev,
        name: prev.name || activeUser.name || "",
        email: prev.email || activeUser.email || "",
        phone: prev.phone || activeUser.phone || "",
      }));
    }
  }, [activeUser]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("pending_booking");
      if (saved) {
        const data = JSON.parse(saved);
        if (data.vehicleId === vehicleId) {
          if (data.customerForm) setCustomerForm((prev) => ({ ...prev, ...data.customerForm }));
          if (data.pickupTime) setPickupTime(data.pickupTime);
          if (data.dropoffTime) setDropoffTime(data.dropoffTime);
          if (data.location) setLocation(data.location);
          if (typeof data.step === "number") setStep(data.step);
          if (data.appliedCoupon) setAppliedCoupon(data.appliedCoupon);
        }
      }
    } catch {}
  }, [vehicleId]);

  const isBike = vehicle?.type === "bike";
  const title = vehicle ? (vehicle.title || `${vehicle.brand || ''} ${vehicle.model || ''}`.trim()) : "Vehicle";

  // Coupon Code State
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Duration Computation
  const durationDays = useMemo(() => {
    if (isBike) return 1;
    const ms = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }, [isBike, start, end]);

  // Price Calculation with Coupon Support
  const grossPrice = useMemo(() => {
    if (!vehicle) return 0;
    if (isBike) {
      return vehicle.bikeSlots?.[`price${bikeSlot}`] || vehicle.pricePerDay || 250;
    }
    const daily = vehicle.pricePerDay || vehicle.daily_rate || 2000;
    return daily * durationDays;
  }, [vehicle, isBike, bikeSlot, durationDays]);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === "Percentage") {
      return Math.round((grossPrice * appliedCoupon.value) / 100);
    }
    return Math.min(appliedCoupon.value, grossPrice);
  }, [appliedCoupon, grossPrice]);

  const totalPrice = Math.max(0, grossPrice - discountAmount);
  const advanceRequired = Math.min(500, totalPrice);
  const balanceDue = Math.max(0, totalPrice - advanceRequired);

  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) {
      toast.error("Please enter a promotional coupon code");
      return;
    }
    setValidatingCoupon(true);
    try {
      const res = await api.post("/api/bookings/validate-coupon", {
        code: couponCodeInput.trim(),
        totalAmount: grossPrice,
      });
      if (res.data?.success && res.data?.coupon) {
        setAppliedCoupon(res.data.coupon);
        toast.success(res.data.message || `Coupon '${res.data.coupon.code}' applied!`);
      } else {
        toast.error(res.data?.error || "Invalid coupon code");
      }
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput("");
    toast.info("Coupon code removed.");
  };

  function applyPresetDays(days) {
    const sTime = format(start, "HH:mm");
    const d = addDays(start, days);
    setEnd(setTimeOnDate(d, sTime));
  }

  // Handle Document Uploads (Base64)
  const handleUploadDoc = (file, docType) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }
    const isAadhar = docType === "aadhar";
    if (isAadhar) setUploadingAadhar(true);
    else setUploadingLicense(true);

    const reader = new FileReader();
    reader.onload = () => {
      if (isAadhar) {
        setCustomerForm((p) => ({ ...p, aadhar_image_url: reader.result }));
        setAadharFileName(file.name);
        setUploadingAadhar(false);
        toast.success("Aadhar document attached!");
      } else {
        setCustomerForm((p) => ({ ...p, license_image_url: reader.result }));
        setLicenseFileName(file.name);
        setUploadingLicense(false);
        toast.success("Driving License attached!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleNextStep1 = () => {
    if (!location || !location.trim()) {
      toast.error("Please select a Solapur Pickup Hub to continue.");
      return;
    }
    setStep(1);
  };

  const handleNextStep2 = () => {
    if (!customerForm.name.trim() || !customerForm.email.trim() || !customerForm.phone.trim()) {
      toast.error("Please fill in all primary driver contact details.");
      return;
    }
    const hasAadhar = Boolean(customerForm.aadhar?.trim() || customerForm.aadhar_image_url);
    if (!hasAadhar) {
      toast.error("Please provide either your Aadhaar Number or upload an Aadhaar document photo.");
      return;
    }
    const hasLicense = Boolean(customerForm.driving_license?.trim() || customerForm.license_image_url);
    if (!hasLicense) {
      toast.error("Please provide either your Driving License Number or upload a License document photo.");
      return;
    }
    setStep(2);
  };

  const handleFinalCheckout = async () => {
    if (!activeUser) {
      try {
        sessionStorage.setItem("pending_booking", JSON.stringify({
          vehicleId,
          customerForm,
          location,
          pickupTime,
          dropoffTime,
          start: start.toISOString(),
          end: end.toISOString(),
          appliedCoupon,
          step: 2,
        }));
      } catch {}
      toast.info("Please sign in or create an account to finalize your booking.");
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }

    if (!agreeTerms) {
      toast.error("Please accept the rental terms & conditions.");
      return;
    }

    setPayProcessing(true);
    try {
      // 1. Optional document upload
      let aadharUrl = "";
      let licenseUrl = "";
      if (customerForm.aadhar_image_url || customerForm.license_image_url) {
        try {
          const upRes = await api.upload.documents({
            aadhar: customerForm.aadhar_image_url || undefined,
            license: customerForm.license_image_url || undefined,
          });
          if (upRes.success && upRes.files) {
            aadharUrl = upRes.files.aadhar?.url || "";
            licenseUrl = upRes.files.license?.url || "";
          }
        } catch (upErr) {
          console.warn("Upload fallback:", upErr);
        }
      }

      // 2. Create Order
      const payload = {
        customerInfo: {
          name: customerForm.name,
          email: customerForm.email,
          phone: customerForm.phone,
          aadhar: customerForm.aadhar?.trim() || "",
          drivingLicense: customerForm.driving_license?.trim() || "",
        },
        vehicleId: vehicle._id || vehicle.id,
        bookingType: isBike ? "bike" : "car",
        pickupLocation: location,
        pickupDate: isBike ? null : start.toISOString(),
        pickupTime: isBike ? null : pickupTime,
        returnDate: isBike ? null : end.toISOString(),
        returnTime: isBike ? null : dropoffTime,
        totalDays: isBike ? 1 : durationDays,
        bikeDate: isBike ? start.toISOString() : null,
        bikeSlot: isBike ? bikeSlot : null,
        totalPrice,
        discount: discountAmount,
        couponApplied: appliedCoupon?.code || "",
        documents: {
          aadharNumber: customerForm.aadhar?.trim() || "",
          licenseNumber: customerForm.driving_license?.trim() || "",
          aadharUrl: aadharUrl || aadharFileName,
          licenseUrl: licenseUrl || licenseFileName,
        },
      };

      const res = await api.bookings.createOrder(payload);

      if (res.success && res.booking) {
        const booking = res.booking;
        const razorpayData = res.razorpay || {};
        const razorpayOrderId = razorpayData.orderId || booking.payment?.razorpayOrderId;

        if (razorpayOrderId) {
          const isLoaded = await loadRazorpayScript();
          if (isLoaded && window.Razorpay) {
            const keyId = razorpayData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_SVnQN5zASbc3XW";
            const options = {
              key: keyId,
              amount: razorpayData.amount || advanceRequired * 100,
              currency: razorpayData.currency || "INR",
              name: "Journey Rentals Solapur",
              description: `Advance Token for ${title} (#${booking.referenceId})`,
              image: "/favicon.png",
              order_id: razorpayOrderId,
              prefill: {
                name: customerForm.name,
                email: customerForm.email,
                contact: customerForm.phone,
              },
              notes: {
                bookingId: booking._id,
                referenceId: booking.referenceId,
                pickupLocation: pickupLocation,
              },
              theme: { color: "#212121" },
              handler: async (response) => {
                try {
                  setPayProcessing(true);
                  const verRes = await api.bookings.verifyPayment({
                    bookingId: booking._id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  });
                  if (verRes.success) {
                    toast.success("Payment verified! Booking confirmed.");
                    navigate(`/booking-success/${booking._id || booking.referenceId}`);
                  } else {
                    toast.error(verRes.error || "Payment verification failed.");
                    navigate(`/booking-success/${booking._id || booking.referenceId}`);
                  }
                } catch (verErr) {
                  toast.error("Payment verification encountered an issue. Support is reviewing.");
                  navigate(`/booking-success/${booking._id || booking.referenceId}`);
                } finally {
                  setPayProcessing(false);
                }
              },
              modal: {
                ondismiss: () => {
                  toast.info("Payment window dismissed. Your reservation is pending.");
                  navigate(`/booking-success/${booking._id || booking.referenceId}`);
                },
              },
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", function (response) {
              console.error("Razorpay payment failure:", response.error);
              toast.error(response.error?.description || "Payment was declined.");
            });
            rzp.open();
            return;
          }
        }

        // Direct confirmation or Razorpay fallback
        toast.success("Booking placed successfully!");
        navigate(`/booking-success/${booking._id || booking.referenceId}`);
      } else {
        throw new Error(res.error || "Failed to create reservation order");
      }
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setPayProcessing(false);
    }
  };

  if (loadingVehicle) {
    return (
      <div className="min-h-screen bg-[#F6F5FA] text-[#212121] font-body no-scroll-x">
        <Navbar />
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-10 sm:pb-16 space-y-8">
          {/* Stepper Skeleton */}
          <div className="flex items-center gap-3 max-w-xl">
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-0.5 flex-1" />
            <Skeleton className="h-8 w-32 rounded-full" />
            <Skeleton className="h-0.5 flex-1" />
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Left Form Area Skeleton */}
            <div className="lg:col-span-2 bg-white border border-[#DFDCE8] rounded-[24px] p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-48 rounded-xl" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
              <Skeleton className="h-16 w-full rounded-2xl" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-36 rounded-full" />
                <Skeleton className="h-12 w-full rounded-2xl" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28 rounded-full" />
                  <Skeleton className="h-12 w-full rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28 rounded-full" />
                  <Skeleton className="h-12 w-full rounded-2xl" />
                </div>
              </div>
            </div>

            {/* Right Summary Card Skeleton */}
            <div className="bg-white border border-[#DFDCE8] rounded-[24px] p-6 space-y-5 shadow-xs h-fit">
              <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
              <Skeleton className="h-6 w-3/4 rounded-lg" />
              <div className="space-y-3 pt-3 border-t border-[#DFDCE8]">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20 rounded-full" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24 rounded-full" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
                <div className="flex justify-between pt-2 border-t border-[#DFDCE8]">
                  <Skeleton className="h-6 w-28 rounded-lg" />
                  <Skeleton className="h-6 w-24 rounded-lg" />
                </div>
              </div>
              <Skeleton className="h-12 w-full rounded-full" />
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-[#F6F5FA] text-[#212121] font-body no-scroll-x">
        <Navbar />
        <div className="max-w-md mx-auto pt-36 pb-20 px-4 text-center space-y-4">
          <Car size={48} className="mx-auto text-[#99989E]" />
          <h2 className="text-xl font-bold">Vehicle Not Found</h2>
          <p className="text-xs text-[#6F6E73]">The requested vehicle could not be loaded from our Solapur fleet.</p>
          <Link to="/fleet" className="inline-block px-6 py-2.5 rounded-full bg-[#212121] text-white text-xs font-bold uppercase">
            Browse All Fleet
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F5FA] text-[#212121] font-body no-scroll-x">
      <SEO
        title={`Book ${title} in Solapur — Instant Confirmation | Journey Rentals`}
        description={`Reserve your ${title} with Journey Rentals Solapur. Daily rate: ₹${vehicle?.pricePerDay || "2000"}/day. Free railway station delivery.`}
        canonical={`/booking/${vehicleId}`}
      />
      <Navbar />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-10 sm:pb-16">
        {/* Step indicator */}
        <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 font-mono" data-testid="booking-steps">
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <div className={`flex items-center gap-1.5 sm:gap-2 ${i <= step ? "text-[#212121]" : "text-[#99989E]"}`}>
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  i < step ? "bg-[#CFDECA] text-[#4B8039]"
                  : i === step ? "bg-[#212121] text-white shadow-xs"
                  : "bg-[#F6F5FA] border border-[#DFDCE8] text-[#99989E]"
                }`}>
                  {i < step ? <Check size={13}/> : i + 1}
                </div>
                <span className="hidden sm:block text-[11px] sm:text-xs uppercase tracking-wider font-bold">{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? "bg-[#212121]" : "bg-[#DFDCE8]"}`}/>}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left form area */}
          <div className="lg:col-span-2 bg-white border border-[#DFDCE8] rounded-[24px] p-5 sm:p-7 md:p-8 shadow-sm text-left">
            {step === 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#212121]">Dates &amp; Hubs</h2>
                  <div className="text-xs font-mono font-bold text-[#212121] bg-[#e1b808] px-3.5 py-1 rounded-full border border-[#e1b808]">
                    {isBike ? `Bike Slot (${bikeSlot})` : `${durationDays} ${durationDays === 1 ? "Day Rental (24h)" : `Days Rental (${durationDays * 24}h)`}`}
                  </div>
                </div>

                {/* Duration Presets */}
                {!isBike && (
                  <div className="mb-6 p-4 rounded-[16px] bg-[#F6F5FA] border border-[#DFDCE8]">
                    <div className="flex items-center justify-between mb-2.5">
                      <Label className="text-xs font-bold text-[#212121] flex items-center gap-1.5">
                        <Clock size={14} className="text-[#212121]" /> Select Trip Duration:
                      </Label>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {[
                        { label: "1 Day (24h)", days: 1 },
                        { label: "2 Days (48h)", days: 2 },
                        { label: "3 Days (72h)", days: 3 },
                      ].map((preset) => (
                        <button
                          key={preset.days}
                          type="button"
                          onClick={() => applyPresetDays(preset.days)}
                          className={`py-2 px-3 rounded-full text-xs font-mono font-bold transition-all border ${
                            durationDays === preset.days
                              ? "bg-[#212121] text-white border-[#212121] shadow-2xs"
                              : "bg-white text-[#212121] border-[#DFDCE8] hover:border-[#212121]"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location Selector */}
                <div className="space-y-4 mb-6">
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-wider text-[#6F6E73] mb-2 block font-mono">
                      Pickup Hub (Solapur) <span className="text-[#E03131]">*</span>
                    </Label>
                    <Select value={location || undefined} onValueChange={setLocation}>
                      <SelectTrigger className="w-full h-12 rounded-xl border-[#DFDCE8] bg-[#F6F5FA] text-xs font-medium">
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

                  {/* Date & Time Selection Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* 1. Start / Pickup Date & Time */}
                    <div className="p-4 rounded-[20px] bg-[#F6F5FA] border border-[#DFDCE8] space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold uppercase tracking-wider text-[#6F6E73] font-mono flex items-center gap-1.5">
                          <CalIcon size={14} className="text-[#3F5F8C]" />
                          Pickup Date &amp; Time
                        </Label>
                        <span className="text-[10px] font-bold text-[#4B8039] bg-[#CFDECA] px-2 py-0.5 rounded-full">
                          Handover
                        </span>
                      </div>

                      {/* Date Popover */}
                      <Popover open={startCalendarOpen} onOpenChange={setStartCalendarOpen}>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="w-full h-12 px-3.5 rounded-xl bg-white border border-[#DFDCE8] hover:border-[#212121] text-xs font-bold text-[#212121] flex items-center justify-between gap-2 text-left cursor-pointer transition-all shadow-2xs"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <CalIcon size={15} className="text-[#212121]" />
                              <span>{format(start, "EEE, dd MMM yyyy")}</span>
                            </div>
                            <span className="text-[10px] text-[#6F6E73] font-mono uppercase bg-[#F6F5FA] px-2 py-0.5 rounded-full">
                              {format(start, "EEE")}
                            </span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-3 bg-white rounded-2xl border-[#DFDCE8] shadow-2xl z-60" align="start">
                          <Calendar
                            mode="single"
                            selected={start}
                            onSelect={(d) => {
                              if (d) {
                                const updated = setTimeOnDate(d, pickupTime);
                                setStart(updated);
                                if (updated > end) {
                                  setEnd(addDays(updated, 1));
                                }
                                setStartCalendarOpen(false);
                              }
                            }}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>

                      {/* Time Select */}
                      <div>
                        <Select
                          value={pickupTime}
                          onValueChange={(val) => {
                            setPickupTime(val);
                            setStart(setTimeOnDate(start, val));
                          }}
                        >
                          <SelectTrigger className="w-full h-11 rounded-xl bg-white border-[#DFDCE8] text-xs font-semibold text-[#212121]">
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-[#6F6E73]" />
                              <SelectValue placeholder="Select Pickup Time" />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="bg-white rounded-2xl border-[#DFDCE8] shadow-2xl max-h-56">
                            {TIME_OPTIONS.map((t) => (
                              <SelectItem key={t.value} value={t.value} className="text-xs font-semibold cursor-pointer">
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* 2. Return / Dropoff Date & Time OR Bike Slot */}
                    {!isBike ? (
                      <div className="p-4 rounded-[20px] bg-[#F6F5FA] border border-[#DFDCE8] space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-bold uppercase tracking-wider text-[#6F6E73] font-mono flex items-center gap-1.5">
                            <CalIcon size={14} className="text-[#3F5F8C]" />
                            Return Date &amp; Time
                          </Label>
                          <span className="text-[10px] font-bold text-[#3F5F8C] bg-[#D8DFE9] px-2 py-0.5 rounded-full">
                            Return
                          </span>
                        </div>

                        {/* Date Popover */}
                        <Popover open={endCalendarOpen} onOpenChange={setEndCalendarOpen}>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="w-full h-12 px-3.5 rounded-xl bg-white border border-[#DFDCE8] hover:border-[#212121] text-xs font-bold text-[#212121] flex items-center justify-between gap-2 text-left cursor-pointer transition-all shadow-2xs"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <CalIcon size={15} className="text-[#212121]" />
                                <span>{format(end, "EEE, dd MMM yyyy")}</span>
                              </div>
                              <span className="text-[10px] text-[#6F6E73] font-mono uppercase bg-[#F6F5FA] px-2 py-0.5 rounded-full">
                                {format(end, "EEE")}
                              </span>
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-3 bg-white rounded-2xl border-[#DFDCE8] shadow-2xl z-60" align="start">
                            <Calendar
                              mode="single"
                              selected={end}
                              onSelect={(d) => {
                                if (d) {
                                  setEnd(setTimeOnDate(d, dropoffTime));
                                  setEndCalendarOpen(false);
                                }
                              }}
                              disabled={(date) => date < start}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>

                        {/* Time Select */}
                        <div>
                          <Select
                            value={dropoffTime}
                            onValueChange={(val) => {
                              setDropoffTime(val);
                              setEnd(setTimeOnDate(end, val));
                            }}
                          >
                            <SelectTrigger className="w-full h-11 rounded-xl bg-white border-[#DFDCE8] text-xs font-semibold text-[#212121]">
                              <div className="flex items-center gap-2">
                                <Clock size={14} className="text-[#6F6E73]" />
                                <SelectValue placeholder="Select Return Time" />
                              </div>
                            </SelectTrigger>
                            <SelectContent className="bg-white rounded-2xl border-[#DFDCE8] shadow-2xl max-h-56">
                              {TIME_OPTIONS.map((t) => (
                                <SelectItem key={t.value} value={t.value} className="text-xs font-semibold cursor-pointer">
                                  {t.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-[20px] bg-[#F6F5FA] border border-[#DFDCE8] space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-bold uppercase tracking-wider text-[#6F6E73] font-mono flex items-center gap-1.5">
                            <Clock size={14} className="text-[#3F5F8C]" />
                            Select Hourly Slot
                          </Label>
                          <span className="text-[10px] font-bold text-[#212121] bg-[#e1b808] px-2 py-0.5 rounded-full">
                            Quick Ride
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: "3hr", label: "3 Hours", price: vehicle.bikeSlots?.price3hr || 150 },
                            { id: "6hr", label: "6 Hours", price: vehicle.bikeSlots?.price6hr || 250 },
                            { id: "12hr", label: "12 Hours", price: vehicle.bikeSlots?.price12hr || 450 },
                          ].map((slot) => (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => setBikeSlot(slot.id)}
                              className={`p-2.5 rounded-xl text-center transition-all cursor-pointer border ${
                                bikeSlot === slot.id
                                  ? "bg-[#212121] text-white border-[#212121] shadow-xs"
                                  : "bg-white text-[#212121] border-[#DFDCE8] hover:border-[#212121]"
                              }`}
                            >
                              <div className="font-bold text-xs">{slot.label}</div>
                              <div className={`text-[11px] font-mono mt-0.5 ${bikeSlot === slot.id ? "text-[#e1b808]" : "text-[#6F6E73]"}`}>
                                {formatINR(slot.price)}
                              </div>
                            </button>
                          ))}
                        </div>

                        {/* Bike Start Time */}
                        <div className="pt-1">
                          <Select
                            value={pickupTime}
                            onValueChange={(val) => {
                              setPickupTime(val);
                              setStart(setTimeOnDate(start, val));
                            }}
                          >
                            <SelectTrigger className="w-full h-11 rounded-xl bg-white border-[#DFDCE8] text-xs font-semibold text-[#212121]">
                              <div className="flex items-center gap-2">
                                <Clock size={14} className="text-[#6F6E73]" />
                                <SelectValue placeholder="Slot Start Time" />
                              </div>
                            </SelectTrigger>
                            <SelectContent className="bg-white rounded-2xl border-[#DFDCE8] shadow-2xl max-h-56">
                              {TIME_OPTIONS.map((t) => (
                                <SelectItem key={t.value} value={t.value} className="text-xs font-semibold cursor-pointer">
                                  {t.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#DFDCE8]">
                  <Button
                    onClick={handleNextStep1}
                    className="w-full bg-[#212121] hover:bg-[#141414] text-white font-medium text-xs uppercase tracking-wider h-12 rounded-full flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <span>Proceed to Driver Details</span>
                    <ArrowRight size={14} />
                  </Button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#212121]">Primary Driver &amp; KYC</h2>
                  <p className="text-xs text-[#6F6E73] mt-1">
                    Enter driver contact information and attach verification documents for zero deposit handover.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-bold text-[#6F6E73] mb-1.5 block">Full Legal Name</Label>
                    <Input
                      value={customerForm.name}
                      onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                      placeholder="Enter full legal name (as on ID)"
                      className="h-11 rounded-xl bg-[#F6F5FA] border-[#DFDCE8] text-xs font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-bold text-[#6F6E73] mb-1.5 block">Email Address</Label>
                      <Input
                        type="email"
                        value={customerForm.email}
                        onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                        placeholder="Enter email address"
                        className="h-11 rounded-xl bg-[#F6F5FA] border-[#DFDCE8] text-xs font-medium"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-[#6F6E73] mb-1.5 block">Phone Number</Label>
                      <Input
                        type="tel"
                        value={customerForm.phone}
                        onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                        placeholder="Enter 10-digit mobile number"
                        className="h-11 rounded-xl bg-[#F6F5FA] border-[#DFDCE8] text-xs font-medium"
                      />
                    </div>
                  </div>

                  {/* KYC Verification Cards */}
                  <div className="pt-3 border-t border-[#DFDCE8] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#212121] uppercase font-mono">
                        <ShieldCheck size={16} className="text-[#4B8039]" />
                        <span>Identity &amp; Driver KYC Verification</span>
                      </div>
                      <span className="text-[10px] text-[#6F6E73] font-medium hidden sm:inline-block">
                        Provide either document number OR upload a photo for each
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* 1. Aadhaar Verification Card */}
                      <div className={`p-4 sm:p-5 rounded-[20px] border space-y-3 transition-all ${
                        customerForm.aadhar?.trim() || customerForm.aadhar_image_url
                          ? "bg-white border-[#212121]/30 ring-1 ring-[#212121]/10 shadow-xs"
                          : "bg-[#F6F5FA] border-[#DFDCE8]"
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#212121] flex items-center gap-1.5">
                            <span>Aadhaar Card / Govt ID</span>
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            customerForm.aadhar?.trim() || customerForm.aadhar_image_url
                              ? "bg-[#CFDECA] text-[#4B8039]"
                              : "bg-[#DFDCE8] text-[#6F6E73]"
                          }`}>
                            {customerForm.aadhar?.trim() || customerForm.aadhar_image_url ? "Provided ✓" : "Required"}
                          </span>
                        </div>

                        {/* Aadhaar Number Input */}
                        <div>
                          <Label className="text-[11px] font-semibold text-[#6F6E73] mb-1 block">
                            Aadhaar Number <span className="font-normal text-[#99989E]">(Optional if photo uploaded)</span>
                          </Label>
                          <Input
                            type="text"
                            value={customerForm.aadhar}
                            onChange={(e) => setCustomerForm({ ...customerForm, aadhar: e.target.value })}
                            placeholder="Enter 12-digit Aadhaar Number"
                            className="h-10 rounded-xl bg-white border-[#DFDCE8] text-xs font-medium"
                          />
                        </div>

                        <div className="relative flex items-center justify-center py-0.5">
                          <div className="border-t border-[#DFDCE8] w-full" />
                          <span className="bg-[#F6F5FA] px-2 text-[10px] text-[#99989E] font-bold uppercase tracking-wider absolute">
                            OR Upload Document
                          </span>
                        </div>

                        {/* Aadhaar Upload Button */}
                        <div>
                          <label className={`block w-full py-2.5 px-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                            customerForm.aadhar_image_url
                              ? "border-[#4B8039] bg-[#CFDECA]/40 text-[#4B8039]"
                              : "border-dashed border-[#212121] bg-white hover:bg-[#F6F5FA] text-[#212121]"
                          }`}>
                            <span>
                              {uploadingAadhar
                                ? "Attaching Aadhaar..."
                                : aadharFileName
                                ? `✓ ${aadharFileName.length > 20 ? aadharFileName.slice(0, 18) + '...' : aadharFileName}`
                                : "Upload Aadhaar Photo / PDF"}
                            </span>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => handleUploadDoc(e.target.files?.[0], "aadhar")}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* 2. Driving License Verification Card */}
                      <div className={`p-4 sm:p-5 rounded-[20px] border space-y-3 transition-all ${
                        customerForm.driving_license?.trim() || customerForm.license_image_url
                          ? "bg-white border-[#212121]/30 ring-1 ring-[#212121]/10 shadow-xs"
                          : "bg-[#F6F5FA] border-[#DFDCE8]"
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#212121] flex items-center gap-1.5">
                            <span>Driving License</span>
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            customerForm.driving_license?.trim() || customerForm.license_image_url
                              ? "bg-[#CFDECA] text-[#4B8039]"
                              : "bg-[#DFDCE8] text-[#6F6E73]"
                          }`}>
                            {customerForm.driving_license?.trim() || customerForm.license_image_url ? "Provided ✓" : "Required"}
                          </span>
                        </div>

                        {/* License Number Input */}
                        <div>
                          <Label className="text-[11px] font-semibold text-[#6F6E73] mb-1 block">
                            License Number <span className="font-normal text-[#99989E]">(Optional if photo uploaded)</span>
                          </Label>
                          <Input
                            type="text"
                            value={customerForm.driving_license}
                            onChange={(e) => setCustomerForm({ ...customerForm, driving_license: e.target.value })}
                            placeholder="Enter Driving License Number"
                            className="h-10 rounded-xl bg-white border-[#DFDCE8] text-xs font-medium uppercase"
                          />
                        </div>

                        <div className="relative flex items-center justify-center py-0.5">
                          <div className="border-t border-[#DFDCE8] w-full" />
                          <span className="bg-[#F6F5FA] px-2 text-[10px] text-[#99989E] font-bold uppercase tracking-wider absolute">
                            OR Upload Document
                          </span>
                        </div>

                        {/* License Upload Button */}
                        <div>
                          <label className={`block w-full py-2.5 px-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                            customerForm.license_image_url
                              ? "border-[#4B8039] bg-[#CFDECA]/40 text-[#4B8039]"
                              : "border-dashed border-[#212121] bg-white hover:bg-[#F6F5FA] text-[#212121]"
                          }`}>
                            <span>
                              {uploadingLicense
                                ? "Attaching License..."
                                : licenseFileName
                                ? `✓ ${licenseFileName.length > 20 ? licenseFileName.slice(0, 18) + '...' : licenseFileName}`
                                : "Upload License Photo / PDF"}
                            </span>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => handleUploadDoc(e.target.files?.[0], "license")}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#DFDCE8] flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(0)}
                    className="px-6 rounded-full border border-[#DFDCE8] h-12"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNextStep2}
                    className="flex-1 bg-[#212121] hover:bg-[#141414] text-white font-medium text-xs uppercase tracking-wider h-12 rounded-full flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <span>Proceed to Review</span>
                    <ArrowRight size={14} />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#212121]">Review &amp; Lock Vehicle</h2>
                  <p className="text-xs text-[#6F6E73] mt-1">
                    Pay nominal ₹500 advance online to lock this vehicle. Balance is payable at handover.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#F6F5FA] border border-[#DFDCE8] space-y-3 text-xs">
                  <div className="flex justify-between border-b border-[#DFDCE8] pb-2">
                    <span className="text-[#6F6E73]">Primary Driver</span>
                    <span className="font-bold text-[#212121]">{customerForm.name} ({customerForm.phone})</span>
                  </div>
                  <div className="flex justify-between border-b border-[#DFDCE8] pb-2">
                    <span className="text-[#6F6E73]">Pickup Location</span>
                    <span className="font-bold text-[#212121]">{location}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#DFDCE8] pb-2">
                    <span className="text-[#6F6E73]">Schedule</span>
                    <span className="font-bold text-[#212121]">
                      {isBike ? `${format(start, "dd MMM yyyy")} (${bikeSlot})` : `${format(start, "dd MMM")} – ${format(end, "dd MMM yyyy")} (${durationDays}d)`}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#DFDCE8] pb-2">
                    <span className="text-[#6F6E73]">Standard Fare</span>
                    <span className="font-bold text-[#212121] font-mono">{formatINR(grossPrice)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between border-b border-[#DFDCE8] pb-2 text-[#4B8039]">
                      <span className="font-bold flex items-center gap-1">
                        <Tag size={12} /> Coupon ({appliedCoupon?.code})
                      </span>
                      <span className="font-bold font-mono">-{formatINR(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-[#212121] pt-0.5">
                    <span>Advance Payable Online</span>
                    <span className="font-mono text-[#4B8039]">{formatINR(advanceRequired)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Checkbox id="terms" checked={agreeTerms} onCheckedChange={setAgreeTerms} />
                  <label htmlFor="terms" className="text-xs text-[#6F6E73] cursor-pointer">
                    I agree to Journey Rentals Solapur <span className="text-[#212121] font-bold">Rental Terms &amp; Policies</span>.
                  </label>
                </div>

                <div className="pt-4 border-t border-[#DFDCE8] flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    disabled={payProcessing}
                    className="px-6 rounded-full border border-[#DFDCE8] h-12"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleFinalCheckout}
                    disabled={payProcessing}
                    className="flex-1 bg-[#212121] hover:bg-[#141414] text-white font-medium text-xs uppercase tracking-wider h-12 rounded-full flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    {payProcessing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Processing Order...</span>
                      </>
                    ) : !activeUser ? (
                      <>
                        <Lock size={14} className="text-[#e1b808]" />
                        <span>Sign In to Pay {formatINR(advanceRequired)} &amp; Confirm</span>
                      </>
                    ) : (
                      <>
                        <Lock size={14} className="text-[#e1b808]" />
                        <span>Pay {formatINR(advanceRequired)} Advance &amp; Confirm</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right Quote Summary Sidebar */}
          <div className="bg-white border border-[#DFDCE8] rounded-[24px] p-5 sm:p-7 shadow-sm text-left h-fit sticky top-24 space-y-4">
            <div className="aspect-[16/10] bg-[#F6F5FA] rounded-2xl overflow-hidden border border-[#DFDCE8]">
              <img
                src={getOptimizedImageUrl(vehicle.image || vehicle.images?.[0])}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F6F5FA] border border-[#DFDCE8] text-[#212121] mb-1 font-mono">
                {vehicle.category || (isBike ? "Bike" : "Car")}
              </span>
              <h3 className="text-lg font-bold text-[#212121]">{title}</h3>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#6F6E73] py-2 border-y border-[#DFDCE8]">
              <span className="flex items-center gap-1.5"><Fuel size={13} className="text-[#212121]" />{vehicle.fuelType || 'Petrol'}</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Cog size={13} className="text-[#212121]" />{vehicle.transmission || 'Manual'}</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Users size={13} className="text-[#212121]" />{vehicle.sittingCapacity || (isBike ? 2 : 5)} seats</span>
            </div>

            {/* Promo Coupon Input */}
            <div className="p-3.5 rounded-2xl bg-[#F6F5FA] border border-[#DFDCE8] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#212121] flex items-center gap-1.5">
                  <Ticket size={14} className="text-[#82C4B7]" />
                  <span>Have a Promo Coupon?</span>
                </span>
                {appliedCoupon && (
                  <span className="text-[10px] font-bold text-[#4B8039] bg-[#CFDECA] px-2 py-0.5 rounded-full">
                    Applied ✓
                  </span>
                )}
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-white border border-[#4B8039]/40 p-2.5 rounded-xl">
                  <div>
                    <div className="font-mono font-bold text-xs text-[#4B8039] flex items-center gap-1">
                      <Tag size={12} /> {appliedCoupon.code}
                    </div>
                    <div className="text-[10px] text-[#6F6E73]">
                      {appliedCoupon.type === "Percentage" ? `${appliedCoupon.value}% OFF` : `₹${appliedCoupon.value} OFF`} applied (-{formatINR(discountAmount)})
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-[11px] text-[#E8826B] hover:text-[#c8563c] font-bold px-2 py-1 hover:bg-[#E8826B]/10 rounded-lg transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-1.5">
                    <Input
                      type="text"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyCoupon();
                        }
                      }}
                      placeholder="Enter promo code"
                      className="h-9 rounded-xl bg-white border-[#DFDCE8] text-xs font-mono font-bold uppercase tracking-wider"
                    />
                    <Button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={validatingCoupon || !couponCodeInput.trim()}
                      className="h-9 px-3.5 rounded-xl bg-[#212121] hover:bg-[#141414] text-white text-xs font-bold shrink-0 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {validatingCoupon ? <Loader2 size={13} className="animate-spin" /> : "Apply"}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Price breakdown */}
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex justify-between text-[#6F6E73]">
                <span>Standard Rental Fare</span>
                <span className="font-bold text-[#212121] font-mono">{formatINR(grossPrice)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[#4B8039] font-bold">
                  <span className="flex items-center gap-1">
                    <Tag size={12} /> Coupon ({appliedCoupon?.code})
                  </span>
                  <span className="font-mono">-{formatINR(discountAmount)}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-[#212121] font-bold">
                  <span>Net Total Fare</span>
                  <span className="font-mono">{formatINR(totalPrice)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#4B8039] font-bold">
                <span>Advance Payable Now</span>
                <span className="font-mono">{formatINR(advanceRequired)}</span>
              </div>
              <div className="flex justify-between text-[#6F6E73] border-t border-[#DFDCE8] pt-2">
                <span>Balance at Pickup</span>
                <span className="font-bold text-[#212121] font-mono">{formatINR(balanceDue)}</span>
              </div>
            </div>

            {/* Zero deposit guarantee */}
            <div className="p-3.5 rounded-2xl bg-[#CFDECA]/40 border border-[#CFDECA] text-xs text-[#212121] space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-[#4B8039]">
                <Shield size={14} /> 100% Verified Handover
              </div>
              <p className="text-[11px] text-[#6F6E73]">
                Sanitized vehicle with verified all-Maharashtra permits delivered to your chosen Solapur hub.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
