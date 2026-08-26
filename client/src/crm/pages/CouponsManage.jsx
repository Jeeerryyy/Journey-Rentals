import React from "react";
import api, { formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/ui/skeleton";
import { format, differenceInDays } from "date-fns";
import { Plus, Pencil, Trash2, Calendar as CalIcon, Ticket, Clock, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import CustomSelect from "@/website/components/CustomSelect";

const EMPTY = {
  code: "", type: "Percentage", value: 10, min_amount: 0,
  expiry: null, active: true,
};

import ConfirmModal from "../components/common/ConfirmModal";

export default function CouponsManage() {
  const [items, setItems] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState(EMPTY);
  const [loading, setLoading] = React.useState(true);

  // In-app delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [deleteTargetId, setDeleteTargetId] = React.useState(null);
  const [deleting, setDeleting] = React.useState(false);

  // In-app delete all confirmation state
  const [deleteAllConfirmOpen, setDeleteAllConfirmOpen] = React.useState(false);
  const [deletingAll, setDeletingAll] = React.useState(false);

  const load = React.useCallback((showSpinner = false) => {
    if (showSpinner) setLoading(true);
    api.get("/api/admin/coupons")
      .then((res) => {
        const raw = res.data?.coupons || res.data?.data || res.data || res.coupons || (Array.isArray(res) ? res : []);
        const list = Array.isArray(raw) ? raw : (Array.isArray(res.data) ? res.data : []);
        setItems(list);
      })
      .catch((err) => {
        console.error("Failed to load coupons:", err);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, []);
  
  React.useEffect(() => { load(true); }, [load]);

  function openAdd() { setEditing(null); setForm({ ...EMPTY, expiry: null }); setOpen(true); }
  function openEdit(c) {
    setEditing(c);
    setForm({ ...c, expiry: c.expiry ? new Date(c.expiry) : null });
    setOpen(true);
  }
  async function save() {
    if (!form.code || !form.expiry) { toast.error("Code and expiry deadline required"); return; }
    try {
      const payload = { ...form, expiry: form.expiry.toISOString() };
      const targetId = editing?.id || editing?._id;
      if (editing && targetId) {
        await api.put(`/api/admin/coupons/${targetId}`, payload);
        toast.success("Coupon updated successfully");
      } else {
        await api.post("/api/admin/coupons", payload);
        toast.success("Coupon created successfully");
      }
      setOpen(false);
      load(false);
    } catch (e) { toast.error(formatApiError(e)); }
  }

  function promptDelete(id) {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deleteTargetId) return;
    setDeleting(true);
    // Optimistically update local state immediately so table doesn't reload/flicker
    setItems((prev) => (Array.isArray(prev) ? prev.filter((item) => item.id !== deleteTargetId && item._id !== deleteTargetId) : []));
    try {
      await api.delete(`/api/admin/coupons/${deleteTargetId}`);
      toast.success("Deleted coupon successfully");
      load(false); // Silent background sync
    } catch (e) {
      toast.error(formatApiError(e));
      load(true); // Re-sync on error
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
      setDeleteTargetId(null);
    }
  }

  async function handleConfirmDeleteAll() {
    setDeletingAll(true);
    setItems([]);
    try {
      await api.delete("/api/admin/coupons/all");
      toast.success("All coupons deleted successfully");
      load(false);
    } catch (e) {
      toast.error(formatApiError(e));
      load(true);
    } finally {
      setDeletingAll(false);
      setDeleteAllConfirmOpen(false);
    }
  }

  return (
    <div className="space-y-6 pb-12 font-body text-[#212121]">
      {/* ── TOP HEADER SECTION ── */}
      <div className="flex items-start justify-between flex-wrap gap-4 pb-2 border-b border-[#DFDCE8]">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#212121] tracking-tight flex items-center gap-2.5">
            <Ticket className="text-[#82C4B7]" size={26} /> Promotional Coupons &amp; Discounts
          </h1>
          <p className="font-mono text-xs text-[#6F6E73] mt-1 font-bold">
            Manage promo discount codes, set deadline time-spans, and track automatic coupon expirations.
          </p>
        </div>
        
        <div className="flex items-center gap-2.5">
          {items.length > 0 && (
            <Button
              onClick={() => setDeleteAllConfirmOpen(true)}
              variant="outline"
              className="border-[#E8826B]/40 hover:bg-[#E8826B]/10 text-[#C8563C] rounded-full px-4 py-2.5 h-auto text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Trash2 size={13} className="mr-1.5" /> Delete All
            </Button>
          )}
          <Button
            onClick={openAdd}
            className="bg-[#212121] hover:bg-[#212121] text-white rounded-full px-5 py-2.5 h-auto text-xs font-bold transition-all shadow-sm cursor-pointer"
            data-testid="add-coupon"
          >
            <Plus size={14} className="mr-1.5 text-[#82C4B7]" /> Create New Coupon
          </Button>
        </div>
      </div>

      {/* ── COUPONS DATA TABLE ── */}
      <div className="rounded-[2rem] border border-[#DFDCE8] bg-white overflow-hidden shadow-sm font-body">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#DFDCE8] bg-[#F6F5FA]">
              <TableHead className="text-[#6F6E73] uppercase font-mono text-[11px] font-bold tracking-wider py-4 pl-4">Coupon Code</TableHead>
              <TableHead className="text-[#6F6E73] uppercase font-mono text-[11px] font-bold tracking-wider">Discount Type</TableHead>
              <TableHead className="text-[#6F6E73] uppercase font-mono text-[11px] font-bold tracking-wider">Value</TableHead>
              <TableHead className="text-[#6F6E73] uppercase font-mono text-[11px] font-bold tracking-wider">Min Booking Fare</TableHead>
              <TableHead className="text-[#6F6E73] uppercase font-mono text-[11px] font-bold tracking-wider">Deadline / Expiry</TableHead>
              <TableHead className="text-[#6F6E73] uppercase font-mono text-[11px] font-bold tracking-wider">Status</TableHead>
              <TableHead className="text-right text-[#6F6E73] uppercase font-mono text-[11px] font-bold tracking-wider pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-[#DFDCE8]">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell className="py-4 pl-4"><Skeleton className="h-6 w-20 rounded-lg" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-4 w-20 rounded-md" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-4 w-16 rounded-md" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-4 w-14 rounded-md" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-4 w-24 rounded-md" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  <TableCell className="py-4 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Skeleton className="h-7 w-7 rounded-lg" />
                      <Skeleton className="h-7 w-7 rounded-lg" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (!Array.isArray(items) || items.length === 0) ? (
              <TableRow><TableCell colSpan={7} className="text-center text-[#6F6E73] py-12 text-xs font-mono">No promotional coupons created yet.</TableCell></TableRow>
            ) : (Array.isArray(items) ? items : []).map((c) => {
              const expDate = c.expiry ? new Date(c.expiry) : null;
              const daysLeft = expDate ? differenceInDays(expDate, new Date()) : null;
              const isExpired = c.is_expired || (expDate && expDate < new Date());

              return (
                <TableRow key={c.id} className="hover:bg-[#F6F5FA] transition-colors group" data-testid={`coupon-row-${c.code}`}>
                  {/* Code */}
                  <TableCell className="py-3.5 pl-4">
                    <span className="inline-flex items-center text-[#6F6E73] bg-[#FFFFFF] border border-[#DFDCE8] px-3 py-1 rounded-lg font-mono font-bold text-xs">
                      {c.code}
                    </span>
                  </TableCell>

                  {/* Type */}
                  <TableCell className="py-3.5 text-xs text-[#212121] font-semibold">{c.type}</TableCell>

                  {/* Value */}
                  <TableCell className="py-3.5 font-display font-extrabold text-xs text-[#212121]">
                    {c.type === "Percentage" ? `${c.value}% OFF` : `₹${c.value} OFF`}
                  </TableCell>

                  {/* Min Fare */}
                  <TableCell className="py-3.5 text-xs text-[#6F6E73] font-mono">₹{c.min_amount}</TableCell>

                  {/* Expiry */}
                  <TableCell className="py-3.5">
                    <div className="text-xs font-bold text-[#212121] flex items-center gap-1.5 font-mono">
                      <Clock size={13} className="text-[#E8826B]" />
                      {expDate ? format(expDate, "dd MMM yyyy") : "—"}
                    </div>
                    {expDate && (
                      <div className={`text-[10px] mt-0.5 font-mono font-bold ${isExpired ? "text-[#E8826B]" : daysLeft <= 3 ? "text-[#E8826B]" : "text-[#6F6E73]"}`}>
                        {isExpired ? "Expired" : daysLeft === 0 ? "Expires today!" : `${daysLeft} day(s) left`}
                      </div>
                    )}
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell className="py-3.5">
                    {isExpired ? (
                      <span className="inline-flex items-center gap-1 bg-[#E8826B]/20 text-[#C8563C] border border-[#E8826B]/40 font-mono font-bold text-[11px] rounded-full px-3 py-1">
                        <ShieldAlert size={11} /> Expired
                      </span>
                    ) : c.active ? (
                      <span className="inline-flex items-center bg-[#82C4B7]/20 text-[#82C4B7] border border-[#82C4B7]/40 font-mono font-bold text-[11px] rounded-full px-3 py-1">
                        ● Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center bg-[#FFFFFF] text-[#6F6E73] border border-[#DFDCE8] font-mono font-bold text-[11px] rounded-full px-3 py-1">
                        ● Inactive
                      </span>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-3.5 pr-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(c)} className="h-8 w-8 p-0 text-[#6F6E73] hover:text-[#212121] hover:bg-[#F6F5FA] rounded-lg">
                        <Pencil size={14}/>
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => promptDelete(c.id || c._id)} className="h-8 w-8 p-0 text-[#E8826B] hover:bg-[#E8826B]/10 rounded-lg">
                        <Trash2 size={14}/>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* ── ADD / EDIT DIALOG MODAL ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg bg-white border border-[#DFDCE8] text-[#212121] font-body rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl sm:text-2xl font-bold text-[#212121] flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#82C4B7]/20 text-[#212121] flex items-center justify-center font-bold">
                <Ticket size={18} className="text-[#212121]" />
              </div>
              <span>{editing ? "Edit Coupon Code" : "Create New Coupon Code"}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 text-xs font-body">
            <div className="sm:col-span-2 space-y-1.5 text-left">
              <Label className="text-xs font-bold text-[#6F6E73]">Coupon Code *</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({...form, code: e.target.value.toUpperCase()})}
                className="h-11 rounded-xl bg-[#F6F5FA] border-[#DFDCE8] hover:border-[#212121] focus:border-[#212121] focus:bg-white text-[#212121] font-mono font-bold uppercase px-3.5 text-xs transition-all"
                placeholder="Enter coupon code (e.g. MONSOON20)"
                data-testid="cp-code"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <Label className="text-xs font-bold text-[#6F6E73]">Discount Type</Label>
              <CustomSelect
                value={form.type}
                onChange={(val) => setForm({...form, type: val})}
                options={[
                  { value: "Percentage", label: "Percentage (%)" },
                  { value: "Fixed", label: "Fixed Amount (₹)" },
                ]}
                placeholder="Select Type"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <Label className="text-xs font-bold text-[#6F6E73]">Discount Value {form.type === "Percentage" ? "(%)" : "(₹)"}</Label>
              <Input
                type="number"
                value={form.value}
                onChange={(e) => setForm({...form, value: e.target.value === "" ? "" : Number(e.target.value)})}
                className="h-11 rounded-xl bg-[#F6F5FA] border-[#DFDCE8] hover:border-[#212121] focus:border-[#212121] focus:bg-white text-[#212121] font-bold px-3.5 text-xs transition-all font-mono"
                placeholder="Enter discount value"
                data-testid="cp-value"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <Label className="text-xs font-bold text-[#6F6E73]">Min. Booking Amount (₹)</Label>
              <Input
                type="number"
                value={form.min_amount}
                onChange={(e) => setForm({...form, min_amount: e.target.value === "" ? "" : Number(e.target.value)})}
                className="h-11 rounded-xl bg-[#F6F5FA] border-[#DFDCE8] hover:border-[#212121] focus:border-[#212121] focus:bg-white text-[#212121] font-bold px-3.5 text-xs transition-all font-mono"
                placeholder="Enter min order amount"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <Label className="text-xs font-bold text-[#6F6E73]">Expiry Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#F6F5FA] border border-[#DFDCE8] hover:border-[#212121] text-[#212121] text-xs font-semibold flex items-center justify-between transition-all cursor-pointer"
                    data-testid="cp-expiry"
                  >
                    <span>{form.expiry ? format(new Date(form.expiry), "dd MMM yyyy") : "Select expiry date"}</span>
                    <CalIcon size={14} className="text-[#6F6E73] shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="p-3 w-auto bg-white border border-[#DFDCE8] rounded-2xl shadow-2xl z-60" align="start">
                  <Calendar
                    mode="single"
                    selected={form.expiry ? new Date(form.expiry) : undefined}
                    onSelect={(d) => setForm({...form, expiry: d})}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="sm:col-span-2 flex items-center justify-between p-3.5 rounded-2xl bg-[#F6F5FA] border border-[#DFDCE8] mt-2">
              <div>
                <Label className="text-xs font-bold text-[#212121]">Active Status</Label>
                <p className="text-[11px] text-[#6F6E73]">Coupon will automatically auto-expire once deadline passes.</p>
              </div>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({...form, active: v})} data-testid="cp-active"/>
            </div>
          </div>

          <DialogFooter className="mt-6 flex justify-end gap-3 pt-3 border-t border-[#DFDCE8]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="bg-white hover:bg-[#F6F5FA] text-[#212121] border-[#DFDCE8] rounded-full font-bold text-xs h-11 px-5 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={save}
              className="bg-[#212121] hover:bg-[#141414] active:bg-[#000000] text-white rounded-full font-bold text-xs h-11 px-6 shadow-xs cursor-pointer uppercase tracking-wider"
              data-testid="cp-save"
            >
              Save Coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── IN-APP DELETE SINGLE CONFIRMATION MODAL ── */}
      <ConfirmModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Promotional Coupon?"
        description="Are you sure you want to delete this coupon code? This promo code will immediately become invalid for all upcoming customer bookings."
        confirmText="Delete Coupon"
        variant="destructive"
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />

      {/* ── IN-APP DELETE ALL CONFIRMATION MODAL ── */}
      <ConfirmModal
        open={deleteAllConfirmOpen}
        onOpenChange={setDeleteAllConfirmOpen}
        title="Delete All Promotional Coupons?"
        description="Are you sure you want to delete all promotional coupons? All current coupon codes will be permanently removed and cannot be applied by customers."
        confirmText="Delete All Coupons"
        variant="destructive"
        loading={deletingAll}
        onConfirm={handleConfirmDeleteAll}
      />
    </div>
  );
}
