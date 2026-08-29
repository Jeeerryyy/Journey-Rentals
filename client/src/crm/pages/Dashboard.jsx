/* Brex / Urbanist Design System — Journey Rentals Solapur Executive CRM */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import api, { formatINR, formatApiError, safeFormatDate } from "@/lib/api";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell
} from "recharts";
import {
  TrendingUp, ClipboardList, Car, Bike, ArrowUpRight, Plus,
  MessageSquarePlus, MapPin, Search, Trash2, Sparkles, Filter,
  ArrowRight, ShieldAlert, Zap, Layers, CheckCircle2, ChevronDown,
  FileText, Loader2, Download, MessageCircle, Eye, ExternalLink, ShieldCheck, Clock, Phone
} from "lucide-react";
import { Button } from "@/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/dialog";
import OfflineBookingModal from "../components/OfflineBookingModal";
import EnquiryModal from "../components/EnquiryModal";
import ConfirmModal from "../components/common/ConfirmModal";
import NotesModal from "../components/common/NotesModal";
import CustomSelect from "@/website/components/CustomSelect";
import { Skeleton } from "@/ui/skeleton";

// ─── 3D Interactive Character Banner ──────────────────────────────────────────
function Live3DCharacterGesture() {
  const containerRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [currentPose, setCurrentPose] = useState("waving");
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    if (isHovered || isClicked) return;
    const interval = setInterval(() => {
      setCurrentPose((prev) => {
        if (prev === "waving") return "highfive";
        if (prev === "highfive") return "thumbsup";
        return "waving";
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovered, isClicked]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setRotate({ x: -dy * 14, y: dx * 18 });
  };

  const handleMouseEnter = () => { setIsHovered(true); setCurrentPose("highfive"); };
  const handleMouseLeave = () => { setIsHovered(false); setRotate({ x: 0, y: 0 }); setCurrentPose("waving"); };
  const handleCharacterClick = () => {
    setIsClicked(true);
    setCurrentPose("thumbsup");
    setTimeout(() => {
      setIsClicked(false);
      if (!isHovered) setCurrentPose("waving");
      else setCurrentPose("highfive");
    }, 1000);
  };

  const getPoseImg = () => {
    if (currentPose === "highfive") return "/3d-character-highfive.png";
    if (currentPose === "thumbsup") return "/3d-character-thumbsup.png";
    return "/3d-character-saiesh.png";
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCharacterClick}
      className="relative z-10 flex items-center justify-center shrink-0 cursor-pointer select-none h-40 w-36 sm:h-52 sm:w-48 md:h-60 md:w-52"
    >
      {/* Ambient neon aura */}
      <div className="absolute w-36 h-36 sm:w-48 sm:h-48 bg-[#e1b808]/25 rounded-full blur-3xl pointer-events-none" />

      <div
        style={{
          transform: `perspective(900px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale(${isClicked ? 1.12 : isHovered ? 1.06 : 1})`,
          willChange: "transform",
          transition: "transform 0.25s ease-out",
        }}
      >
        <img
          key={currentPose}
          src={getPoseImg()}
          alt="3D Interactive Character"
          className="h-36 sm:h-52 md:h-60 object-contain drop-shadow-2xl transition-all duration-200"
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [offlineModalOpen, setOfflineModalOpen] = useState(false);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);

  const [enquiriesData, setEnquiriesData] = useState({ items: [], city_analytics: [], total_enquiries: 0 });
  const [enqQuery, setEnqQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [enqLoading, setEnqLoading] = useState(false);

  // Live Bookings & KYC state
  const [liveBookings, setLiveBookings] = useState([]);
  const [selectedKycBooking, setSelectedKycBooking] = useState(null);
  const [bksQuery, setBksQuery] = useState("");
  const [bksStatusFilter, setBksStatusFilter] = useState("all");

  // In-app delete confirm state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // In-app notes view state
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState({ text: "", title: "", subtitle: "" });
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Generate and download executive Bookings Abstract PDF
  const handleExportPdfAbstract = async () => {
    try {
      setIsExportingPdf(true);
      toast.info("Generating Journey Rentals Bookings Abstract PDF...", { duration: 3000 });

      // Fetch live bookings and fleet for export from MongoDB
      const [bksRes, vehsRes] = await Promise.allSettled([
        api.get("/api/admin/bookings").then((r) => r.data?.bookings || r.data || []),
        api.get("/api/admin/fleet").then((r) => r.data?.vehicles || r.data || []),
      ]);

      const bookingsList =
        bksRes.status === "fulfilled" && Array.isArray(bksRes.value) && bksRes.value.length > 0
          ? bksRes.value
          : (data?.recent_bookings || []);

      const vehiclesList =
        vehsRes.status === "fulfilled" && Array.isArray(vehsRes.value) && vehsRes.value.length > 0
          ? vehsRes.value
          : [];

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Please allow popups to export the PDF abstract.");
        setIsExportingPdf(false);
        return;
      }

      const confirmedList = bookingsList.filter((b) => b.status === "confirmed" || b.status === "completed");
      const totalRevenueSum = confirmedList.reduce((acc, b) => acc + (b.totalPrice || 0), 0);
      const totalAdvanceSum = confirmedList.reduce((acc, b) => acc + (b.advancePaid != null ? b.advancePaid : (b.totalPrice || 0)), 0);
      const todayStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

      const totalVehiclesCount = vehiclesList.length || (data?.total_vehicles || 21);
      const availableVehiclesCount = vehiclesList.filter((v) => v.isAvailable !== false).length || totalVehiclesCount;
      const bookedVehiclesCount = totalVehiclesCount - availableVehiclesCount;
      const occupancyPct = totalVehiclesCount > 0 ? Math.round((bookedVehiclesCount / totalVehiclesCount) * 100) : 0;

      const tableRows = bookingsList.map((b, idx) => {
        const ref = b.referenceId || `JR-${1000 + idx}`;
        const custName = b.userSnapshot?.name || b.customerName || "Customer";
        const custPhone = b.userSnapshot?.phone || b.customerPhone || "";
        const vehName = b.vehicleSnapshot
          ? `${b.vehicleSnapshot.brand || ""} ${b.vehicleSnapshot.model || ""}`.trim()
          : (b.vehicleName || "Self-Drive Vehicle");
        const pickupLoc = b.pickupLocation || "Solapur Railway Station (Main Hub)";

        const datesStr =
          b.bookingType === "bike" || b.bikeSlot
            ? `${b.bikeDate ? new Date(b.bikeDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Direct"} (${b.bikeSlot || "Hourly"})`
            : `${b.pickupDate ? new Date(b.pickupDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "N/A"} → ${b.returnDate ? new Date(b.returnDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}`;

        const statusColor =
          b.status === "confirmed"
            ? "#4B8039"
            : b.status === "completed"
            ? "#3F5F8C"
            : b.status === "cancelled"
            ? "#9B2C2C"
            : "#6F6E73";
        const totalPrice = b.totalPrice || 0;
        const advance = b.advancePaid != null ? b.advancePaid : totalPrice;
        const balance = b.balanceDue != null ? b.balanceDue : totalPrice - advance;

        return `
          <tr style="border-bottom: 1px solid #DFDCE8; font-size: 11px;">
            <td style="padding: 10px 8px; font-weight: bold; font-family: monospace;">#${ref}</td>
            <td style="padding: 10px 8px;"><strong>${custName}</strong><br/><span style="color: #6F6E73; font-size: 10px;">${custPhone}</span></td>
            <td style="padding: 10px 8px; font-weight: 600;">${vehName}</td>
            <td style="padding: 10px 8px;">${pickupLoc}</td>
            <td style="padding: 10px 8px;">${datesStr}</td>
            <td style="padding: 10px 8px; text-transform: uppercase; font-weight: bold; color: ${statusColor};">${b.status || "Pending"}</td>
            <td style="padding: 10px 8px; text-align: right;">
              <div style="font-weight: bold; font-size: 12px;">₹${totalPrice.toLocaleString("en-IN")}</div>
              <div style="font-size: 9px; color: #4B8039;">Adv: ₹${advance.toLocaleString("en-IN")}</div>
              ${balance > 0 ? `<div style="font-size: 9px; color: #6F6E73;">Bal: ₹${balance.toLocaleString("en-IN")}</div>` : ""}
            </td>
          </tr>
        `;
      }).join("");

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Journey Rentals Solapur · Bookings Abstract</title>
          <style>
            body { font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #212121; margin: 30px; }
            .header { border-bottom: 2px solid #212121; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
            .brand { font-size: 24px; font-weight: 800; }
            .badge { background: #e1b808; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; }
            .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
            .metric-box { background: #F6F5FA; border: 1px solid #DFDCE8; border-radius: 12px; padding: 12px; }
            .metric-title { font-size: 10px; text-transform: uppercase; color: #6F6E73; font-weight: bold; }
            .metric-value { font-size: 20px; font-weight: 800; margin-top: 4px; color: #212121; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th { text-align: left; background: #F6F5FA; padding: 10px 8px; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #DFDCE8; color: #6F6E73; }
            @media print { @page { margin: 15mm; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">JOURNEY RENTALS SOLAPUR</div>
              <div style="font-size: 12px; color: #6F6E73; margin-top: 4px;">Executive Bookings Abstract &amp; Revenue Ledger</div>
            </div>
            <div style="text-align: right;">
              <span class="badge">GENERATED ON ${todayStr.toUpperCase()}</span>
            </div>
          </div>

          <div class="metrics">
            <div class="metric-box">
              <div class="metric-title">Total Bookings</div>
              <div class="metric-value">${bookingsList.length}</div>
            </div>
            <div class="metric-box">
              <div class="metric-title">Available Fleet</div>
              <div class="metric-value">${availableVehiclesCount} / ${totalVehiclesCount}</div>
            </div>
            <div class="metric-box">
              <div class="metric-title">Fleet Occupancy</div>
              <div class="metric-value">${occupancyPct}%</div>
            </div>
            <div class="metric-box">
              <div class="metric-title">Gross Revenue</div>
              <div class="metric-value">₹${totalRevenueSum.toLocaleString("en-IN")}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer Name</th>
                <th>Vehicle Model</th>
                <th>Pickup Hub</th>
                <th>Reservation Dates</th>
                <th>Status</th>
                <th style="text-align: right;">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div style="margin-top: 30px; border-top: 1px solid #DFDCE8; padding-top: 12px; font-size: 10px; color: #99989E; display: flex; justify-content: space-between;">
            <span>Journey Rentals Solapur · Station Hub &amp; Operations Dispatch</span>
            <span>Document ID: JR-ABSTRACT-${Date.now()}</span>
          </div>
        </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        setIsExportingPdf(false);
      }, 600);
    } catch (err) {
      toast.error("Failed to export PDF: " + (err?.message || "Please check connection"));
      setIsExportingPdf(false);
    }
  };

  const loadAnalytics = useCallback(async () => {
    try {
      setAnalyticsLoading(true);
      setEnqLoading(true);
      const [dashRes, bksRes, vehsRes, enqRes] = await Promise.allSettled([
        api.get("/api/admin/dashboard").then((r) => r.data || {}).catch(() => api.owner.dashboard()),
        api.get("/api/admin/bookings").then((r) => r.data?.bookings || r.data?.data || r.data || []).catch(() => api.owner.getBookings().then(r => r.bookings || r.data || [])),
        api.get("/api/admin/fleet").then((r) => r.data?.vehicles || r.data || []).catch(() => api.owner.getVehicles().then(r => r.vehicles || [])),
        api.get("/api/admin/enquiries").then((r) => r.data?.items || r.data?.enquiries || r.data || []).catch(() => []),
      ]);

      const bks = bksRes.status === "fulfilled" && Array.isArray(bksRes.value) ? bksRes.value : [];
      setLiveBookings(bks);
      const vehs = vehsRes.status === "fulfilled" && Array.isArray(vehsRes.value) ? vehsRes.value : [];
      const rawEnqs = enqRes.status === "fulfilled" && Array.isArray(enqRes.value) ? enqRes.value : [];
      const dashData = dashRes.status === "fulfilled" && dashRes.value ? dashRes.value : {};
      const stats = dashData.stats || {};

      const confirmedList = bks.filter((b) => b.status === "confirmed" || b.status === "completed");
      const totalBookings = bks.length || stats?.bookings?.total || 0;
      const totalVehicles = stats?.vehicles?.total ?? vehs.length;
      const availableVehicles = stats?.vehicles?.available ?? vehs.filter((v) => v.isAvailable !== false).length;
      const bookedVehicles = totalVehicles - availableVehicles;
      const utilPct = stats?.utilization ?? (totalVehicles > 0 ? Math.round((bookedVehicles / totalVehicles) * 100) : 0);
      const grossRevenue = stats?.revenue?.totalGross != null
        ? stats.revenue.totalGross
        : confirmedList.reduce((acc, b) => acc + (b.totalPrice || 0), 0);

      // Real dynamic MongoDB Day-of-Week volume
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayCounts = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
      bks.forEach((b) => {
        const d = new Date(b.pickupDate || b.bikeDate || b.createdAt);
        if (!isNaN(d.getTime())) {
          const dName = dayNames[d.getDay()];
          dayCounts[dName] = (dayCounts[dName] || 0) + 1;
        }
      });

      let maxCount = 0;
      let peakDay = "Sun";
      const dynamicWeeklyBookings = dayNames.map((day) => {
        const count = dayCounts[day] || 0;
        if (count > maxCount) {
          maxCount = count;
          peakDay = day;
        }
        return {
          day,
          vehicles: count,
          peak: false,
          active: count > 0,
        };
      });

      const peakIndex = dynamicWeeklyBookings.findIndex((d) => d.day === peakDay);
      if (peakIndex !== -1 && maxCount > 0) {
        dynamicWeeklyBookings[peakIndex].peak = true;
      }

      setData({
        total_bookings: totalBookings,
        total_revenue: grossRevenue,
        active_bookings: bookedVehicles,
        total_vehicles: totalVehicles,
        available_vehicles: availableVehicles,
        fleet_available: availableVehicles,
        fleet_booked: bookedVehicles,
        fleet_utilization_pct: utilPct,
        weekly_total_cars: totalVehicles,
        peak_day: maxCount > 0 ? peakDay : "Daily Handover",
        peak_vehicles: maxCount > 0 ? maxCount : 0,
        weekly_fleet_bookings: dynamicWeeklyBookings,
        recent_bookings: bks.slice(0, 10),
      });

      // Real MongoDB customer leads/inquiries
      const realLeads = rawEnqs.map((e) => ({
        id: e.id || e._id,
        reference_id: e.reference_id || `ENQ-${(e.id || e._id || "").toString().slice(-6).toUpperCase()}`,
        customer_name: e.customer_name,
        phone: e.phone,
        email: e.email || "",
        city: e.city || "Solapur",
        car_model_interested: e.car_model_interested || "Self-Drive Vehicle",
        source: e.source || "Phone Call",
        status: e.status || "New",
        total_price: 0,
        created_at: e.createdAt || e.created_at,
        notes: e.notes || "",
      }));

      const cityCounts = {};
      realLeads.forEach((l) => {
        if (l.city) cityCounts[l.city] = (cityCounts[l.city] || 0) + 1;
      });
      const topCity = Object.keys(cityCounts).sort((a, b) => cityCounts[b] - cityCounts[a])[0] || "Solapur Station";

      setEnquiriesData({
        top_city: topCity,
        total_enquiries: realLeads.length,
        items: realLeads,
      });
    } catch (err) {
      console.error("Dashboard live sync error:", err);
    } finally {
      setAnalyticsLoading(false);
      setEnqLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
    // Dynamic live polling: auto-refresh every 15 seconds and on window focus
    const interval = setInterval(loadAnalytics, 15000);
    window.addEventListener("focus", loadAnalytics);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", loadAnalytics);
    };
  }, [loadAnalytics]);

  async function handleBookingStatusChange(bookingId, newStatus) {
    try {
      await api.patch(`/api/admin/bookings/${bookingId}`, { status: newStatus }).catch(() =>
        api.owner.updateBooking(bookingId, { status: newStatus })
      );
      toast.success(`Booking status changed to ${newStatus}`);
      loadAnalytics();
    } catch (e) {
      toast.error("Failed to update booking status");
    }
  }

  const filteredLiveBookings = liveBookings.filter((b) => {
    if (bksStatusFilter !== "all" && (b.status || 'pending').toLowerCase() !== bksStatusFilter.toLowerCase()) return false;
    if (bksQuery.trim()) {
      const q = bksQuery.toLowerCase();
      const name = (b.userSnapshot?.name || b.customerInfo?.name || '').toLowerCase();
      const phone = (b.userSnapshot?.phone || b.customerInfo?.phone || '').toLowerCase();
      const ref = (b.referenceId || '').toLowerCase();
      const loc = (b.pickupLocation || '').toLowerCase();
      const vTitle = (b.vehicleSnapshot ? `${b.vehicleSnapshot.brand || ''} ${b.vehicleSnapshot.model || ''}` : '').toLowerCase();
      return name.includes(q) || phone.includes(q) || ref.includes(q) || loc.includes(q) || vTitle.includes(q);
    }
    return true;
  });

  async function updateEnquiryStatus(id, newStatus) {
    try {
      await api.patch(`/api/admin/enquiries/${id}`, { status: newStatus }).catch(() => {});
      setEnquiriesData((prev) => ({
        ...prev,
        items: prev.items.map((item) => (item.id === id ? { ...item, status: newStatus } : item)),
      }));
      toast.success(`Updated lead status to ${newStatus}`);
      loadAnalytics();
    } catch (e) {
      toast.error("Failed to update lead status");
    }
  }

  function promptDeleteEnquiry(id) {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  }

  async function handleConfirmDeleteEnquiry() {
    if (!deleteTargetId) return;
    try {
      setDeleting(true);
      await api.delete(`/api/admin/enquiries/${deleteTargetId}`).catch(() => {});
      setEnquiriesData((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== deleteTargetId),
      }));
      toast.success("Lead record removed.");
      setDeleteConfirmOpen(false);
      setDeleteTargetId(null);
      loadAnalytics();
    } catch (e) {
      toast.error("Failed to delete lead");
    } finally {
      setDeleting(false);
    }
  }

  function viewNote(enq) {
    setSelectedNote({
      text: enq.notes || "No notes attached.",
      title: `Notes for ${enq.customer_name}`,
      subtitle: `${enq.city} · ${enq.car_model_interested} · ${enq.phone}`,
    });
    setNotesModalOpen(true);
  }

  const filteredEnquiries = (enquiriesData.items || []).filter((item) => {
    const matchQuery =
      !enqQuery ||
      item.customer_name?.toLowerCase().includes(enqQuery.toLowerCase()) ||
      item.phone?.includes(enqQuery);
    const matchCity = cityFilter === "All" || item.city === cityFilter;
    const matchStatus = statusFilter === "All" || item.status === statusFilter;
    return matchQuery && matchCity && matchStatus;
  });

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8 font-body pb-6 text-left">

      {/* ── 1. WELCOME BANNER ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#F6F5FA] via-white to-[#FFFFFF] border border-[#DFDCE8] rounded-[1.8rem] sm:rounded-[2.2rem] p-5 sm:p-7 shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">

        {/* Left: Greeting */}
        <div className="relative z-10 text-center sm:text-left flex-1">
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#212121] tracking-tight leading-tight">
            Hello, Journey Admin! 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#6F6E73] mt-2 font-medium leading-relaxed max-w-md">
            Welcome back to the Journey Rentals Executive CRM. Your fleet of <strong className="text-[#212121]">{data?.total_vehicles ?? 22} vehicles</strong> is operating with{" "}
            <strong className="text-[#212121]">{data?.fleet_utilization_pct !== undefined ? `${data.fleet_utilization_pct}%` : "0%"} occupancy</strong> across Solapur Railway Station and temple hubs.
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-5">
            <Button
              onClick={() => setEnquiryModalOpen(true)}
              className="bg-[#FFFFFF] hover:bg-[#DFDCE8] text-[#212121] border border-[#DFDCE8] rounded-full px-4 sm:px-5 py-2 h-auto text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <MessageSquarePlus size={14} className="mr-1.5 text-[#E8826B]" />
              New Lead
            </Button>
            <Button
              onClick={() => setOfflineModalOpen(true)}
              className="bg-[#212121] hover:bg-[#141414] text-white rounded-full px-4 sm:px-5 py-2 h-auto text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <Plus size={14} className="mr-1.5 text-[#e1b808]" />
              Offline Booking
            </Button>
            <Button
              onClick={handleExportPdfAbstract}
              disabled={isExportingPdf}
              className="bg-white hover:bg-[#F6F5FA] text-[#212121] border border-[#DFDCE8] rounded-full px-4 sm:px-5 py-2 h-auto text-xs font-bold transition-all cursor-pointer shadow-2xs disabled:opacity-60"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 size={14} className="mr-1.5 text-[#212121] animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <FileText size={14} className="mr-1.5 text-[#212121]" />
                  Booking Abstract
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right: Interactive 3D Character */}
        <Live3DCharacterGesture />
      </div>

      {/* ── 2. KPI METRIC CARDS (Exact OG Journey Rentals Database) ───── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">

        {/* Total Bookings -> /admin/bookings */}
        <Link
          to="/admin/bookings"
          className="bg-[#E8826B]/15 border border-[#E8826B]/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between min-h-[130px] sm:min-h-[160px] shadow-sm hover:bg-[#E8826B] hover:border-[#E8826B] hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="font-display text-xs sm:text-sm font-bold text-[#E8826B] group-hover:text-[#212121] transition-colors">Total Bookings</div>
              <div className="text-[9px] sm:text-[10px] text-[#6F6E73] group-hover:text-[#212121]/85 font-semibold mt-0.5 transition-colors">All Time Orders</div>
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#E8826B] text-white flex items-center justify-center group-hover:scale-110 group-hover:bg-[#212121] group-hover:text-white transition-all">
              <ArrowUpRight size={14} />
            </div>
          </div>
          <div className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#212121] group-hover:text-[#212121] mt-4 tracking-tight transition-colors">
            {analyticsLoading && !data ? <Skeleton className="h-8 w-20 rounded-lg" /> : (data?.total_bookings ?? 4).toLocaleString()}
          </div>
        </Link>

        {/* Active Fleet -> /admin/fleet */}
        <Link
          to="/admin/fleet"
          className="bg-[#82C4B7]/15 border border-[#82C4B7]/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between min-h-[130px] sm:min-h-[160px] shadow-sm hover:bg-[#82C4B7] hover:border-[#82C4B7] hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="font-display text-xs sm:text-sm font-bold text-[#82C4B7] group-hover:text-[#212121] transition-colors">Active Fleet</div>
              <div className="text-[9px] sm:text-[10px] text-[#6F6E73] group-hover:text-[#212121]/85 font-semibold mt-0.5 transition-colors">Available Vehicles</div>
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#82C4B7] text-white flex items-center justify-center group-hover:scale-110 group-hover:bg-[#212121] group-hover:text-white transition-all">
              <ArrowUpRight size={14} />
            </div>
          </div>
          <div className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#212121] group-hover:text-[#212121] mt-4 tracking-tight transition-colors">
            {analyticsLoading && !data ? <Skeleton className="h-8 w-24 rounded-lg" /> : `${data?.available_vehicles ?? 22} / ${data?.total_vehicles ?? 22}`}
          </div>
        </Link>

        {/* Fleet Utilization -> /admin/calendar */}
        <Link
          to="/admin/calendar"
          className="bg-[#DCE4FF] border border-[#DFDCE8] rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between min-h-[130px] sm:min-h-[160px] shadow-sm hover:bg-[#DCE4FF] hover:border-[#212121]/20 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="font-display text-xs sm:text-sm font-bold text-[#212121] group-hover:text-[#212121] transition-colors">Utilization</div>
              <div className="text-[9px] sm:text-[10px] text-[#6F6E73] group-hover:text-[#212121]/85 font-semibold mt-0.5 transition-colors">Fleet Occupancy</div>
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#212121] text-white flex items-center justify-center group-hover:scale-110 group-hover:bg-[#212121] transition-all">
              <ArrowUpRight size={14} />
            </div>
          </div>
          <div className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#212121] group-hover:text-[#212121] mt-4 tracking-tight transition-colors">
            {analyticsLoading && !data ? <Skeleton className="h-8 w-16 rounded-lg" /> : `${data?.fleet_utilization_pct ?? 0}%`}
          </div>
        </Link>

        {/* Total Revenue -> /admin/bookings */}
        <Link
          to="/admin/bookings"
          className="bg-[#82C4B7]/15 border border-[#82C4B7]/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between min-h-[130px] sm:min-h-[160px] shadow-sm hover:bg-[#82C4B7] hover:border-[#82C4B7] hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="font-display text-xs sm:text-sm font-bold text-[#82C4B7] group-hover:text-[#212121] transition-colors">Revenue</div>
              <div className="text-[9px] sm:text-[10px] text-[#6F6E73] group-hover:text-[#212121]/85 font-semibold mt-0.5 transition-colors">Gross Earnings</div>
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#82C4B7] text-white flex items-center justify-center group-hover:scale-110 group-hover:bg-[#212121] group-hover:text-white transition-all">
              <ArrowUpRight size={14} />
            </div>
          </div>
          <div className="font-display text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-[#212121] group-hover:text-[#212121] mt-4 tracking-tight break-all transition-colors">
            {analyticsLoading && !data ? <Skeleton className="h-8 w-28 rounded-lg" /> : formatINR(data?.total_revenue ?? 0)}
          </div>
        </Link>
      </div>

      {/* ── 3. WEEKLY FLEET VOLUME CHART ─────────────────────────────── */}
      <div className="bg-white border border-[#DFDCE8] rounded-[1.8rem] sm:rounded-[2rem] p-5 sm:p-7 shadow-sm">
        <div className="flex items-start sm:items-center justify-between gap-3 mb-5 flex-wrap">
          <div>
            <h2 className="font-display text-base sm:text-lg lg:text-xl font-bold text-[#212121]">Weekly Fleet Booking Volume</h2>
            <p className="text-[11px] sm:text-xs text-[#6F6E73] mt-0.5">Live day-of-week vehicle reservations from database</p>
          </div>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-12 gap-5 lg:gap-8 items-start md:items-center">
          {/* Left summary card */}
          <div className="w-full md:col-span-4 lg:col-span-3 bg-[#F6F5FA] border border-[#DFDCE8] rounded-2xl p-4 sm:p-6 space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#6F6E73]">Live Fleet Volume</div>
            <div className="font-display text-3xl sm:text-4xl font-extrabold text-[#212121]">
              {data?.total_bookings ?? 4} Orders
            </div>
            <div className="text-xs text-[#6F6E73] font-semibold">total verified reservations</div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#82C4B7]/20 text-[#4B8039] text-xs font-bold">
              {data?.available_vehicles ?? 22} / {data?.total_vehicles ?? 22} Fleet Ready
            </span>
            <div className="pt-3 border-t border-[#DFDCE8] text-[11px] text-[#6F6E73]">
              <span className="font-bold text-[#212121]">Peak Day:</span> {data?.peak_day || "Saturday"}
            </div>
          </div>

          {/* Bar chart */}
          <div className="w-full md:col-span-8 lg:col-span-9 relative h-52 sm:h-64 lg:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.weekly_fleet_bookings || []}
                margin={{ top: 28, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DFDCE8" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6F6E73', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fill: '#6F6E73', fontSize: 11 }} width={28} />
                <Tooltip
                  cursor={{ fill: 'rgba(33, 33, 33, 0.05)', rx: 12, ry: 12 }}
                  formatter={(val) => [`${val} Bookings`, "Volume"]}
                  contentStyle={{ backgroundColor: '#212121', borderRadius: '14px', border: 'none', color: '#FFFFFF', fontSize: '12px' }}
                  itemStyle={{ color: '#e1b808' }}
                />
                <Bar dataKey="vehicles" radius={[12, 12, 12, 12]} barSize={36} maxBarSize={48}>
                  {(data?.weekly_fleet_bookings || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.peak ? "#212121" : entry.vehicles > 0 ? "#C4C732" : "#DFDCE8"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── 4. LIVE WEBSITE RESERVATIONS & BOOKINGS ───────────────────────── */}
      <div className="bg-white border border-[#DFDCE8] rounded-[1.8rem] sm:rounded-[2rem] p-5 sm:p-7 shadow-sm space-y-5">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#DFDCE8]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg sm:text-xl font-bold text-[#212121]">Live Website Reservations &amp; Bookings</h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#82C4B7]/20 text-[#4B8039]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4B8039] animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#6F6E73] mt-0.5">Real-time incoming customer vehicle reservations from journeyrentals.in</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="bg-[#F6F5FA] border border-[#DFDCE8] px-3 sm:px-4 py-2 rounded-2xl text-xs text-[#6F6E73]">
              <span className="text-[10px] uppercase text-[#9896A1] block">Total Orders</span>
              <strong className="text-[#212121] font-extrabold text-sm">{liveBookings.length} Bookings</strong>
            </div>
            <Link
              to="/admin/bookings"
              className="bg-[#212121] hover:bg-[#141414] text-white rounded-full px-4 sm:px-5 py-2 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>Manage All</span>
              <ArrowRight size={13} className="text-[#e1b808]" />
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#F6F5FA] p-3 rounded-2xl border border-[#DFDCE8]">
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-3 flex-1">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9896A1]" />
              <input
                type="text"
                placeholder="Search booking ref, customer, car..."
                value={bksQuery}
                onChange={(e) => setBksQuery(e.target.value)}
                className="w-full bg-white border border-[#DFDCE8] rounded-xl pl-9 pr-3 py-2 text-xs text-[#212121] outline-none focus:border-[#212121] transition-all"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-[#DFDCE8] overflow-x-auto">
              {["all", "pending", "confirmed", "completed", "cancelled"].map((st) => (
                <button
                  key={st}
                  onClick={() => setBksStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    bksStatusFilter === st ? "bg-[#212121] text-white shadow-2xs" : "text-[#6F6E73] hover:text-[#212121]"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={() => loadAnalytics()}
            className="bg-white hover:bg-[#F6F5FA] text-[#212121] border border-[#DFDCE8] rounded-xl px-4 py-2 h-auto text-xs font-bold cursor-pointer"
          >
            Refresh
          </Button>
        </div>

        {/* Bookings Table */}
        <div className="overflow-x-auto overflow-y-auto max-h-[420px] rounded-2xl border border-[#DFDCE8] -mx-1">
          <table className="w-full min-w-[720px] text-left text-xs font-body">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#F6F5FA] border-b border-[#DFDCE8] text-[#6F6E73] text-[11px] uppercase tracking-wider font-bold">
                <th className="py-3.5 pl-4 pr-2">Booking Ref</th>
                <th className="py-3.5 px-2">Customer Info</th>
                <th className="py-3.5 px-2">Vehicle &amp; Hub</th>
                <th className="py-3.5 px-2">Schedule</th>
                <th className="py-3.5 px-2">Pricing</th>
                <th className="py-3.5 px-2">KYC</th>
                <th className="py-3.5 px-2">Status</th>
                <th className="py-3.5 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFDCE8]">
              {analyticsLoading && liveBookings.length === 0 ? (
                [...Array(3)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td colSpan={8} className="py-4 px-4">
                      <div className="h-8 bg-[#F6F5FA] rounded-xl" />
                    </td>
                  </tr>
                ))
              ) : filteredLiveBookings.length > 0 ? (
                filteredLiveBookings.map((b) => {
                  const custName = b.userSnapshot?.name || b.customerInfo?.name || "Customer";
                  const custPhone = b.userSnapshot?.phone || b.customerInfo?.phone || "";
                  const vTitle = b.vehicleSnapshot ? `${b.vehicleSnapshot.brand || ''} ${b.vehicleSnapshot.model || ''}`.trim() : "Vehicle";
                  const isBike = b.bookingType === "bike";

                  return (
                    <tr key={b._id || b.referenceId} className="hover:bg-[#F6F5FA]/60 transition-colors">
                      {/* Ref */}
                      <td className="py-3.5 pl-4 pr-2 whitespace-nowrap">
                        <div className="font-bold text-[#212121] font-mono">#{b.referenceId}</div>
                        <div className="text-[10px] text-[#6F6E73]">{safeFormatDate(b.createdAt, "dd MMM yyyy")}</div>
                      </td>

                      {/* Customer & WhatsApp */}
                      <td className="py-3.5 px-2 whitespace-nowrap">
                        <div className="font-bold text-[#212121]">{custName}</div>
                        {custPhone && (
                          <a
                            href={`https://wa.me/${custPhone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(custName)},%20regarding%20your%20Journey%20Rentals%20booking%20${b.referenceId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-[#4B8039] hover:underline flex items-center gap-1 font-mono mt-0.5"
                          >
                            <MessageCircle size={11} />
                            <span>{custPhone}</span>
                          </a>
                        )}
                      </td>

                      {/* Vehicle & Hub */}
                      <td className="py-3.5 px-2">
                        <div className="font-bold text-[#212121] truncate max-w-[180px]">{vTitle}</div>
                        <div className="text-[10px] text-[#3F5F8C] truncate max-w-[180px]">{b.pickupLocation || "Solapur Station"}</div>
                      </td>

                      {/* Schedule */}
                      <td className="py-3.5 px-2 font-mono text-[11px] text-[#6F6E73] whitespace-nowrap">
                        {isBike
                          ? `${safeFormatDate(b.bikeDate, "dd MMM")} (${b.bikeSlot || 'Slot'})`
                          : `${safeFormatDate(b.pickupDate, "dd MMM")} – ${safeFormatDate(b.returnDate, "dd MMM")}`}
                      </td>

                      {/* Pricing */}
                      <td className="py-3.5 px-2 font-mono whitespace-nowrap">
                        <div className="font-bold text-[#212121]">{formatINR(b.totalPrice)}</div>
                        <div className="text-[10px] text-[#4B8039]">Adv: {formatINR(b.advancePaid || 500)}</div>
                      </td>

                      {/* KYC */}
                      <td className="py-3.5 px-2 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedKycBooking(b)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F6F5FA] border border-[#DFDCE8] hover:bg-white text-[11px] font-bold text-[#212121] cursor-pointer"
                        >
                          <Eye size={12} />
                          <span>Docs</span>
                        </button>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-2 whitespace-nowrap min-w-[130px]">
                        <CustomSelect
                          value={b.status || "pending"}
                          onChange={(val) => handleBookingStatusChange(b._id, val)}
                          options={[
                            { value: "pending", label: "Pending" },
                            { value: "confirmed", label: "Confirmed" },
                            { value: "completed", label: "Completed" },
                            { value: "cancelled", label: "Cancelled" },
                          ]}
                          placeholder="Status"
                        />
                      </td>

                      {/* Action */}
                      <td className="py-3.5 pr-4 text-right whitespace-nowrap">
                        <Link
                          to="/admin/bookings"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#212121] hover:underline"
                        >
                          <span>Manage</span>
                          <ArrowRight size={11} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#6F6E73]">
                    No website reservations found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. CUSTOMER LEAD & ENQUIRY TRACKER ───────────────────────── */}
      <div className="bg-white border border-[#DFDCE8] rounded-[1.8rem] sm:rounded-[2rem] p-5 sm:p-7 shadow-sm space-y-5">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#DFDCE8]">
          <div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-[#212121]">Customer Lead &amp; Enquiry Tracker</h2>
            <p className="text-[11px] sm:text-xs text-[#6F6E73] mt-0.5">Manage rental leads, origin hubs, vehicle choices &amp; conversion pipeline</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="bg-[#F6F5FA] border border-[#DFDCE8] px-3 sm:px-4 py-2 rounded-2xl text-xs text-[#6F6E73]">
              <span className="text-[10px] uppercase text-[#9896A1] block">Top Origin Hub</span>
              <strong className="text-[#212121] font-extrabold text-sm">{enquiriesData.top_city || "Solapur Station"}</strong>
            </div>
            <div className="bg-[#F6F5FA] border border-[#DFDCE8] px-3 sm:px-4 py-2 rounded-2xl text-xs text-[#6F6E73]">
              <span className="text-[10px] uppercase text-[#9896A1] block">Active Leads</span>
              <strong className="text-[#212121] font-extrabold text-sm">{filteredEnquiries.length} Leads</strong>
            </div>
            <Button
              onClick={() => setEnquiryModalOpen(true)}
              className="bg-[#212121] hover:bg-[#141414] text-white rounded-full px-4 sm:px-5 py-2 h-auto text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus size={13} className="mr-1 text-[#e1b808]" />
              Log Enquiry
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#F6F5FA] p-3 rounded-2xl border border-[#DFDCE8]">
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-3 flex-1">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9896A1]" />
              <input
                type="text"
                placeholder="Search customer name or phone..."
                value={enqQuery}
                onChange={(e) => setEnqQuery(e.target.value)}
                className="w-full bg-white border border-[#DFDCE8] rounded-xl pl-9 pr-3 py-2 text-xs text-[#212121] outline-none focus:border-[#212121] transition-all"
              />
            </div>

            {/* City / Hub Filter */}
            <div className="w-full sm:w-48">
              <CustomSelect
                value={cityFilter}
                onChange={(val) => setCityFilter(val)}
                options={[
                  { value: "All", label: "All Hubs & Cities" },
                  ...Array.from(new Set((enquiriesData.items || []).map(i => i.city).filter(Boolean))).map(city => ({ value: city, label: city }))
                ]}
                placeholder="All Hubs & Cities"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-40">
              <CustomSelect
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                options={[
                  { value: "All", label: "All Statuses" },
                  { value: "New", label: "New" },
                  { value: "Contacted", label: "Contacted" },
                  { value: "Follow-up", label: "Follow-up" },
                  { value: "Converted", label: "Converted" },
                  { value: "Lost", label: "Lost" }
                ]}
                placeholder="All Statuses"
              />
            </div>
          </div>

          <Button
            onClick={() => loadAnalytics()}
            className="bg-white hover:bg-[#F6F5FA] text-[#212121] border border-[#DFDCE8] rounded-xl px-4 py-2 h-auto text-xs font-bold cursor-pointer"
          >
            Refresh
          </Button>
        </div>

        {/* Enquiry Table */}
        <div className="overflow-x-auto overflow-y-auto max-h-[420px] rounded-2xl border border-[#DFDCE8] -mx-1">
          <table className="w-full min-w-[640px] text-left text-xs font-body">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#F6F5FA] border-b border-[#DFDCE8] text-[#6F6E73] text-[11px] uppercase tracking-wider font-bold">
                <th className="py-3.5 pl-4 pr-2">Customer Info</th>
                <th className="py-3.5 px-2">Origin City</th>
                <th className="py-3.5 px-2">Vehicle Choice</th>
                <th className="py-3.5 px-2 hidden sm:table-cell">Source</th>
                <th className="py-3.5 px-2">Status</th>
                <th className="py-3.5 px-2 hidden md:table-cell">Date</th>
                <th className="py-3.5 pr-4 pl-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFDCE8] bg-white">
              {enqLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3.5 pl-4 pr-2">
                      <Skeleton className="h-4 w-32 rounded-md mb-1.5" />
                      <Skeleton className="h-3 w-24 rounded-md" />
                    </td>
                    <td className="py-3.5 px-2">
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </td>
                    <td className="py-3.5 px-2">
                      <Skeleton className="h-4 w-28 rounded-md" />
                    </td>
                    <td className="py-3.5 px-2 hidden sm:table-cell">
                      <Skeleton className="h-4 w-16 rounded-md" />
                    </td>
                    <td className="py-3.5 px-2">
                      <Skeleton className="h-8 w-24 rounded-full" />
                    </td>
                    <td className="py-3.5 px-2 hidden md:table-cell">
                      <Skeleton className="h-4 w-20 rounded-md" />
                    </td>
                    <td className="py-3.5 pr-4 pl-2 text-right">
                      <Skeleton className="h-7 w-16 rounded-lg ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredEnquiries.length > 0 ? (
                filteredEnquiries.map((enq, idx) => (
                  <tr key={enq.id || idx} className="hover:bg-[#F6F5FA] transition-colors">
                    {/* Customer Info */}
                    <td className="py-3.5 pl-4 pr-2">
                      <div className="font-bold text-[#212121] text-xs whitespace-nowrap">{enq.customer_name}</div>
                      <div className="text-[11px] text-[#6F6E73] mt-0.5 whitespace-nowrap">{enq.phone}</div>
                    </td>

                    {/* City */}
                    <td className="py-3.5 px-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F6F5FA] border border-[#DFDCE8] text-[11px] font-bold text-[#212121] whitespace-nowrap">
                        <MapPin size={10} className="text-[#E8826B] shrink-0" />
                        {enq.city}
                      </span>
                    </td>

                    {/* Vehicle */}
                    <td className="py-3.5 px-2 font-semibold text-[#212121] max-w-[150px]">
                      <span className="block truncate">{enq.car_model_interested}</span>
                    </td>

                    {/* Source */}
                    <td className="py-3.5 px-2 text-[11px] text-[#6F6E73] hidden sm:table-cell whitespace-nowrap">
                      {enq.source}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-2 min-w-[130px]">
                      <CustomSelect
                        value={enq.status || "New"}
                        onChange={(val) => updateEnquiryStatus(enq.id, val)}
                        options={[
                          { value: "New", label: "New" },
                          { value: "Contacted", label: "Contacted" },
                          { value: "Follow-up", label: "Follow-up" },
                          { value: "Converted", label: "Converted" },
                          { value: "Lost", label: "Lost" }
                        ]}
                        placeholder="Status"
                      />
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-2 text-[11px] text-[#6F6E73] hidden md:table-cell whitespace-nowrap">
                      {safeFormatDate(enq.created_at, "dd MMM yyyy", "Recent")}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 pr-4 pl-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {enq.notes && (
                          <button
                            onClick={() => viewNote(enq)}
                            className="p-1.5 rounded-lg text-[#6F6E73] hover:text-[#212121] hover:bg-[#F6F5FA] transition-colors cursor-pointer"
                            title="View Notes"
                          >
                            <MessageSquarePlus size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => promptDeleteEnquiry(enq.id)}
                          className="p-1.5 rounded-lg text-[#E03131] hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Enquiry"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#6F6E73]">
                    No customer leads found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Modals */}
      <OfflineBookingModal open={offlineModalOpen} onOpenChange={setOfflineModalOpen} />
      <EnquiryModal open={enquiryModalOpen} onOpenChange={setEnquiryModalOpen} />

      <ConfirmModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Customer Lead Enquiry?"
        description="Are you sure you want to delete this enquiry? This action cannot be undone."
        confirmText="Delete Enquiry"
        variant="destructive"
        loading={deleting}
        onConfirm={handleConfirmDeleteEnquiry}
      />

      <NotesModal
        open={notesModalOpen}
        onOpenChange={setNotesModalOpen}
        title={selectedNote.title}
        subtitle={selectedNote.subtitle}
        notes={selectedNote.text}
      />

      {/* KYC Viewer Modal */}
      {selectedKycBooking && (
        <Dialog open={!!selectedKycBooking} onOpenChange={() => setSelectedKycBooking(null)}>
          <DialogContent className="max-w-md bg-white rounded-[24px] border border-[#DFDCE8] p-6 text-left font-body">
            <DialogHeader>
              <DialogTitle className="text-base font-bold font-display text-[#212121]">
                Driver KYC Documents — #{selectedKycBooking.referenceId}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div>
                <span className="text-[11px] font-bold uppercase text-[#6F6E73] block mb-1">Aadhar Card</span>
                {selectedKycBooking.documents?.aadharUrl ? (
                  <a
                    href={selectedKycBooking.documents.aadharUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-[#F6F5FA] border border-[#DFDCE8] flex items-center justify-between hover:bg-white text-xs font-bold text-[#3F5F8C]"
                  >
                    <span>View Aadhar Document</span>
                    <ExternalLink size={14} />
                  </a>
                ) : (
                  <p className="text-xs text-[#99989E]">No Aadhar document attached</p>
                )}
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase text-[#6F6E73] block mb-1">Driving License</span>
                {selectedKycBooking.documents?.licenseUrl ? (
                  <a
                    href={selectedKycBooking.documents.licenseUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-[#F6F5FA] border border-[#DFDCE8] flex items-center justify-between hover:bg-white text-xs font-bold text-[#3F5F8C]"
                  >
                    <span>View Driving License</span>
                    <ExternalLink size={14} />
                  </a>
                ) : (
                  <p className="text-xs text-[#99989E]">No License document attached</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
