import React from "react";
import { Menu, X, Info } from "lucide-react";
import { translations } from "../services/translations";
import { motion } from "motion/react";

const jellyVariants = {
  visible: {
    x: "-50%",
    y: 0,
    opacity: 1,
    scaleY: 1,
    scaleX: 1,
    transition: {
      type: "spring",
      stiffness: 280,
      damping: 15,
      mass: 0.6
    }
  },
  hidden: {
    x: "-50%",
    y: -70,
    opacity: 0,
    scaleY: 0.6,   // Menghasilkan efek peregangan jelly vertikal saat meluncur ke atas
    scaleX: 0.94,  // Sedikit menyempit secara horizontal
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 20,
      mass: 0.5
    }
  }
};

export function MobileTopBar({ isOpen, onToggleMenu, currentView, onOpenInfo, language }) {
  const t = translations[language || "id"];

  const getTitle = () => {
    if (currentView === "chat") return t.title;
    if (currentView === "detector") return language === "en" ? "AI Detector" : "Detektor AI";
    return t.title;
  };

  return (
    <>
      {/* Top Safe Area Mask to hide scrolling text above the capsule */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-3.5 bg-[#FFFDF6] z-20" />

      <motion.div 
        variants={jellyVariants}
        initial="visible"
        animate={isOpen ? "hidden" : "visible"}
        style={{ 
          WebkitBackdropFilter: "blur(24px)",
          left: "50%"
        }}
        className="lg:hidden fixed top-3.5 w-[calc(100%-1.75rem)] max-w-md h-[48px] rounded-full z-30 flex items-center justify-between px-3 select-none bg-white/40 backdrop-blur-xl border border-[#21302A]/12 shadow-[0_12px_28px_rgba(33,48,42,0.08),_inset_0_1px_1px_rgba(255,255,255,0.9)] transform-gpu"
      >
        {/* Left: Hamburger menu toggle */}
        <button 
          onClick={onToggleMenu}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#21302A]/70 hover:bg-[#21302A]/5 hover:text-[#21302A] active:scale-95 transition-all cursor-pointer"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Middle: Brand/View title */}
        <span className="font-f1 text-[#21302A] text-lg font-bold tracking-wide select-none">
          {getTitle()}
        </span>

        {/* Right: Info modal trigger */}
        <button 
          onClick={onOpenInfo}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#21302A]/70 hover:bg-[#21302A]/5 hover:text-[#21302A] active:scale-95 transition-all cursor-pointer"
          aria-label="Open information"
        >
          <Info className="w-5 h-5" />
        </button>
      </motion.div>
    </>
  );
}
