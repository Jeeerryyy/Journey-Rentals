import React, { useState, useEffect, useCallback } from "react";
import api, { formatINR, formatApiError, safeFormatDate } from "@/lib/api";
import {
  Search, Check, X, Shield, Phone, Mail, FileText, Camera,
  MessageCircle, ExternalLink, Calendar, MapPin, Eye, Upload, MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/dialog";
import CustomSelect from "@/website/components/CustomSelect";
import { openBookingInvoiceInNewTab } from "@/website/utils/invoiceGenerator";
import { Skeleton } from "@/ui/skeleton";
import WhatsAppBookingModal from "@/shared/components/WhatsAppBookingModal";

export default function BookingsManage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selected Booking for WhatsApp Dispatch Modal
  const [selectedWhatsAppBooking, setSelectedWhatsAppBooking] = useState(null);
  // Selected Booking for KYC modal
  const [selectedKycBooking, setSelectedKycBooking] = useState(null);
  // Selected Booking for Photo Inspection Upload
  const [selectedPhotoBooking, setSelectedPhotoBooking] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/bookings").catch(() => api.owner.getBookings());
      const raw = res?.data || res;
      const list = raw?.bookings || raw?.data || (Array.isArray(raw) ? raw : []);
      setBookings(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error("Failed to load reservations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    // Real-time polling for instant web booking reflection
    const interval = setInterval(fetchBookings, 15000);
    window.addEventListener("focus", fetchBookings);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", fetchBookings);
    };
  }, [fetchBookings]);

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== "all" && (b.status || 'pending').toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (b.userSnapshot?.name || b.customerInfo?.name || '').toLowerCase();
      const phone = (b.userSnapshot?.phone || b.customerInfo?.phone || '').toLowerCase();
      const ref = (b.referenceId || '').toLowerCase();
      const loc = (b.pickupLocation || '').toLowerCase();
      const vTitle = (b.vehicleSnapshot ? `${b.vehicleSnapshot.brand || ''} ${b.vehicleSnapshot.model || ''}` : '').toLowerCase();
      return name.includes(q) || phone.includes(q) || ref.includes(q) || loc.includes(q) || vTitle.includes(q);
    }
    return true;
  });

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await api.patch(`/api/admin/bookings/${bookingId}`, { status: newStatus }).catch(() =>
        api.owner.updateBooking(bookingId, { status: newStatus })
      );
      toast.success(`Booking status changed to ${newStatus}`);
      fetchBookings();
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  const handlePhotoUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPhotoBooking || !photoFile) return;

    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.append("photo", photoFile);
      await api.owner.uploadBookingPhoto(selectedPhotoBooking._id || selectedPhotoBooking.id, formData);
      toast.success("Handover inspection photo attached!");
      setSelectedPhotoBooking(null);
      setPhotoFile(null);
      setPhotoPreview("");
      fetchBookings();
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 text-left font-body text-[#212121]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#212121]">
            Reservations Management
          </h1>
          <p className="text-xs text-[#6F6E73] mt-0.5">
            Review customer bookings, verify driver KYC documents, update status, and manage vehicle handovers.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#DFDCE8] p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#99989E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, ref #, location..."
            className="w-full h-10 pl-10 pr-3 rounded-xl bg-[#F6F5FA] border border-[#DFDCE8] text-xs font-medium text-[#212121] focus:ring-1 focus:ring-[#212121] focus:outline-none"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F6F5FA] border border-[#DFDCE8] overflow-x-auto max-w-full">
          {["all", "pending", "confirmed", "completed", "cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st ? "bg-[#212121] text-white shadow-2xs" : "text-[#6F6E73] hover:text-[#212121]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-[24px] border border-[#DFDCE8] shadow-sm overflow-hidden">
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#DFDCE8] bg-[#F6F5FA] text-[#6F6E73] uppercase text-[10px] font-bold font-mono">
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Vehicle &amp; Dates</th>
                  <th className="py-3 px-4">Pricing</th>
                  <th className="py-3 px-4">KYC Docs</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFDCE8]">
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4">
                      <Skeleton className="h-4 w-20 rounded-md mb-1" />
                      <Skeleton className="h-3 w-16 rounded-md" />
                    </td>
                    <td className="py-4 px-4">
                      <Skeleton className="h-4 w-28 rounded-md mb-1" />
                      <Skeleton className="h-3 w-20 rounded-md" />
                    </td>
                    <td className="py-4 px-4">
                      <Skeleton className="h-4 w-36 rounded-md mb-1" />
                      <Skeleton className="h-3 w-28 rounded-md" />
                    </td>
                    <td className="py-4 px-4">
                      <Skeleton className="h-4 w-20 rounded-md mb-1" />
                      <Skeleton className="h-3 w-16 rounded-md" />
                    </td>
                    <td className="py-4 px-4">
                      <Skeleton className="h-7 w-20 rounded-lg" />
                    </td>
                    <td className="py-4 px-4">
                      <Skeleton className="h-9 w-28 rounded-full" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-[#6F6E73] text-xs">
            No bookings found matching the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[300px] pb-12">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#DFDCE8] bg-[#F6F5FA] text-[#6F6E73] uppercase text-[10px] font-bold font-mono">
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Vehicle &amp; Dates</th>
                  <th className="py-3 px-4">Pricing</th>
                  <th className="py-3 px-4">KYC Docs</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFDCE8]">
                {filteredBookings.map((b) => {
                  const custName = b.userSnapshot?.name || b.customerInfo?.name || "Driver";
                  const custPhone = b.userSnapshot?.phone || b.customerInfo?.phone || "";
                  const vTitle = b.vehicleSnapshot ? `${b.vehicleSnapshot.brand || ''} ${b.vehicleSnapshot.model || ''}`.trim() : "Vehicle";
                  const isB = b.bookingType === "bike";

                  return (
                    <tr key={b._id || b.referenceId} className="hover:bg-[#F6F5FA] transition-colors">
                      {/* Ref & Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-[#212121] font-mono">#{b.referenceId}</div>
                        <div className="text-[10px] text-[#6F6E73]">{safeFormatDate(b.createdAt, "dd MMM yyyy")}</div>
                      </td>

                      {/* Customer Info & WhatsApp Link */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-[#212121]">{custName}</div>
                        {custPhone && (
                          <button
                            type="button"
                            onClick={() => setSelectedWhatsAppBooking(b)}
                            className="text-[11px] text-[#4B8039] hover:text-[#38622a] hover:underline flex items-center gap-1 font-mono mt-0.5 cursor-pointer"
                            title="Open WhatsApp Dispatch & Templates"
                          >
                            <MessageCircle size={12} className="fill-[#4B8039]/20" />
                            <span>{custPhone}</span>
                          </button>
                        )}
                      </td>

                      {/* Vehicle & Schedule */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#212121] truncate max-w-[200px]">{vTitle}</div>
                        <div className="text-[11px] text-[#6F6E73] font-mono">
                          {isB
                            ? `${safeFormatDate(b.bikeDate, "dd MMM")} (${b.bikeSlot || 'Slot'})`
                            : `${safeFormatDate(b.pickupDate, "dd MMM")} – ${safeFormatDate(b.returnDate, "dd MMM")}`}
                        </div>
                        <div className="text-[10px] text-[#3F5F8C] truncate">{b.pickupLocation || "Solapur"}</div>
                      </td>

                      {/* Pricing */}
                      <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                        <div className="font-bold text-[#212121]">{formatINR(b.totalPrice)}</div>
                        <div className="text-[10px] text-[#4B8039]">Adv: {formatINR(b.advancePaid || 500)}</div>
                        <div className="text-[10px] text-[#6F6E73]">Bal: {formatINR(b.balanceDue || 0)}</div>
                      </td>

                      {/* KYC Docs */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedKycBooking(b)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F6F5FA] border border-[#DFDCE8] hover:bg-white text-[11px] font-bold text-[#212121] cursor-pointer"
                        >
                          <Eye size={12} />
                          <span>View KYC</span>
                        </button>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4 whitespace-nowrap min-w-[140px]">
                        <CustomSelect
                          value={b.status || "pending"}
                          onChange={(val) => handleStatusChange(b._id, val)}
                          options={[
                            { value: "pending", label: "Pending" },
                            { value: "confirmed", label: "Confirmed" },
                            { value: "completed", label: "Completed" },
                            { value: "cancelled", label: "Cancelled" },
                          ]}
                          placeholder="Status"
                        />
                      </td>

                      {/* Photo Inspection, Invoice & WhatsApp Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedWhatsAppBooking(b)}
                            className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 cursor-pointer transition-colors shadow-2xs flex items-center gap-1 font-bold text-[11px]"
                            title="Dispatch WhatsApp Notification / Reminder"
                          >
                            <MessageSquare size={13} className="text-emerald-600" />
                            <span className="hidden xl:inline">WhatsApp</span>
                          </button>
                          <button
                            onClick={() => openBookingInvoiceInNewTab(b)}
                            className="p-1.5 rounded-lg border border-[#DFDCE8] bg-[#F6F5FA] hover:bg-white text-[#212121] cursor-pointer transition-colors shadow-2xs"
                            title="Generate Tax Invoice"
                          >
                            <FileText size={13} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPhotoBooking(b);
                              setPhotoPreview(b.handoverPhotoUrl || "");
                            }}
                            className="p-1.5 rounded-lg border border-[#DFDCE8] hover:bg-white text-[#212121] cursor-pointer transition-colors"
                            title="Attach Handover Inspection Photo"
                          >
                            <Camera size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* KYC Viewer Modal */}
      {selectedKycBooking && (
        <Dialog open={!!selectedKycBooking} onOpenChange={() => setSelectedKycBooking(null)}>
          <DialogContent className="max-w-2xl bg-white border border-[#DFDCE8] rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="font-syne font-bold text-lg text-[#212121] flex items-center gap-2">
                <Shield className="text-[#4B8039]" size={18} />
                <span>Customer Identity Verification (KYC)</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3 text-xs bg-[#F6F5FA] p-3 rounded-xl border border-[#DFDCE8]">
                <div>
                  <span className="text-[#6F6E73] block text-[10px] uppercase font-bold font-mono">Customer</span>
                  <span className="font-bold text-[#212121]">{selectedKycBooking.userSnapshot?.name || selectedKycBooking.customerInfo?.name || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[#6F6E73] block text-[10px] uppercase font-bold font-mono">Phone Number</span>
                  <span className="font-bold text-[#212121] font-mono">{selectedKycBooking.userSnapshot?.phone || selectedKycBooking.customerInfo?.phone || "N/A"}</span>
                </div>
              </div>

              {/* Document Images */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-[#212121]">Driving License</span>
                  <div className="aspect-4/3 rounded-xl overflow-hidden border border-[#DFDCE8] bg-black/5 flex items-center justify-center">
                    {selectedKycBooking.licensePhotoUrl || selectedKycBooking.kycDocs?.drivingLicense ? (
                      <img
                        src={selectedKycBooking.licensePhotoUrl || selectedKycBooking.kycDocs?.drivingLicense}
                        alt="Driving License"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4 text-[#6F6E73] text-xs">
                        <FileText size={24} className="mx-auto mb-1 opacity-40" />
                        <span>No DL Uploaded</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-[#212121]">Aadhaar / ID Card</span>
                  <div className="aspect-4/3 rounded-xl overflow-hidden border border-[#DFDCE8] bg-black/5 flex items-center justify-center">
                    {selectedKycBooking.aadhaarPhotoUrl || selectedKycBooking.kycDocs?.aadhaarCard ? (
                      <img
                        src={selectedKycBooking.aadhaarPhotoUrl || selectedKycBooking.kycDocs?.aadhaarCard}
                        alt="Aadhaar Card"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4 text-[#6F6E73] text-xs">
                        <FileText size={24} className="mx-auto mb-1 opacity-40" />
                        <span>No Aadhaar Uploaded</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Inspection Photo Upload Modal */}
      {selectedPhotoBooking && (
        <Dialog open={!!selectedPhotoBooking} onOpenChange={() => setSelectedPhotoBooking(null)}>
          <DialogContent className="max-w-md bg-white border border-[#DFDCE8] rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="font-syne font-bold text-lg text-[#212121] flex items-center gap-2">
                <Camera className="text-[#3F5F8C]" size={18} />
                <span>Vehicle Inspection Photo</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handlePhotoUploadSubmit} className="space-y-4 pt-2">
              {photoPreview ? (
                <div className="aspect-video rounded-xl overflow-hidden border border-[#DFDCE8] bg-black/5">
                  <img src={photoPreview} alt="Inspection" className="w-full h-full object-cover" />
                </div>
              ) : null}

              <label className="block w-full py-3 px-4 rounded-xl border border-dashed border-[#212121] text-center text-xs font-bold text-[#212121] cursor-pointer hover:bg-[#F6F5FA]">
                <span>Choose Vehicle Photo (Odometer / Exterior)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setPhotoFile(f);
                      const r = new FileReader();
                      r.onload = () => setPhotoPreview(r.result);
                      r.readAsDataURL(f);
                    }
                  }}
                  className="hidden"
                />
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPhotoBooking(null)}
                  className="flex-1 py-2.5 rounded-full border border-[#DFDCE8] text-xs font-bold text-[#6F6E73]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingPhoto || !photoFile}
                  className="flex-1 py-2.5 rounded-full bg-[#212121] text-white font-bold text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {uploadingPhoto ? "Uploading..." : "Save Photo"}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* WhatsApp Dispatch & Notification Modal */}
      {selectedWhatsAppBooking && (
        <WhatsAppBookingModal
          isOpen={Boolean(selectedWhatsAppBooking)}
          onClose={() => setSelectedWhatsAppBooking(null)}
          booking={selectedWhatsAppBooking}
        />
      )}

    </div>
  );
}
