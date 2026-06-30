import React, { useState, useEffect } from "react";
import { X, Radio } from "lucide-react";
import { translations } from "../services/translations";

export default function UpdatePopup({ language, onViewNow }) {
  const t = translations[language || "id"];
  const [shouldRender, setShouldRender] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Check if user already saw the popup in this session
    const seen = sessionStorage.getItem("sifakta_dashboard_popup_seen");
    if (seen === "true") return;

    // Delayed rendering (1.5 seconds) to prevent lag at initial mount
    const timer = setTimeout(() => {
      setShouldRender(true);
      // Small timeout to trigger CSS transition entry
      setTimeout(() => {
        setIsActive(true);
      }, 50);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsActive(false);
    // Wait for exit transition to complete before unmounting
    setTimeout(() => {
      setShouldRender(false);
      sessionStorage.setItem("sifakta_dashboard_popup_seen", "true");
    }, 500);
  };

  const handleAction = () => {
    setIsActive(false);
    sessionStorage.setItem("sifakta_dashboard_popup_seen", "true");
    setTimeout(() => {
      setShouldRender(false);
      onViewNow();
    }, 300);
  };

  if (!shouldRender) return null;

  return (
    <div
      style={{ willChange: "transform, opacity" }}
      className={`fixed bottom-20 md:bottom-6 right-0 left-0 md:left-auto md:right-6 px-4 md:px-0 z-50 transition-all duration-500 ease-out transform ${
        isActive 
          ? "translate-y-0 opacity-100 scale-100" 
          : "translate-y-16 opacity-0 scale-95 pointer-events-none"
      }`}
    >
      <div className="w-full md:w-96 bg-[#FFFDF6]/95 backdrop-blur-lg border border-[#21302A]/12 p-4.5 rounded-2xl shadow-xl flex gap-3 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#2A3A34]/5 rounded-full blur-xl pointer-events-none" />

        {/* Icon */}
        <div className="p-2.5 rounded-xl bg-[#2A3A34]/10 text-[#2A3A34] flex-shrink-0 self-start animate-bounce">
          <Radio className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 select-none pr-3">
          <h4 className="text-xs font-bold text-[#21302A] leading-tight mb-1 font-serif">
            {t.popupUpdateTitle}
          </h4>
          <p className="text-[10.5px] text-[#5C6E60] leading-relaxed font-medium mb-3">
            {t.popupUpdateDesc}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleAction}
              className="bg-[#2A3A34] hover:bg-[#1E2B25] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all"
            >
              {t.popupUpdateAction}
            </button>
            <button
              onClick={handleDismiss}
              className="bg-[#2A3A34]/5 hover:bg-[#2A3A34]/10 text-[#2A3A34] text-[10px] font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all"
            >
              {t.popupUpdateDismiss}
            </button>
          </div>
        </div>

        {/* Close Cross */}
        <button
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 p-1 text-[#21302A]/40 hover:text-[#21302A] hover:bg-[#2A3A34]/5 rounded-lg transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
