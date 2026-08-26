/* Brex / Urbanist Custom Floating Select Dropdown */
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function CustomSelect({
  value,
  onChange,
  options = [],
  icon: Icon,
  placeholder = "Select Option",
  className = "",
  align = "left",
}) {
  const [open, setOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const containerRef = useRef(null);

  // Auto-detect whether to open upwards or downwards based on viewport/container space
  useEffect(() => {
    if (open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < 220 && spaceAbove > 160) {
        setOpenUpwards(true);
      } else {
        setOpenUpwards(false);
      }
    }
  }, [open]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const selectedOption = options.find((opt) =>
    typeof opt === "string" ? opt === value : opt.value === value
  );

  const displayLabel = selectedOption
    ? typeof selectedOption === "string"
      ? selectedOption
      : selectedOption.label
    : placeholder;

  const isPlaceholder = !selectedOption;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full bg-[#F6F5FA] border border-[#DFDCE8] hover:border-[#212121] rounded-xl sm:rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-medium text-[#212121] outline-none h-12 transition-all flex items-center justify-between gap-2 cursor-pointer select-none text-left shadow-2xs ${
          open ? "border-[#212121] ring-2 ring-[#212121]/10 bg-white" : ""
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          {Icon && <Icon size={15} className="text-[#3F5F8C] shrink-0" />}
          <span className={`truncate ${isPlaceholder ? "text-[#6F6E73] font-normal" : "text-[#212121] font-semibold"}`}>
            {displayLabel}
          </span>
        </div>
        <ChevronDown
          size={15}
          className={`text-[#6F6E73] shrink-0 transition-transform duration-200 ${
            open ? "rotate-180 text-[#212121]" : ""
          }`}
        />
      </button>

      {/* Floating Menu Popover */}
      {open && (
        <div
          className={`absolute ${openUpwards ? "bottom-full mb-1.5" : "top-full mt-1.5"} z-50 min-w-full bg-white border border-[#DFDCE8] rounded-[20px] shadow-xl shadow-black/10 p-1.5 max-h-64 overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-150 ${
            align === "right" ? "right-0" : "left-0"
          }`}
          role="listbox"
        >
          <div className="space-y-0.5">
            {options.map((opt) => {
              const optVal = typeof opt === "string" ? opt : opt.value;
              const optLabel = typeof opt === "string" ? opt : opt.label;
              const isSelected = optVal === value;

              return (
                <button
                  key={optVal}
                  type="button"
                  onClick={() => {
                    onChange(optVal);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all text-left cursor-pointer ${
                    isSelected
                      ? "bg-[#212121] text-white shadow-2xs"
                      : "text-[#212121] hover:bg-[#F6F5FA] hover:text-[#212121]"
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="truncate pr-2">{optLabel}</span>
                  {isSelected && (
                    <Check size={14} className="text-[#e1b808] shrink-0 stroke-[2.5]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
