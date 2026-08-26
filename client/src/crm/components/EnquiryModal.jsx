import React from "react";
import api, { formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CustomSelect from "@/website/components/CustomSelect";
import { MessageSquarePlus, User, Phone, Mail, MapPin, Car, Share2, Activity, FileText } from "lucide-react";
import { toast } from "sonner";

const POPULAR_CITIES = [
  "Solapur", "Pune", "Mumbai", "Hyderabad", "Kolhapur",
  "Vijayapura", "Kalaburagi", "Latur", "Satara", "Bengaluru", "Other"
];

const SOURCES = ["Phone Call", "WhatsApp", "Walk-in", "Website", "Instagram", "Referral", "Other"];
const STATUSES = ["New", "Contacted", "Follow-up", "Converted", "Lost"];

const EMPTY = {
  customer_name: "",
  phone: "",
  email: "",
  city: "Solapur",
  custom_city: "",
  car_model_interested: "",
  source: "Phone Call",
  status: "New",
  notes: "",
};

export default function EnquiryModal({ open, onOpenChange, onSuccess }) {
  const [form, setForm] = React.useState(EMPTY);
  const [availableVehicles, setAvailableVehicles] = React.useState([]);
  const [loadingVehicles, setLoadingVehicles] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setLoadingVehicles(true);
      api.get("/api/admin/fleet")
        .then((res) => {
          const list = res.data?.vehicles || res.data || (Array.isArray(res) ? res : []);
          const available = list.filter((v) => v.isAvailable !== false);
          setAvailableVehicles(available);
          if (available.length > 0) {
            const firstName = available[0].title || `${available[0].brand || "" } ${available[0].model || ""}`.trim();
            setForm((prev) => ({ ...prev, car_model_interested: prev.car_model_interested || firstName }));
          }
        })
        .catch(() => {
          api.owner.getVehicles()
            .then((res) => {
              const list = res.vehicles || res.data || (Array.isArray(res) ? res : []);
              const available = list.filter((v) => v.isAvailable !== false);
              setAvailableVehicles(available);
              if (available.length > 0) {
                const firstName = available[0].title || `${available[0].brand || "" } ${available[0].model || ""}`.trim();
                setForm((prev) => ({ ...prev, car_model_interested: prev.car_model_interested || firstName }));
              }
            })
            .catch(() => {});
        })
        .finally(() => {
          setLoadingVehicles(false);
        });
    }
  }, [open]);

  const vehicleOptions = React.useMemo(() => {
    return availableVehicles.map((v) => {
      const name = v.title || `${v.brand || ""} ${v.model || ""}`.trim() || "Vehicle";
      const cat = v.category || (v.type === "bike" ? "Bike" : "Car");
      return {
        value: name,
        label: `${name} (${cat})`,
      };
    });
  }, [availableVehicles]);

  async function submitEnquiry() {
    const finalCity = form.city === "Other" ? form.custom_city : form.city;
    if (!form.customer_name || !form.phone || !finalCity) {
      toast.error("Please enter customer name, phone, and city");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/api/admin/enquiries", {
        ...form,
        city: finalCity,
        car_model_interested: form.car_model_interested || (vehicleOptions[0]?.value || "Self-Drive Vehicle"),
      });
      toast.success("Enquiry logged successfully!");
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
        className="max-w-2xl w-[95vw] bg-white border border-[#DFDCE8] text-[#212121] max-h-[92vh] overflow-y-auto no-scrollbar font-body rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 shadow-2xl"
        data-testid="enquiry-dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl sm:text-2xl font-bold flex items-center gap-3 text-[#212121]">
            <div className="w-10 h-10 rounded-full bg-[#E8826B]/15 text-[#E8826B] flex items-center justify-center shrink-0">
              <MessageSquarePlus size={20} />
            </div>
            <div>
              <div>Log New Customer Enquiry</div>
              <div className="text-xs font-normal text-[#6F6E73] font-body mt-0.5">
                Record self-drive car or bike lead details directly to live database
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-4 text-xs font-body">
          {/* Field 1: Customer Name */}
          <div className="space-y-1.5 text-left">
            <Label className="text-xs font-bold text-[#6F6E73] flex items-center gap-1.5">
              <User size={13} className="text-[#212121]" />
              Customer Name *
            </Label>
            <Input
              className="h-11 rounded-xl bg-[#F6F5FA] border-[#DFDCE8] hover:border-[#212121] focus:border-[#212121] focus:bg-white text-[#212121] text-xs font-semibold px-3.5 transition-all shadow-2xs"
              placeholder="Enter customer name"
              value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
              data-testid="enq-name"
            />
          </div>

          {/* Field 2: Phone Number */}
          <div className="space-y-1.5 text-left">
            <Label className="text-xs font-bold text-[#6F6E73] flex items-center gap-1.5">
              <Phone size={13} className="text-[#212121]" />
              Phone Number *
            </Label>
            <Input
              type="tel"
              className="h-11 rounded-xl bg-[#F6F5FA] border-[#DFDCE8] hover:border-[#212121] focus:border-[#212121] focus:bg-white text-[#212121] text-xs font-mono font-semibold px-3.5 transition-all shadow-2xs"
              placeholder="Enter 10-digit phone number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              data-testid="enq-phone"
            />
          </div>

          {/* Field 3: Email */}
          <div className="space-y-1.5 text-left">
            <Label className="text-xs font-bold text-[#6F6E73] flex items-center gap-1.5">
              <Mail size={13} className="text-[#212121]" />
              Email (Optional)
            </Label>
            <Input
              type="email"
              className="h-11 rounded-xl bg-[#F6F5FA] border-[#DFDCE8] hover:border-[#212121] focus:border-[#212121] focus:bg-white text-[#212121] text-xs font-semibold px-3.5 transition-all shadow-2xs"
              placeholder="Enter email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              data-testid="enq-email"
            />
          </div>

          {/* Field 4: City / Origin */}
          <div className="space-y-1.5 text-left">
            <Label className="text-xs font-bold text-[#6F6E73] flex items-center gap-1.5">
              <MapPin size={13} className="text-[#212121]" />
              City / Origin *
            </Label>
            <CustomSelect
              value={form.city}
              onChange={(val) => setForm({ ...form, city: val })}
              options={POPULAR_CITIES}
              placeholder="Select City"
              className="w-full"
            />
            {form.city === "Other" && (
              <Input
                className="mt-2 h-11 rounded-xl bg-[#F6F5FA] border-[#DFDCE8] hover:border-[#212121] focus:border-[#212121] focus:bg-white text-[#212121] text-xs font-semibold px-3.5 transition-all shadow-2xs"
                placeholder="Enter custom city name"
                value={form.custom_city}
                onChange={(e) => setForm({ ...form, custom_city: e.target.value })}
                data-testid="enq-custom-city"
              />
            )}
          </div>

          {/* Field 5: Vehicle Interested (Available Fleet Only) */}
          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-[#6F6E73] flex items-center gap-1.5">
                <Car size={13} className="text-[#212121]" />
                Vehicle Interested
              </Label>
              <span className="text-[10px] text-[#4B8039] font-bold">
                {loadingVehicles ? "Loading fleet..." : `${availableVehicles.length} Available in Fleet`}
              </span>
            </div>
            <CustomSelect
              value={form.car_model_interested}
              onChange={(val) => setForm({ ...form, car_model_interested: val })}
              options={vehicleOptions.length > 0 ? vehicleOptions : [{ value: "", label: "No Available Vehicles" }]}
              placeholder="Select Available Vehicle"
              className="w-full"
            />
          </div>

          {/* Field 6: Lead Source */}
          <div className="space-y-1.5 text-left">
            <Label className="text-xs font-bold text-[#6F6E73] flex items-center gap-1.5">
              <Share2 size={13} className="text-[#212121]" />
              Lead Source
            </Label>
            <CustomSelect
              value={form.source}
              onChange={(val) => setForm({ ...form, source: val })}
              options={SOURCES}
              placeholder="Select Source"
              className="w-full"
            />
          </div>

          {/* Field 7: Enquiry Status */}
          <div className="space-y-1.5 text-left sm:col-span-2">
            <Label className="text-xs font-bold text-[#6F6E73] flex items-center gap-1.5">
              <Activity size={13} className="text-[#212121]" />
              Enquiry Status
            </Label>
            <CustomSelect
              value={form.status}
              onChange={(val) => setForm({ ...form, status: val })}
              options={STATUSES}
              placeholder="Select Status"
              className="w-full"
            />
          </div>

          {/* Field 8: Notes / Requirements */}
          <div className="space-y-1.5 text-left sm:col-span-2">
            <Label className="text-xs font-bold text-[#6F6E73] flex items-center gap-1.5">
              <FileText size={13} className="text-[#212121]" />
              Notes / Requirements
            </Label>
            <Textarea
              className="w-full p-3 rounded-xl bg-[#F6F5FA] border-[#DFDCE8] hover:border-[#212121] focus:border-[#212121] focus:bg-white text-[#212121] text-xs font-medium transition-all shadow-2xs min-h-[90px]"
              placeholder="Enter customer travel dates, pilgrimage destination, or special requirements..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              data-testid="enq-notes"
            />
          </div>
        </div>

        <DialogFooter className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#DFDCE8]">
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
            onClick={submitEnquiry}
            disabled={submitting}
            className="bg-[#212121] hover:bg-[#141414] active:bg-[#000000] text-white rounded-full font-bold text-xs h-11 px-7 shadow-xs cursor-pointer uppercase tracking-wider"
            data-testid="enq-save"
          >
            {submitting ? "Saving…" : "Save Enquiry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
