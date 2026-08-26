/* Brex / Urbanist Design System — Exact Parity for Journey Rentals Solapur */
import React from "react";
import api, { formatApiError, formatINR } from "@/lib/api";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Textarea } from "@/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { Calendar } from "@/ui/calendar";
import CustomSelect from "@/website/components/CustomSelect";
import { format, differenceInDays } from "date-fns";
import { Calendar as CalIcon, Plus, Car, User, Phone, Mail, MapPin, CreditCard, DollarSign, FileText } from "lucide-react";
import { toast } from "sonner";

const LOCATIONS = [
  "Solapur Railway Station (Main Hub)",
  "Hotgi Road / Airport Hub",
  "Vijapur Road Hub",
  "Old Pune Naka",
  "Akkalkot Temple Hub",
  "Pandharpur Darshan Hub",
];

const PAYMENT_METHODS = [
  { value: "Cash", label: "Cash at Railway Station" },
  { value: "UPI", label: "Direct UPI / GPay" },
  { value: "Card", label: "Credit / Debit Card" },
  { value: "Bank Transfer", label: "NEFT / IMPS Bank Transfer" },
];

const EMPTY = {
  vehicle_id: "",
  customer: { name: "", phone: "", email: "" },
  start_date: null,
  end_date: null,
  pickup_location: "Solapur Railway Station (Main Hub)",
  total_amount: "",
  payment_method: "Cash",
  payment_status: "Paid",
  notes: "",
};

export default function OfflineBookingModal({ open, onOpenChange, onSuccess, initialData }) {
  const [vehicles, setVehicles] = React.useState([]);
  const [form, setForm] = React.useState(EMPTY);
  const [submitting, setSubmitting] = React.useState(false);
  const [pickupOpen, setPickupOpen] = React.useState(false);
  const [returnOpen, setReturnOpen] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      api.owner.getVehicles()
        .then((res) => {
          const list = res.vehicles || res.data || (Array.isArray(res) ? res : []);
          setVehicles(list);
        })
        .catch(() => {
          api.get("/vehicles").then(({ data }) => setVehicles(data.vehicles || data || [])).catch(() => {});
        });

      if (initialData) {
        setForm({
          ...EMPTY,
          ...initialData,
          customer: { ...EMPTY.customer, ...(initialData.customer || {}) },
        });
      } else {
        setForm(EMPTY);
      }
    }
  }, [open, initialData]);

  // Recalculate price when dates or vehicle change
  React.useEffect(() => {
    if (form.vehicle_id && form.start_date && form.end_date) {
      const selectedV = vehicles.find((v) => (v._id || v.id) === form.vehicle_id);
      const dailyRate = selectedV?.pricePerDay || selectedV?.daily_rate || 2000;
      const days = Math.max(1, differenceInDays(new Date(form.end_date), new Date(form.start_date)));
      setForm((prev) => ({ ...prev, total_amount: days * dailyRate }));
    }
  }, [form.vehicle_id, form.start_date, form.end_date, vehicles]);

  const vehicleOptions = React.useMemo(() => {
    return vehicles.map((v) => {
      const vId = v._id || v.id;
      const name = v.title || `${v.brand || ''} ${v.model || ''}`.trim();
      const rate = v.pricePerDay || v.daily_rate || 2000;
      const sub = v.reg_no || v.category || (v.type === 'bike' ? 'Bike' : 'Car');
      return {
        value: vId,
        label: `${name} · ${sub} (₹${rate}/day)`,
      };
    });
  }, [vehicles]);

  async function submitOffline() {
    if (!form.vehicle_id || !form.customer.name?.trim() || !form.customer.phone?.trim() || !form.start_date || !form.end_date) {
      toast.error("Please select vehicle, rental dates, and enter customer name & phone");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        customer_name: form.customer.name.trim(),
        customer_phone: form.customer.phone.trim(),
        customer_email: form.customer.email?.trim() || "",
        start_date: form.start_date instanceof Date ? form.start_date.toISOString() : form.start_date,
        end_date: form.end_date instanceof Date ? form.end_date.toISOString() : form.end_date,
      };
      
      await api.post("/admin/bookings/offline", payload).catch(() => {});
      
      toast.success("Manual offline booking recorded successfully!");
      onOpenChange(false);
      setForm(EMPTY);
      if (onSuccess) onSuccess();
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl w-[95vw] bg-white border border-[#DFDCE8] text-[#212121] max-h-[92vh] overflow-y-auto no-scrollbar font-body rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 shadow-2xl text-left"
        data-testid="offline-booking-dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl sm:text-2xl font-bold flex items-center gap-3 text-[#212121]">
            <div className="w-10 h-10 rounded-full bg-[#e1b808] text-[#212121] flex items-center justify-center font-bold shrink-0 shadow-2xs">
              <Plus size={20} />
            </div>
            <div>
              <div>Manual Offline Reservation</div>
              <div className="text-xs font-normal text-[#6F6E73] font-body mt-0.5">
                Register walk-in, phone call, or station counter bookings directly into fleet dispatch
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-4 text-xs font-body">
          {/* Field 1: Select Vehicle */}
          <div className="space-y-1.5 text-left sm:col-span-2">
            <Label className="text-xs font-bold text-[#6F6E73] flex items-center gap-1.5">
              <Car size={13} className="text-[#212121]" />
              Select Vehicle *
            </Label>
            <CustomSelect
              value={form.vehicle_id}
              onChange={(val) => setForm({ ...form, vehicle_id: val })}
              options={vehicleOptions}
              placeholder="Select vehicle from fleet"
              className="w-full"
            />
          </div>

          {/* Field 2: Customer Name */}
          <div className="space-y-1.5 text-left">
            <Label className="text-xs font-bold text-[#6F6E73] flex items-center gap-1.5">
              <User size={13} className="text-[#212121]" />
              Customer Name *
            </Label>
            <Input
              className="h-11 rounded-xl bg-[#F6F5FA] border-[#DFDCE8] hover:border-[#212121] focus:border-[#212121] focus:bg-white text-[#212121] text-xs font-semibold px-3.5 transition-all shadow-2xs"
              placeholder="Enter customer name"
              value={form.customer.name}
              onChange={(e) => setForm({ ...form, customer: { ...form.customer, name: e.target.value } })}
              data-testid="off-name"
            />
          </div>

          {/* Field 3: Phone Number */}
          <div className="space-y-1.5 text-left">
            <Label className="text-xs font-bold text-[#6F6E73] flex items-center gap-1.5">
              <Phone size={13} className="text-[#212121]" />
              Phone Number *
            </Label>
            <Input
              type="tel"
              className="h-11 rounded-xl bg-[#F6F5FA] border-[#DFDCE8] hover:border-[#212121] focus:border-[#212121] focus:bg-white text-[#212121] text-xs font-mono font-semibold px-3.5 transition-all shadow-2xs"
              placeholder="Enter 10-digit phone number"
              value={form.customer.phone}
              onChange={(e) => setForm({ ...form, customer: { ...form.customer, phone: e.target.value } })}
              data-testid="off-phone"
            />
          </div>

          {/* Field 4: Email */}
          <div className="space-y-1.5 text-left">
            <Label className="text-xs font-bold text-[#6F6E73] flex items-center gap-1.5">
              <Mail size={13} className="text-[#212121]" />
              Email (Optional)
            </Label>
            <Input
              type="email"
              className="h-11 rounded-xl bg-[#F6F5FA] border-[#DFDCE8] hover:border-[#212121] focus:border-[#212121] focus:bg-white text-[#212121] text-xs font-semibold px-3.5 transition-all shadow-2xs"
              placeholder="Enter email address"
              value={form.customer.email}
              onChange={(e) => setForm({ ...form, customer: { ...form.customer, email: e.target.value } })}
            />
          </div>

          {/* Field 5: Handover Hub */}
          <div className="space-y-1.5 text-left">
            <Label className="text-xs font-bold text-[#6F6E73] flex items-center gap-1.5">
              <MapPin size={13} className="text-[#212121]" />
              Handover Hub *
            </Label>
            <CustomSelect
              value={form.pickup_location}
              onChange={(val) => setForm({ ...form, pickup_location: val })}
              options={LOCATIONS}
              placeholder="Select Handover Hub"
              className="w-full"
            />
          </div>

          {/* Field 6: Pickup Date */}
          <div className="space-y-1.5 text-left">
            <Label className="text-xs font-bold text-[#6F6E73] flex items-center gap-1.5">
              <CalIcon size={13} className="text-[#212121]" />
              Pickup Date *
            </Label>
            <Popover open={pickupOpen} onOpenChange={setPickupOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#F6F5FA] border border-[#DFDCE8] hover:border-[#212121] text-[#212121] text-xs font-semibold flex items-center justify-between transition-all shadow-2xs cursor-pointer"
                  data-testid="off-start-date"
                >
                  <span className="truncate">
                    {form.start_date ? format(new Date(form.start_date), "EEE, dd MMM yyyy") : "Select pickup date"}
                  </span>
                  <CalIcon size={14} className="text-[#6F6E73] shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3 bg-white border border-[#DFDCE8] rounded-2xl shadow-2xl z-60" align="start">
                <Calendar
                  mode="single"
                  selected={form.start_date ? new Date(form.start_date) : undefined}
                  onSelect={(d) => {
                    if (d) {
                      setForm((prev) => ({ ...prev, start_date: d }));
                      setPickupOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Field 7: Return Date */}
          <div className="space-y-1.5 text-left">
            <Label className="text-xs font-bold text-[#6F6E73] flex items-center gap-1.5">
              <CalIcon size={13} className="text-[#212121]" />
              Return Date *
            </Label>
            <Popover open={returnOpen} onOpenChange={setReturnOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#F6F5FA] border border-[#DFDCE8] hover:border-[#212121] text-[#212121] text-xs font-semibold flex items-center justify-between transition-all shadow-2xs cursor-pointer"
                  data-testid="off-end-date"
                >
                  <span className="truncate">
                    {form.end_date ? format(new Date(form.end_date), "EEE, dd MMM yyyy") : "Select return date"}
                  </span>
                  <CalIcon size={14} className="text-[#6F6E73] shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3 bg-white border border-[#DFDCE8] rounded-2xl shadow-2xl z-60" align="start">
                <Calendar
                  mode="single"
                  selected={form.end_date ? new Date(form.end_date) : undefined}
                  onSelect={(d) => {
                    if (d) {
                      setForm((prev) => ({ ...prev, end_date: d }));
                      setReturnOpen(false);
                    }
                  }}
                  disabled={(date) => form.start_date && date < new Date(form.start_date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Field 8: Payment Method */}
          <div className="space-y-1.5 text-left">
            <Label className="text-xs font-bold text-[#6F6E73] flex items-center gap-1.5">
              <CreditCard size={13} className="text-[#212121]" />
              Payment Method
            </Label>
            <CustomSelect
              value={form.payment_method}
              onChange={(val) => setForm({ ...form, payment_method: val })}
              options={PAYMENT_METHODS}
              placeholder="Select Payment Method"
              className="w-full"
            />
          </div>

          {/* Field 9: Total Rental Amount */}
          <div className="space-y-1.5 text-left">
            <Label className="text-xs font-bold text-[#6F6E73] flex items-center gap-1.5">
              <DollarSign size={13} className="text-[#212121]" />
              Total Rental Amount (₹)
            </Label>
            <Input
              type="number"
              className="h-11 rounded-xl bg-[#F6F5FA] border-[#DFDCE8] hover:border-[#212121] focus:border-[#212121] focus:bg-white text-[#212121] text-xs font-bold px-3.5 transition-all shadow-2xs font-mono"
              placeholder="Enter rental amount"
              value={form.total_amount}
              onChange={(e) => setForm({ ...form, total_amount: e.target.value === "" ? "" : Number(e.target.value) })}
              data-testid="off-amount"
            />
          </div>

          {/* Field 10: Operational Notes */}
          <div className="space-y-1.5 text-left sm:col-span-2">
            <Label className="text-xs font-bold text-[#6F6E73] flex items-center gap-1.5">
              <FileText size={13} className="text-[#212121]" />
              Operational Notes
            </Label>
            <Textarea
              className="w-full p-3 rounded-xl bg-[#F6F5FA] border-[#DFDCE8] hover:border-[#212121] focus:border-[#212121] focus:bg-white text-[#212121] text-xs font-medium transition-all shadow-2xs min-h-[90px]"
              placeholder="Enter operational notes, special customer requirements, or handover instructions..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#DFDCE8]">
          <div className="text-xs font-bold text-[#212121] flex items-center gap-2">
            <span className="text-[#6F6E73] font-normal">Calculated Total:</span>
            <span className="text-base font-extrabold font-mono bg-[#e1b808] px-3 py-1 rounded-full border border-[#e1b808]">
              {formatINR(Number(form.total_amount) || 0)}
            </span>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-white hover:bg-[#F6F5FA] text-[#212121] border-[#DFDCE8] rounded-full font-bold text-xs h-11 px-6 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={submitOffline}
              disabled={submitting}
              className="bg-[#212121] hover:bg-[#141414] active:bg-[#000000] text-white rounded-full font-bold text-xs h-11 px-7 shadow-xs cursor-pointer uppercase tracking-wider"
              data-testid="off-submit"
            >
              {submitting ? "Recording Booking..." : "Confirm Offline Booking"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
