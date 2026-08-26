/* Journey Rentals Official Brand Logo */
import React from "react";

export default function BrandLogo({ className = "", variant = "dark", showSubtitle = true, size = "md" }) {
  const isLight = variant === "white" || variant === "light";
  const primaryText = isLight ? "#FFFFFF" : "#212121";

  const dimensionClasses =
    size === "sm"
      ? "w-8 h-8"
      : size === "lg"
      ? "w-11 h-11"
      : "w-9 h-9";

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Brand Logo Emblem */}
      <div className={`relative shrink-0 ${dimensionClasses} flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
        <img
          src="/logo.png"
          alt="Journey Rentals Solapur Logo"
          className="w-full h-full object-contain drop-shadow-2xs"
        />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col text-left leading-none justify-center">
        <div className="flex items-center gap-1">
          <span
            className="font-extrabold tracking-tight font-display text-lg sm:text-xl leading-none"
            style={{ color: primaryText }}
          >
            JOURNEY
          </span>
          <span
            className="font-extrabold tracking-tight font-display text-lg sm:text-xl leading-none text-[#212121]"
            style={{ color: isLight ? "#e1b808" : "#212121" }}
          >
            RENTALS
          </span>
        </div>
        {showSubtitle && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="h-[1px] w-2.5 bg-[#e1b808] opacity-80" />
            <span
              className="text-[9px] uppercase tracking-[0.22em] font-mono font-bold"
              style={{ color: isLight ? "#DFDCE8" : "#6F6E73" }}
            >
              SOLAPUR
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
