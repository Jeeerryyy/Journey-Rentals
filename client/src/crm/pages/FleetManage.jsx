import React, { useState, useEffect, useCallback } from "react";
import api, { formatINR, formatApiError } from "@/lib/api";
import { Plus, Pencil, Trash2, Search, Upload, Car, Bike, Check, X, Shield, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/ui/dialog";
import CustomSelect from "@/website/components/CustomSelect";
import { Skeleton } from "@/ui/skeleton";

const CAR_CATEGORIES = ["Sedan", "SUV", "Hatchback"];
const BIKE_CATEGORIES = ["Sports", "Cruiser", "Scooter"];
const FUELS = ["Petrol", "Diesel", "EV"];
const TRANSMISSIONS = ["Manual", "Automatic"];

const DEFAULT_FORM = {
  type: "car",
  brand: "",
  model: "",
  category: "Sedan",
  fuelType: "Petrol",
  transmission: "Manual",
  sittingCapacity: 5,
  pricePerDay: 2000,
  bikeSlots: {
    price24hr: 500,
  },
  image: "",
  images: [],
  features: ["Air Conditioning", "Bluetooth Audio", "Sanitized Interior"],
  isAvailable: true,
};

export default function FleetManage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [featureInput, setFeatureInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.owner.getVehicles();
      const list = res.vehicles || res.data || (Array.isArray(res) ? res : []);
      setVehicles(list);
    } catch (err) {
      toast.error("Failed to load fleet vehicles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const filteredVehicles = vehicles.filter((v) => {
    if (typeFilter !== "all" && v.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = `${v.brand || ''} ${v.model || ''} ${v.title || ''}`.toLowerCase();
      return name.includes(q) || (v.category || '').toLowerCase().includes(q);
    }
    return true;
  });

  const openAddModal = () => {
    setEditingVehicleId(null);
    setFormData(DEFAULT_FORM);
    setModalOpen(true);
  };

  const openEditModal = (v) => {
    setEditingVehicleId(v._id || v.id);
    setFormData({
      type: v.type || "car",
      brand: v.brand || "",
      model: v.model || "",
      category: v.category || (v.type === "bike" ? "Sports" : "Sedan"),
      fuelType: v.fuelType || "Petrol",
      transmission: v.transmission || "Manual",
      sittingCapacity: v.sittingCapacity || (v.type === "bike" ? 2 : 5),
      pricePerDay: v.pricePerDay || 2000,
      bikeSlots: {
        price24hr: v.bikeSlots?.price24hr || v.bikeSlots?.price12hr || v.pricePerDay || 500,
      },
      image: v.image || (v.images?.[0] || ""),
      images: v.images || [],
      features: Array.isArray(v.features) ? v.features : ["Sanitized", "GPS Tracking"],
      isAvailable: v.isAvailable !== false,
    });
    setModalOpen(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        image: reader.result,
        images: [reader.result, ...(prev.images || [])],
      }));
      toast.success("Image preview loaded");
    };
    reader.readAsDataURL(file);
  };

  const handleAddFeature = () => {
    if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, featureInput.trim()],
      }));
      setFeatureInput("");
    }
  };

  const handleRemoveFeature = (idx) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingVehicleId) {
        await api.owner.updateVehicle(editingVehicleId, formData);
        toast.success("Vehicle updated successfully!");
      } else {
        await api.owner.addVehicle(formData);
        toast.success("Vehicle added to Solapur fleet!");
      }
      setModalOpen(false);
      fetchVehicles();
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await api.owner.deleteVehicle(id);
      toast.success("Vehicle removed from fleet.");
      fetchVehicles();
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 text-left font-body text-[#212121]">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#212121]">
            Fleet Management
          </h1>
          <p className="text-xs text-[#6F6E73] mt-0.5">
            Manage cars, hourly bikes, slot rates, and availability across Solapur hubs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openAddModal}
            className="bg-[#212121] hover:bg-[#141414] text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <Plus size={14} />
            <span>Add Vehicle</span>
          </button>
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
            placeholder="Search by brand or model..."
            className="w-full h-10 pl-10 pr-3 rounded-xl bg-[#F6F5FA] border border-[#DFDCE8] text-xs font-medium text-[#212121] focus:ring-1 focus:ring-[#212121] focus:outline-none"
          />
        </div>

        {/* Type Toggle Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F6F5FA] border border-[#DFDCE8]">
          <button
            onClick={() => setTypeFilter("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              typeFilter === "all" ? "bg-[#212121] text-white shadow-2xs" : "text-[#6F6E73] hover:text-[#212121]"
            }`}
          >
            All ({vehicles.length})
          </button>
          <button
            onClick={() => setTypeFilter("car")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              typeFilter === "car" ? "bg-[#212121] text-white shadow-2xs" : "text-[#6F6E73] hover:text-[#212121]"
            }`}
          >
            Cars
          </button>
          <button
            onClick={() => setTypeFilter("bike")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              typeFilter === "bike" ? "bg-[#212121] text-white shadow-2xs" : "text-[#6F6E73] hover:text-[#212121]"
            }`}
          >
            Bikes
          </button>
        </div>
      </div>

      {/* Vehicles Table / List */}
      <div className="bg-white rounded-[24px] border border-[#DFDCE8] shadow-sm overflow-hidden">
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#DFDCE8] bg-[#F6F5FA] text-[#6F6E73] uppercase text-[10px] font-bold font-mono">
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Pricing</th>
                  <th className="py-3 px-4">Specs</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFDCE8]">
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-12 h-9 rounded-lg" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-32 rounded-md" />
                          <Skeleton className="h-3 w-16 rounded-md" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Skeleton className="h-4 w-20 rounded-md" />
                    </td>
                    <td className="py-3.5 px-4">
                      <Skeleton className="h-4 w-24 rounded-md" />
                    </td>
                    <td className="py-3.5 px-4">
                      <Skeleton className="h-3.5 w-36 rounded-md" />
                    </td>
                    <td className="py-3.5 px-4">
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Skeleton className="h-7 w-7 rounded-lg" />
                        <Skeleton className="h-7 w-7 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="p-12 text-center text-[#6F6E73] text-xs">
            No vehicles found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#DFDCE8] bg-[#F6F5FA] text-[#6F6E73] uppercase text-[10px] font-bold font-mono">
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Pricing</th>
                  <th className="py-3 px-4">Specs</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFDCE8]">
                {filteredVehicles.map((v) => {
                  const title = `${v.brand || ''} ${v.model || ''}`.trim() || v.title || "Vehicle";
                  const isB = v.type === "bike";

                  return (
                    <tr key={v._id || v.id} className="hover:bg-[#F6F5FA] transition-colors">
                      {/* Vehicle Thumbnail & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={v.image || v.images?.[0] || "/favicon.svg"}
                            alt={title}
                            className="w-12 h-9 rounded-lg object-cover border border-[#DFDCE8] bg-[#F6F5FA]"
                          />
                          <div>
                            <div className="font-bold text-[#212121]">{title}</div>
                            <div className="text-[10px] text-[#6F6E73] capitalize font-mono">
                              {v.type || "car"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 font-mono font-medium text-[#212121]">
                        {v.category || (isB ? "Sports" : "Sedan")}
                      </td>

                      {/* Pricing */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#212121]">
                        {isB ? (
                          <div className="space-y-0.5 text-[11px]">
                            <div>24h: {formatINR(v.bikeSlots?.price24hr || v.bikeSlots?.price12hr || v.pricePerDay || 500)}</div>
                          </div>
                        ) : (
                          <div>{formatINR(v.pricePerDay || 2000)}/day</div>
                        )}
                      </td>

                      {/* Specs */}
                      <td className="py-3.5 px-4 text-[11px] text-[#6F6E73]">
                        {v.fuelType || "Petrol"} • {v.transmission || "Manual"} • {v.sittingCapacity || (isB ? 2 : 5)}s
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                          v.isAvailable !== false ? "bg-[#CFDECA] text-[#4B8039]" : "bg-red-100 text-red-700"
                        }`}>
                          {v.isAvailable !== false ? "Available" : "Unavailable"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(v)}
                            className="p-1.5 rounded-lg border border-[#DFDCE8] hover:bg-white text-[#212121] cursor-pointer"
                            title="Edit Vehicle"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(v._id || v.id, title)}
                            className="p-1.5 rounded-lg border border-[#DFDCE8] hover:bg-red-50 text-[#E03131] cursor-pointer"
                            title="Delete Vehicle"
                          >
                            <Trash2 size={13} />
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

      {/* Add / Edit Vehicle Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-xl bg-white rounded-[24px] border border-[#DFDCE8] p-6 max-h-[90vh] overflow-y-auto text-left font-body">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold font-display text-[#212121]">
              {editingVehicleId ? "Edit Vehicle" : "Add Vehicle to Solapur Fleet"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Vehicle Type Toggle */}
            <div>
              <label className="block text-xs font-bold text-[#6F6E73] mb-1">Vehicle Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, type: "car", category: "Sedan", sittingCapacity: 5 }))}
                  className={`py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                    formData.type === "car" ? "bg-[#212121] text-white" : "bg-[#F6F5FA] text-[#6F6E73] border border-[#DFDCE8]"
                  }`}
                >
                  Self-Drive Car
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, type: "bike", category: "Sports", sittingCapacity: 2 }))}
                  className={`py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                    formData.type === "bike" ? "bg-[#212121] text-white" : "bg-[#F6F5FA] text-[#6F6E73] border border-[#DFDCE8]"
                  }`}
                >
                  Hourly / Daily Bike
                </button>
              </div>
            </div>

            {/* Brand & Model */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#6F6E73] mb-1">Brand</label>
                <input
                  type="text"
                  required
                  value={formData.brand}
                  onChange={(e) => setFormData(p => ({ ...p, brand: e.target.value }))}
                  placeholder="Enter vehicle brand"
                  className="w-full h-10 px-3 rounded-xl bg-[#F6F5FA] border border-[#DFDCE8] text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6F6E73] mb-1">Model</label>
                <input
                  type="text"
                  required
                  value={formData.model}
                  onChange={(e) => setFormData(p => ({ ...p, model: e.target.value }))}
                  placeholder="Enter vehicle model"
                  className="w-full h-10 px-3 rounded-xl bg-[#F6F5FA] border border-[#DFDCE8] text-xs font-medium"
                />
              </div>
            </div>

            {/* Category & Fuel */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#6F6E73] mb-1">Category</label>
                <CustomSelect
                  value={formData.category}
                  onChange={(val) => setFormData(p => ({ ...p, category: val }))}
                  options={formData.type === "bike" ? BIKE_CATEGORIES : CAR_CATEGORIES}
                  placeholder="Select Category"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6F6E73] mb-1">Fuel Type</label>
                <CustomSelect
                  value={formData.fuelType}
                  onChange={(val) => setFormData(p => ({ ...p, fuelType: val }))}
                  options={FUELS}
                  placeholder="Select Fuel"
                />
              </div>
            </div>

            {/* Pricing Section */}
            {formData.type === "car" ? (
              <div>
                <label className="block text-xs font-bold text-[#6F6E73] mb-1">Price Per Day (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="Enter daily rate"
                  value={formData.pricePerDay}
                  onChange={(e) => setFormData(p => ({ ...p, pricePerDay: e.target.value === "" ? "" : Number(e.target.value) }))}
                  className="w-full h-10 px-3 rounded-xl bg-[#F6F5FA] border border-[#DFDCE8] text-xs font-medium font-mono"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-[#6F6E73] mb-1">24hr Slot Rate (₹)</label>
                <input
                  type="number"
                  placeholder="500"
                  value={formData.bikeSlots.price24hr}
                  onChange={(e) => {
                    const val = e.target.value === "" ? "" : Number(e.target.value);
                    setFormData(p => ({
                      ...p,
                      pricePerDay: val,
                      bikeSlots: { ...p.bikeSlots, price24hr: val, price12hr: val }
                    }));
                  }}
                  className="w-full h-10 px-3 rounded-xl bg-[#F6F5FA] border border-[#DFDCE8] text-xs font-medium font-mono"
                />
              </div>
            )}

            {/* Image Upload */}
            <div>
              <label className="block text-xs font-bold text-[#6F6E73] mb-1">Vehicle Photo</label>
              <div className="flex items-center gap-3">
                {formData.image && (
                  <img src={formData.image} alt="Preview" className="w-16 h-12 rounded-xl object-cover border border-[#DFDCE8]" />
                )}
                <label className="flex-1 py-2.5 px-3 rounded-xl border border-dashed border-[#212121] hover:bg-[#F6F5FA] text-center text-xs font-bold text-[#212121] cursor-pointer">
                  <span>Upload Image (JPG/PNG)</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Features Tags */}
            <div>
              <label className="block text-xs font-bold text-[#6F6E73] mb-1">Key Features</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="Enter key vehicle features"
                  className="flex-1 h-9 px-3 rounded-xl bg-[#F6F5FA] border border-[#DFDCE8] text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="px-3 rounded-xl bg-[#212121] text-white text-xs font-bold"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.features.map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F6F5FA] border border-[#DFDCE8] text-[11px]">
                    {f}
                    <button type="button" onClick={() => handleRemoveFeature(i)} className="text-[#6F6E73] hover:text-[#E03131]">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-[#DFDCE8] flex gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-full border border-[#DFDCE8] text-xs font-bold text-[#6F6E73] hover:bg-[#F6F5FA]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 rounded-full bg-[#212121] hover:bg-[#141414] text-white font-bold text-xs uppercase tracking-wider"
              >
                {saving ? "Saving..." : editingVehicleId ? "Update Vehicle" : "Add to Fleet"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
