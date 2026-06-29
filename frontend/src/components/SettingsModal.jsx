import React, { useState, useEffect } from "react";
import { X, ShieldAlert, Key, Trash2, Eye, EyeOff, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { verifyGeminiKey, verifyHfToken } from "../services/api";
import { translations } from "../services/translations";

export function SettingsModal({ isOpen, onClose, onClearHistory, language, onLanguageChange }) {
  const [activeTab, setActiveTab] = useState("umum");
  const [geminiKey, setGeminiKey] = useState("");
  const [hfToken, setHfToken] = useState("");
  
  const [showGemini, setShowGemini] = useState(false);
  const [showHf, setShowHf] = useState(false);
  
  const [geminiStatus, setGeminiStatus] = useState(null); // 'loading', 'success', 'error', null
  const [hfStatus, setHfStatus] = useState(null);
  
  const [geminiError, setGeminiError] = useState("");
  const [hfError, setHfError] = useState("");
  
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const t = translations[language || "id"];

  // Load keys from localStorage on mount
  useEffect(() => {
    if (isOpen) {
      setGeminiKey(localStorage.getItem("sifakta_gemini_key") || "");
      setHfToken(localStorage.getItem("sifakta_hf_token") || "");
      setGeminiStatus(localStorage.getItem("sifakta_gemini_key") ? "success" : null);
      setHfStatus(localStorage.getItem("sifakta_hf_token") ? "success" : null);
      setGeminiError("");
      setHfError("");
      setShowConfirmClear(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerifyGemini = async () => {
    if (!geminiKey.trim()) {
      localStorage.removeItem("sifakta_gemini_key");
      setGeminiStatus(null);
      return;
    }
    setGeminiStatus("loading");
    setGeminiError("");
    try {
      await verifyGeminiKey(geminiKey.trim());
      localStorage.setItem("sifakta_gemini_key", geminiKey.trim());
      setGeminiStatus("success");
    } catch (err) {
      setGeminiStatus("error");
      setGeminiError(err.message || t.verifyKeyFailed);
    }
  };

  const handleVerifyHf = async () => {
    if (!hfToken.trim()) {
      localStorage.removeItem("sifakta_hf_token");
      setHfStatus(null);
      return;
    }
    setHfStatus("loading");
    setHfError("");
    try {
      await verifyHfToken(hfToken.trim());
      localStorage.setItem("sifakta_hf_token", hfToken.trim());
      setHfStatus("success");
    } catch (err) {
      setHfStatus("error");
      setHfError(err.message || t.verifyTokenFailed);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none animate-fadeIn">
      <div 
        className="bg-[#FFFDF6] border border-[#21302A]/10 w-full max-w-lg rounded-2xl shadow-[0_16px_48px_rgba(33,48,42,0.12)] overflow-hidden flex flex-col max-h-[90dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#21302A]/8 flex items-center justify-between bg-[#F4F7F6]">
          <h3 className="font-semibold text-lg text-[#21302A]">{t.settingsTitle}</h3>
          <button 
            onClick={onClose}
            className="text-[#5C6E60] hover:text-[#21302A] p-1.5 hover:bg-[#21302A]/5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#21302A]/8 bg-[#EFF3F1]">
          <button 
            onClick={() => setActiveTab("umum")}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer
              ${activeTab === "umum" 
                ? "border-[#21302A] text-[#21302A] bg-[#FFFDF6]" 
                : "border-transparent text-[#5C6E60] hover:bg-[#21302A]/3"}`}
          >
            {t.tabGeneral}
          </button>
          <button 
            onClick={() => setActiveTab("kunci")}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer
              ${activeTab === "kunci" 
                ? "border-[#21302A] text-[#21302A] bg-[#FFFDF6]" 
                : "border-transparent text-[#5C6E60] hover:bg-[#21302A]/3"}`}
          >
            {t.tabKeys}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 flex-1 overflow-y-auto font-sans">
          {activeTab === "umum" && (
            <div className="space-y-6">
              {/* Language Switcher */}
              <div className="border-b border-[#21302A]/8 pb-6">
                <h4 className="font-bold text-[#21302A] text-sm mb-1.5">{t.langSection}</h4>
                <p className="text-xs text-[#5C6E60] mb-4 leading-relaxed font-medium">
                  {t.langDesc}
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => onLanguageChange("id")}
                    className={`flex-1 py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95
                      ${language === "id" 
                        ? "border-[#21302A] bg-[#21302A] text-white shadow-sm" 
                        : "border-[#21302A]/10 bg-white text-[#5C6E60] hover:bg-[#21302A]/5"}`}
                  >
                    {t.langId}
                  </button>
                  <button 
                    onClick={() => onLanguageChange("en")}
                    className={`flex-1 py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95
                      ${language === "en" 
                        ? "border-[#21302A] bg-[#21302A] text-white shadow-sm" 
                        : "border-[#21302A]/10 bg-white text-[#5C6E60] hover:bg-[#21302A]/5"}`}
                  >
                    {t.langEn}
                  </button>
                </div>
              </div>

              {/* History Clearance */}
              <div>
                <h4 className="font-bold text-[#21302A] text-sm mb-2">{t.historySection}</h4>
                <p className="text-xs text-[#5C6E60] mb-4 leading-relaxed font-medium">
                  {t.historyDesc}
                </p>
                
                {showConfirmClear ? (
                  <div className="bg-[#FDF3F3] border border-red-200 rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-start gap-2.5">
                      <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-[#7F201C] font-semibold">
                        {t.confirmClear}
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => setShowConfirmClear(false)}
                        className="px-3 py-1.5 rounded-lg border border-[#21302A]/10 text-xs font-semibold hover:bg-white text-[#5C6E60] cursor-pointer"
                      >
                        {t.cancel}
                      </button>
                      <button 
                        onClick={() => {
                          onClearHistory();
                          setShowConfirmClear(false);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {t.confirmDelete}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowConfirmClear(true)}
                    className="flex items-center gap-2 border border-red-200 hover:border-red-300 text-red-600 bg-red-50/50 hover:bg-red-50/80 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none active:scale-[0.98]"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t.clearHistoryBtn}
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === "kunci" && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-[11px] text-amber-800 leading-relaxed font-medium">
                💡 <strong>{t.securityNoteTitle}</strong> {t.securityNoteDesc}
              </div>

              {/* Gemini API Key */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 font-bold text-[#21302A] text-sm">
                  <Key className="w-4 h-4 text-[#5C6E60]" />
                  Google Gemini API Key
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      type={showGemini ? "text" : "password"} 
                      placeholder={t.geminiPlaceholder} 
                      value={geminiKey}
                      onChange={(e) => {
                        setGeminiKey(e.target.value);
                        setGeminiStatus(null);
                        setGeminiError("");
                      }}
                      className="w-full bg-[#F4F7F6] text-[#21302A] text-xs px-3.5 py-3 rounded-xl border border-[#21302A]/10 outline-none focus:border-[#21302A]/30 transition-all pr-10"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowGemini(!showGemini)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5C6E60] hover:text-[#21302A] cursor-pointer"
                    >
                      {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button 
                    onClick={handleVerifyGemini}
                    disabled={geminiStatus === "loading"}
                    className="bg-[#21302A] hover:bg-[#2F4236] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-xs px-4 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all select-none cursor-pointer active:scale-95 flex-shrink-0"
                  >
                    {geminiStatus === "loading" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {t.connectBtn}
                  </button>
                </div>
                
                {/* Gemini Status Indicator */}
                {geminiStatus === "success" && (
                  <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                    {t.connectedSecure}
                  </div>
                )}
                {geminiStatus === "error" && (
                  <div className="text-[11px] text-red-600 font-medium flex items-start gap-1 mt-1 leading-tight bg-red-50 border border-red-100 p-2.5 rounded-lg">
                    <XCircle className="w-3.5 h-3.5 fill-current flex-shrink-0 mt-0.5" />
                    <span>{geminiError}</span>
                  </div>
                )}
              </div>

              {/* Hugging Face Token */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 font-bold text-[#21302A] text-sm">
                  <Key className="w-4 h-4 text-[#5C6E60]" />
                  Hugging Face Token
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      type={showHf ? "text" : "password"} 
                      placeholder="hf_..." 
                      value={hfToken}
                      onChange={(e) => {
                        setHfToken(e.target.value);
                        setHfStatus(null);
                        setHfError("");
                      }}
                      className="w-full bg-[#F4F7F6] text-[#21302A] text-xs px-3.5 py-3 rounded-xl border border-[#21302A]/10 outline-none focus:border-[#21302A]/30 transition-all pr-10"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowHf(!showHf)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5C6E60] hover:text-[#21302A] cursor-pointer"
                    >
                      {showHf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button 
                    onClick={handleVerifyHf}
                    disabled={hfStatus === "loading"}
                    className="bg-[#21302A] hover:bg-[#2F4236] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-xs px-4 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all select-none cursor-pointer active:scale-95 flex-shrink-0"
                  >
                    {hfStatus === "loading" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {t.connectBtn}
                  </button>
                </div>
                
                {/* HF Status Indicator */}
                {hfStatus === "success" && (
                  <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                    {t.connectedSecure}
                  </div>
                )}
                {hfStatus === "error" && (
                  <div className="text-[11px] text-red-600 font-medium flex items-start gap-1 mt-1 leading-tight bg-red-50 border border-red-100 p-2.5 rounded-lg">
                    <XCircle className="w-3.5 h-3.5 fill-current flex-shrink-0 mt-0.5" />
                    <span>{hfError}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
