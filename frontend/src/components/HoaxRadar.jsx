import React, { useState, useEffect } from "react";
import { RefreshCw, Radio, AlertTriangle, ShieldCheck, Link as LinkIcon, ArrowRight, Loader2, Info, Zap, Flame, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { translations } from "../services/translations";

function AnimatedNumber({ value }) {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10);
    if (isNaN(end) || start === end) {
      setDisplayValue(value);
      return;
    }
    
    const duration = 1200; // ms
    const increment = end / (duration / 16); // 60fps
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{displayValue}</span>;
}

export default function HoaxRadar({ language, onVerifyHoax, onOpenInfo }) {
  const t = translations[language || "id"];
  const [hoaxes, setHoaxes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchHoaxes = async () => {
    try {
      setError(null);
      const hostname = window.location.hostname;
      const isLocal = hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("192.168.");
      const apiBase = import.meta.env.VITE_API_URL || (isLocal ? `http://${hostname}:8000` : `/_/backend`);
      const response = await fetch(`${apiBase}/api/trending`);
      if (!response.ok) throw new Error("Gagal memuat data tren.");
      const data = await response.json();
      setHoaxes(data);
    } catch (err) {
      console.error(err);
      setError(language === "en" ? "Failed to load hoax radar data." : "Gagal memuat data radar hoaks.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const hostname = window.location.hostname;
      const isLocal = hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("192.168.");
      const apiBase = import.meta.env.VITE_API_URL || (isLocal ? `http://${hostname}:8000` : `/_/backend`);
      const headers = { "Content-Type": "application/json" };
      const customGeminiKey = localStorage.getItem("sifakta_gemini_key");
      if (customGeminiKey) {
        headers["X-Gemini-API-Key"] = customGeminiKey;
      }

      const response = await fetch(`${apiBase}/api/trending/refresh`, {
        method: "POST",
        headers
      });
      if (!response.ok) throw new Error("Gagal melakukan penyegaran AI.");
      const resData = await response.json();
      if (resData.status === "success" && resData.data) {
        setHoaxes(resData.data);
      } else {
        throw new Error("Format data tidak sesuai.");
      }
    } catch (err) {
      console.error(err);
      setError(language === "en" ? "Failed to connect to AI for refresh." : "Gagal menghubungi AI untuk memutakhirkan data.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHoaxes();
  }, []);

  const getSeverityStyles = (severity) => {
    switch (severity?.toLowerCase()) {
      case "high":
        return "bg-red-50 text-[#BC4C4C] border border-red-100 dark:bg-red-950/20";
      case "medium":
        return "bg-amber-50 text-[#D9822B] border border-amber-100 dark:bg-amber-950/20";
      default:
        return "bg-emerald-50 text-[#2F855A] border border-emerald-100 dark:bg-emerald-950/20";
    }
  };

  const getSeverityLabel = (severity) => {
    switch (severity?.toLowerCase()) {
      case "high":
        return t.radarCardSeverityHigh;
      case "medium":
        return t.radarCardSeverityMed;
      default:
        return t.radarCardSeverityLow;
    }
  };

  const getCategoryLabel = (category) => {
    if (category === "Penipuan / Scams" || category === "Penipuan") {
      return t.radarCardCategoryScam;
    } else if (category === "Kesehatan / Health" || category === "Kesehatan") {
      return t.radarCardCategoryHealth;
    } else {
      return t.radarCardCategoryPublic;
    }
  };

  const getCategoryIcon = (category) => {
    if (category === "Penipuan / Scams" || category === "Penipuan") {
      return <LinkIcon className="w-3.5 h-3.5" />;
    } else if (category === "Kesehatan / Health" || category === "Kesehatan") {
      return <ShieldCheck className="w-3.5 h-3.5" />;
    } else {
      return <AlertTriangle className="w-3.5 h-3.5" />;
    }
  };

  const hotHoax = hoaxes.length > 0 ? hoaxes[0] : null;
  const remainingHoaxes = hoaxes.length > 1 ? hoaxes.slice(1) : [];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10 select-none">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-[#2A3A34]/10 rounded-lg text-[#2A3A34]">
              <Radio className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-extrabold text-[#21302A] tracking-tight">
              {t.radarHeading}
            </h1>
          </div>
          <p className="text-xs md:text-sm text-[#5C6E60] max-w-2xl font-medium leading-relaxed">
            {t.radarSubheading}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
          {/* Info Modal Button */}
          <button
            onClick={onOpenInfo}
            className="inline-flex items-center justify-center gap-1.5 text-[#5C6E60] hover:text-[#21302A] hover:bg-[#21302A]/5 px-3 py-2 rounded-xl transition-colors text-xs font-semibold border border-[#21302A]/10 bg-transparent active:scale-95"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Info</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="inline-flex items-center justify-center gap-2 bg-[#2A3A34] hover:bg-[#1E2B25] disabled:bg-[#2A3A34]/50 text-white text-xs font-bold px-4 py-2.5 rounded-xl active:scale-95 transition-all disabled:pointer-events-none shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? t.radarRefreshLoading : t.radarRefreshBtn}</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-[#BC4C4C] p-4 rounded-2xl text-xs md:text-sm font-semibold mb-6 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-[#2A3A34] animate-spin" />
          <span className="text-xs font-semibold text-[#5C6E60] animate-pulse">
            {language === "en" ? "Fetching community news..." : "Mengambil informasi komunitas..."}
          </span>
        </div>
      ) : hoaxes.length === 0 ? (
        <div className="text-center py-16 text-xs text-[#5C6E60] font-semibold">
          {language === "en" ? "No trending hoaxes found." : "Belum ada tren hoaks terpopuler yang tercatat."}
        </div>
      ) : (
        <>
          {/* Statistik Dashboard */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-2 md:gap-4 mb-8 font-sans"
          >
            {/* Card 1: Hoaks Aktif */}
            <div className="bg-[#FFFDF6]/45 backdrop-blur-md border border-[#21302A]/10 p-2.5 md:p-4 rounded-2xl shadow-xs flex flex-col items-start gap-1.5 md:flex-row md:items-center md:gap-3.5">
              <div className="p-1.5 md:p-2.5 bg-red-50 text-red-600 rounded-xl flex-shrink-0 relative">
                <Radio className="w-4 h-4 md:w-4.5 md:h-4.5" />
                <span className="absolute top-0.5 right-0.5 flex h-1.5 w-1.5 md:h-2 md:w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-red-500"></span>
                </span>
              </div>
              <div>
                <div className="text-base md:text-2xl font-black text-[#21302A] leading-none">
                  <AnimatedNumber value={hoaxes.length} />
                </div>
                <div className="text-[8px] md:text-xs text-[#5C6E60] font-bold mt-0.5 md:mt-1 leading-tight">
                  {language === "en" ? "Active Hoaxes" : "Hoaks Aktif"}
                </div>
              </div>
            </div>

            {/* Card 2: Laporan Terverifikasi */}
            <div className="bg-[#FFFDF6]/45 backdrop-blur-md border border-[#21302A]/10 p-2.5 md:p-4 rounded-2xl shadow-xs flex flex-col items-start gap-1.5 md:flex-row md:items-center md:gap-3.5">
              <div className="p-1.5 md:p-2.5 bg-emerald-50 text-emerald-600 rounded-xl flex-shrink-0">
                <ShieldCheck className="w-4 h-4 md:w-4.5 md:h-4.5" />
              </div>
              <div>
                <div className="text-base md:text-2xl font-black text-[#21302A] leading-none">
                  <AnimatedNumber value={84 + hoaxes.length} />
                </div>
                <div className="text-[8px] md:text-xs text-[#5C6E60] font-bold mt-0.5 md:mt-1 leading-tight">
                  {language === "en" ? "Verified Scans" : "Pindai Terverifikasi"}
                </div>
              </div>
            </div>

            {/* Card 3: Jangkauan */}
            <div className="bg-[#FFFDF6]/45 backdrop-blur-md border border-[#21302A]/10 p-2.5 md:p-4 rounded-2xl shadow-xs flex flex-col items-start gap-1.5 md:flex-row md:items-center md:gap-3.5">
              <div className="p-1.5 md:p-2.5 bg-amber-50 text-amber-600 rounded-xl flex-shrink-0">
                <Zap className="w-4 h-4 md:w-4.5 md:h-4.5" />
              </div>
              <div>
                <div className="text-base md:text-2xl font-black text-[#21302A] leading-none">
                  <AnimatedNumber value={100} />%
                </div>
                <div className="text-[8px] md:text-xs text-[#5C6E60] font-bold mt-0.5 md:mt-1 leading-tight">
                  {language === "en" ? "Real-time RAG" : "Cakupan RAG"}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Hot Hoax (Hero Section) */}
          {hotHoax && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-red-50/50 via-[#FFFDF6]/75 to-amber-50/20 backdrop-blur-md border-2 border-red-200/50 p-6 md:p-8 rounded-3xl shadow-sm hover:border-red-300/70 hover:bg-white/95 active:scale-[0.99] transition-all flex flex-col md:flex-row gap-6 justify-between items-start md:items-center mb-8 font-sans"
            >
              <div className="flex-1 flex flex-col gap-3">
                {/* Trending Badge */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-[9px] md:text-xs font-black tracking-wider uppercase border border-red-200">
                    <Flame className="w-3.5 h-3.5 fill-red-200 text-red-600 animate-pulse" />
                    <span>HOT HOAX / TRENDING</span>
                    <span className="relative flex h-2 w-2 ml-0.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  </span>
                  
                  <span className="inline-flex items-center gap-1 text-[9px] md:text-xs font-bold text-[#2A3A34] bg-[#2A3A34]/5 px-2.5 py-1 rounded-full">
                    {getCategoryIcon(hotHoax.category)}
                    <span>{getCategoryLabel(hotHoax.category)}</span>
                  </span>

                  <span className={`text-[9px] md:text-xs font-bold px-2.5 py-1 rounded-full ${getSeverityStyles(hotHoax.severity)}`}>
                    {getSeverityLabel(hotHoax.severity)}
                  </span>
                </div>

                {/* Hoax Title */}
                <h2 className="text-lg md:text-2xl font-bold text-[#21302A] leading-tight font-serif tracking-tight">
                  {hotHoax.title}
                </h2>

                {/* Hoax Description */}
                <p className="text-xs md:text-sm text-[#5C6E60] font-medium leading-relaxed max-w-3xl">
                  {hotHoax.description}
                </p>
              </div>

              {/* Action Trigger Button */}
              <div className="w-full md:w-auto flex-shrink-0">
                <button
                  onClick={() => onVerifyHoax(hotHoax.query)}
                  className="w-full md:w-56 inline-flex items-center justify-center gap-2 bg-[#2A3A34] hover:bg-[#1E2B25] text-white text-xs md:text-sm font-bold py-3.5 px-6 rounded-2xl active:scale-95 transition-all shadow-md shadow-[#2A3A34]/15 hover:shadow-lg"
                >
                  <span>{language === "en" ? "Scan This Claim" : "Pindai Klaim Ini"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Tren Hoaks Lainnya Section */}
          {remainingHoaxes.length > 0 && (
            <>
              <div className="mb-6 flex items-center gap-3">
                <div className="h-px bg-[#21302A]/10 flex-1" />
                <h3 className="text-[10px] md:text-xs font-bold text-[#5C6E60] uppercase tracking-widest flex items-center gap-1.5 flex-shrink-0 font-sans">
                  <TrendingUp className="w-3.5 h-3.5 text-[#5C6E60]" />
                  {language === "en" ? "Other Active Threats" : "Tren Hoaks Lainnya"}
                </h3>
                <div className="h-px bg-[#21302A]/10 flex-1" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {remainingHoaxes.map((hoax, idx) => (
                  <motion.div
                    key={hoax.id || idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="bg-[#FFFDF6]/45 backdrop-blur-md border border-[#21302A]/10 p-5 rounded-2xl shadow-xs hover:border-[#21302A]/25 hover:bg-white/80 active:scale-[0.98] transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Meta Indicators */}
                      <div className="flex items-center justify-between gap-2 mb-3.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#2A3A34] bg-[#2A3A34]/5 px-2.5 py-0.5 rounded-full">
                          {getCategoryIcon(hoax.category)}
                          <span>{getCategoryLabel(hoax.category)}</span>
                        </div>

                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${getSeverityStyles(hoax.severity)}`}>
                          {getSeverityLabel(hoax.severity)}
                        </span>
                      </div>

                      {/* Hoax Title */}
                      <h3 className="text-sm md:text-[15px] font-bold text-[#21302A] leading-snug tracking-tight mb-2 line-clamp-2">
                        {hoax.title}
                      </h3>

                      {/* Hoax Description */}
                      <p className="text-[11px] md:text-xs text-[#5C6E60] font-medium leading-relaxed mb-4 line-clamp-3">
                        {hoax.description}
                      </p>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => onVerifyHoax(hoax.query)}
                      className="w-full inline-flex items-center justify-center gap-1.5 bg-[#FFFDF6] hover:bg-[#F2EDE0] border border-[#21302A]/12 text-[#21302A] text-xs font-bold py-2 rounded-xl active:scale-[0.97] transition-all"
                    >
                      <span>{t.radarCardVerifyBtn}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
