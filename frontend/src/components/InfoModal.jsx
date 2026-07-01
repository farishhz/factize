import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Brain, Zap, Globe, Cpu, ScanLine, FileSearch, AlertTriangle, Info, Radio } from "lucide-react";
import { translations } from "../services/translations";

export function InfoModal({ isOpen, onClose, currentView, language }) {
  const [hasReadToBottom, setHasReadToBottom] = useState(false);
  const [activeTab, setActiveTab] = useState('visual');
  const scrollRef = useRef(null);
  const t = translations[language || "id"];

  const handleScroll = () => {
    const element = scrollRef.current;
    if (element) {
      // Ditambah offset 10px untuk sensitivitas gulir di layar sentuh mobile
      const isBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 10;
      if (isBottom) {
        setHasReadToBottom(true);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      setHasReadToBottom(false);
      // Cek apakah konten sudah langsung muat di viewport tanpa perlu scroll
      setTimeout(() => {
        const element = scrollRef.current;
        if (element) {
          if (element.scrollHeight <= element.clientHeight + 15) {
            setHasReadToBottom(true);
          }
        }
      }, 150);
    }
  }, [isOpen, currentView]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 transform-gpu">
          {/* Backdrop Blur dengan optimasi render GPU */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-[#17221E]/60 backdrop-blur-[4px] pointer-events-auto"
            onClick={onClose}
          />

          {/* Modal Sheet / Body */}
          <motion.div
            // Menggunakan slide-up di mobile (< 768px) dan zoom di desktop
            initial={
              window.innerWidth < 768 
                ? { y: "100%", opacity: 0.9 } 
                : { scale: 0.96, opacity: 0, y: 10 }
            }
            animate={
              window.innerWidth < 768 
                ? { y: 0, opacity: 1 } 
                : { scale: 1, opacity: 1, y: 0 }
            }
            exit={
              window.innerWidth < 768 
                ? { y: "100%", opacity: 0.9 } 
                : { scale: 0.96, opacity: 0, y: 10 }
            }
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#FFFDF6] border-t border-x border-[#21302A]/10 md:border md:border-[#21302A]/10 shadow-[0_20px_50px_rgba(33,48,42,0.15)] 
              w-full max-w-lg overflow-hidden flex flex-col pointer-events-auto z-10 font-sans transform-gpu
              rounded-t-[32px] max-h-[85vh] p-6 pb-8
              md:rounded-3xl md:max-h-[80vh] md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab handle visual indicator untuk mobile */}
            <div className="md:hidden w-12 h-1.5 bg-[#21302A]/10 rounded-full mx-auto mb-5 flex-shrink-0" />

            {currentView === 'chat' && (
              <>
                {/* Header Chat */}
                <div className="flex items-center gap-4 mb-5 border-b border-[#21302A]/10 pb-4">
                  <div className="p-3 bg-[#E5EBE8] text-[#21302A] rounded-2xl shadow-sm flex-shrink-0">
                    <Brain className="w-6.5 h-6.5 text-[#6366F1]" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-xl text-[#21302A] leading-tight">{t.chatGuideTitle}</h3>
                    <p className="text-xs text-[#5C6E60] mt-0.5">{t.chatGuideSub}</p>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div 
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className="text-[#5C6E60] text-[14px] leading-relaxed space-y-4 overflow-y-auto sidebar-scroll pr-2 flex-1 scrollbar-thin touch-pan-y"
                >
                  <p>{t.chatGuideIntro}</p>

                  <div className="space-y-3">
                    <div className="bg-white p-3.5 rounded-2xl border border-[#21302A]/5 shadow-sm">
                      <h4 className="font-bold text-[#21302A] flex items-center gap-2 mb-1">
                        <Zap className="w-4.5 h-4.5 text-amber-500" fill="currentColor"/> {t.modelFlashTitle}
                      </h4>
                      <p className="text-xs text-[#5C6E60] leading-normal">{t.modelFlashDesc}</p>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-[#21302A]/5 shadow-sm">
                      <h4 className="font-bold text-[#21302A] flex items-center gap-2 mb-1">
                        <Brain className="w-4.5 h-4.5 text-[#6366F1]"/> {t.modelProTitle}
                      </h4>
                      <p className="text-xs text-[#5C6E60] leading-normal">{t.modelProDesc}</p>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-[#21302A]/5 shadow-sm">
                      <h4 className="font-bold text-[#21302A] flex items-center gap-2 mb-1">
                        <Globe className="w-4.5 h-4.5 text-blue-500"/> {t.webSearchTitle}
                      </h4>
                      <p className="text-xs text-[#5C6E60] leading-normal">{t.webSearchDesc}</p>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-[#21302A]/5 shadow-sm">
                      <h4 className="font-bold text-[#21302A] flex items-center gap-2 mb-1">
                        <Cpu className="w-4.5 h-4.5 text-emerald-600"/> {t.typoTitle}
                      </h4>
                      <p className="text-xs text-[#5C6E60] leading-normal">{t.typoDesc}</p>
                    </div>
                  </div>

                  <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-2xl flex gap-3 text-amber-950 shadow-inner">
                    <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-bold text-[13px] text-amber-850 mb-1">{t.memoryTitle}</h4>
                      <p className="text-[11px] leading-relaxed text-amber-900/85">{t.memoryDesc}</p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-5 pt-4 border-t border-[#21302A]/10">
                  <button 
                    disabled={!hasReadToBottom}
                    onClick={onClose}
                    className={`w-full py-3 rounded-2xl font-semibold transition-all duration-200 shadow-md ${
                      hasReadToBottom 
                        ? 'bg-[#21302A] text-[#FFFDF6] hover:bg-[#2F443C] active:scale-[0.98] cursor-pointer shadow-[#21302A]/10' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {hasReadToBottom ? t.agreeChat : t.agreeScroll}
                  </button>
                </div>
              </>
            )}

            {currentView === 'radar' && (
              <>
                {/* Header Radar */}
                <div className="flex items-center gap-4 mb-5 border-b border-[#21302A]/10 pb-4">
                  <div className="p-3 bg-[#E5EBE8] text-[#21302A] rounded-2xl shadow-sm flex-shrink-0">
                    <Radio className="w-6.5 h-6.5 text-[#2A3A34]" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-xl text-[#21302A] leading-tight">{t.radarGuideTitle}</h3>
                    <p className="text-xs text-[#5C6E60] mt-0.5">{t.radarGuideSub}</p>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div 
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className="text-[#5C6E60] text-[14px] leading-relaxed space-y-4 overflow-y-auto sidebar-scroll pr-2 flex-1 scrollbar-thin touch-pan-y"
                >
                  <p>{t.radarGuideIntro}</p>

                  <div className="space-y-3">
                    <div className="bg-white p-3.5 rounded-2xl border border-[#21302A]/5 shadow-sm">
                      <h4 className="font-bold text-[#21302A] flex items-center gap-2 mb-1">
                        <Cpu className="w-4.5 h-4.5 text-[#2A3A34]" /> {t.radarGuideCard1Title}
                      </h4>
                      <p className="text-xs text-[#5C6E60] leading-normal">{t.radarGuideCard1Desc}</p>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-[#21302A]/5 shadow-sm">
                      <h4 className="font-bold text-[#21302A] flex items-center gap-2 mb-1">
                        <Globe className="w-4.5 h-4.5 text-blue-500" /> {t.radarGuideCard2Title}
                      </h4>
                      <p className="text-xs text-[#5C6E60] leading-normal">{t.radarGuideCard2Desc}</p>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-[#21302A]/5 shadow-sm">
                      <h4 className="font-bold text-[#21302A] flex items-center gap-2 mb-1">
                        <Zap className="w-4.5 h-4.5 text-amber-500" fill="currentColor" /> {t.radarGuideCard3Title}
                      </h4>
                      <p className="text-xs text-[#5C6E60] leading-normal">{t.radarGuideCard3Desc}</p>
                    </div>
                  </div>

                  <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-2xl flex gap-3 text-amber-950 shadow-inner">
                    <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-bold text-[13px] text-amber-850 mb-1">{t.radarTipTitle}</h4>
                      <p className="text-[11px] leading-relaxed text-amber-900/85">{t.radarTipDesc}</p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-5 pt-4 border-t border-[#21302A]/10">
                  <button 
                    disabled={!hasReadToBottom}
                    onClick={onClose}
                    className={`w-full py-3 rounded-2xl font-semibold transition-all duration-200 shadow-md ${
                      hasReadToBottom 
                        ? 'bg-[#21302A] text-[#FFFDF6] hover:bg-[#2F443C] active:scale-[0.98] cursor-pointer shadow-[#21302A]/10' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {hasReadToBottom ? t.agreeRadar : t.agreeScroll}
                  </button>
                </div>
              </>
            )}

            {currentView === 'detector' && (() => {
              const isEn = (language || "id") === "en";
              const labelPixelForensics = isEn ? "Pixel Forensics" : "Forensik Piksel";
              const labelTextOcr = isEn ? "Text & OCR Forensics" : "Forensik Teks & OCR";
              
              const titleCameraGenuine = isEn ? "Genuine Camera Photo" : "Foto Kamera Asli";
              const descCameraGenuine = isEn 
                ? "Selfie or scenery photo captured directly by a phone camera. Natural lens noise and uniform compression. (Result: Genuine / Safe)."
                : "Foto selfie atau pemandangan murni jepretan kamera HP fisik. Memiliki tingkat noise lensa alami dan kompresi seragam (Terdeteksi Asli / Aman).";
                
              const titleCameraAi = isEn ? "Edited or AI Generated" : "Foto Rekayasa / AI";
              const descCameraAi = isEn
                ? "An edited image (e.g. adding Cristiano Ronaldo next to you) or AI generated (Midjourney/DALL-E). Uneven pixel signatures. (Result: Indicated AI / Manipulated)."
                : "Foto hasil suntingan (seperti menambahkan Ronaldo di sebelah Anda) atau gambar generatif buatan AI. Piksel terdeteksi janggal (Terdeteksi Terindikasi AI / Rekayasa).";

              const titleScreenshotSection = isEn ? "1. Screenshots (Chat / News)" : "1. Tangkapan Layar (Chat / Berita)";
              const titleNewsOcr = isEn ? "News Screenshot Example" : "Screenshot Berita Digital";
              const descNewsOcr = isEn
                ? "A screenshot of a news article. The system verifies if the headline and date exist in official national news portals."
                : "Screenshot portal berita digital. Sistem melakukan penelusuran web real-time untuk memverifikasi apakah berita tersebut nyata atau hoaks.";
                
              const titleChatOcr = isEn ? "Chat Screenshot Example" : "Screenshot Chat WA";
              const descChatOcr = isEn
                ? "WhatsApp/Telegram chat logs. The system checks for rumors or text edits to detect falsified chat evidence."
                : "Tangkapan layar riwayat chat. Sistem memverifikasi rumor percakapan atau suntingan teks palsu pada riwayat chat.";

              const titleOfficialDoc = isEn ? "2. Official Documents (PDF / Letters)" : "2. Dokumen Resmi (PDF / Surat Keputusan)";
              const descOfficialDoc = isEn
                ? "Government policies, regulation PDFs, ministerial letters, or official contracts. The system extracts clauses and compares them with the official legal database to identify altered, redacted, or twisted paragraphs."
                : "Surat keputusan negara, peraturan pemerintah, undang-undang (PDF), atau surat edaran resmi. Sistem mengekstrak isi pasal dan memverifikasi kesesuaian kata dengan regulasi asli guna mendeteksi pemelintiran pasal secara sepihak.";

              return (
                <>
                  {/* Header Detector */}
                  <div className="flex items-center gap-4 mb-5 border-b border-[#21302A]/10 pb-4 flex-shrink-0">
                    <div className="p-3 bg-[#E5EBE8] text-[#21302A] rounded-2xl shadow-sm flex-shrink-0">
                      <ScanLine className="w-6.5 h-6.5 text-[#21302A]" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-xl text-[#21302A] leading-tight">{t.detectorGuideTitle}</h3>
                      <p className="text-xs text-[#5C6E60] mt-0.5">{t.detectorGuideSub}</p>
                    </div>
                  </div>

                  {/* Segmented Control Tab Bar */}
                  <div className="flex bg-[#E5EBE8] p-1 rounded-xl mb-4 font-sans flex-shrink-0">
                    <button
                      onClick={() => {
                        setActiveTab('visual');
                        setHasReadToBottom(false);
                      }}
                      className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs md:text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                        activeTab === 'visual'
                          ? 'bg-[#21302A] text-[#FFFDF6] shadow-sm'
                          : 'text-[#5C6E60] hover:text-[#21302A]'
                      }`}
                    >
                      <Cpu className="w-4 h-4" />
                      {labelPixelForensics}
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('text');
                        setHasReadToBottom(false);
                      }}
                      className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs md:text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                        activeTab === 'text'
                          ? 'bg-[#21302A] text-[#FFFDF6] shadow-sm'
                          : 'text-[#5C6E60] hover:text-[#21302A]'
                      }`}
                    >
                      <ScanLine className="w-4 h-4" />
                      {labelTextOcr}
                    </button>
                  </div>

                  {/* Scrollable Content */}
                  <div 
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="text-[#5C6E60] text-[13px] leading-relaxed space-y-4 overflow-y-auto sidebar-scroll pr-2 flex-1 scrollbar-thin touch-pan-y"
                  >
                    {activeTab === 'visual' ? (
                      <>
                        <p>{isEn ? "Pixel Forensics (SigLIP & ELA) analyzes the image at the pixel level to detect digital manipulation or AI generated models." : "Fitur Forensik Piksel (SigLIP & ELA) memproses gambar pada tingkat piksel terdalam untuk mendeteksi rekayasa manipulasi digital atau hasil buatan model generator AI."}</p>
                        
                        {/* Perbandingan Citra Grid */}
                        <div className="grid grid-cols-2 gap-3.5 mb-3 font-sans">
                          {/* Kamera Asli Card */}
                          <div className="bg-white rounded-xl border border-[#21302A]/5 overflow-hidden shadow-xs flex flex-col">
                            <div className="relative aspect-video bg-gray-50 flex items-center justify-center overflow-hidden">
                              <img 
                                src="/examples/fotokamera.png" 
                                alt={titleCameraGenuine} 
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                loading="lazy"
                              />
                              <span className="absolute top-1.5 left-1.5 bg-emerald-650 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full shadow-sm">ASLI</span>
                            </div>
                            <div className="p-2.5 flex-1 flex flex-col gap-0.5">
                              <h5 className="font-bold text-[11px] text-[#21302A] leading-tight">{titleCameraGenuine}</h5>
                              <p className="text-[9.5px] text-[#5C6E60] leading-normal flex-1">
                                {descCameraGenuine}
                              </p>
                            </div>
                          </div>

                          {/* Kamera Rekayasa Card */}
                          <div className="bg-white rounded-xl border border-[#21302A]/5 overflow-hidden shadow-xs flex flex-col">
                            <div className="relative aspect-video bg-gray-50 flex items-center justify-center overflow-hidden">
                              <img 
                                src="/examples/foto-kamera-dgn-ai.png" 
                                alt={titleCameraAi} 
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                loading="lazy"
                              />
                              <span className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full shadow-sm">AI / EDIT</span>
                            </div>
                            <div className="p-2.5 flex-1 flex flex-col gap-0.5">
                              <h5 className="font-bold text-[11px] text-[#21302A] leading-tight">{titleCameraAi}</h5>
                              <p className="text-[9.5px] text-[#5C6E60] leading-normal flex-1">
                                {descCameraAi}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Rincian Algoritma */}
                        <div className="space-y-3">
                          <div className="bg-white p-3 rounded-xl border border-[#21302A]/5 shadow-xs">
                            <h4 className="font-bold text-[#21302A] flex items-center gap-2 mb-1">
                              <Cpu className="w-4.5 h-4.5 text-indigo-650" /> {t.siglipTitle}
                            </h4>
                            <p className="text-xs text-[#5C6E60] leading-normal">{t.siglipDesc}</p>
                          </div>

                          <div className="bg-white p-3 rounded-xl border border-[#21302A]/5 shadow-xs">
                            <h4 className="font-bold text-[#21302A] flex items-center gap-2 mb-1">
                              <ScanLine className="w-4.5 h-4.5 text-emerald-600" /> {t.elaTitle}
                            </h4>
                            <p className="text-xs text-[#5C6E60] leading-normal">{t.elaDesc}</p>
                          </div>

                          <div className="bg-white p-3 rounded-xl border border-[#21302A]/5 shadow-xs">
                            <h4 className="font-bold text-[#21302A] flex items-center gap-2 mb-1">
                              <FileSearch className="w-4.5 h-4.5 text-amber-600" /> {t.exifTitle}
                            </h4>
                            <p className="text-xs text-[#5C6E60] leading-normal">{t.exifDesc}</p>
                          </div>
                        </div>

                        <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-xl flex gap-3 text-amber-950 shadow-inner">
                          <AlertTriangle className="w-4.5 h-4.5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-bold text-xs text-amber-850 mb-0.5">{t.warningTitle}</h4>
                            <p className="text-[10.5px] leading-relaxed text-amber-900/85">{t.warningDesc}</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <p>{isEn ? "Text & OCR Forensics extracts readable text from files and automatically cross-checks facts, news metadata, or official rules using the Gemini brain." : "Fitur Forensik Teks & OCR membaca dan mengekstrak tulisan dari berkas serta melakukan verifikasi silang terhadap fakta berita atau keaslian peraturan negara via kecerdasan buatan."}</p>
                        
                        {/* Subseksi 1: Tangkapan Layar (Chat / Berita) */}
                        <div className="mb-2">
                          <h4 className="font-bold text-[#21302A] text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 font-serif">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            {titleScreenshotSection}
                          </h4>
                          <div className="grid grid-cols-2 gap-3.5 font-sans">
                            {/* Contoh Berita Card */}
                            <div className="bg-white rounded-xl border border-[#21302A]/5 overflow-hidden shadow-xs flex flex-col">
                              <div className="relative aspect-video bg-gray-50 flex items-center justify-center overflow-hidden">
                                <img 
                                  src="/examples/contohberita.png" 
                                  alt={titleNewsOcr} 
                                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                  loading="lazy"
                                />
                                <span className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-[8px] font-medium px-1.5 py-0.5 rounded-md">Berita</span>
                              </div>
                              <div className="p-2.5 flex-1 flex flex-col gap-0.5">
                                <h5 className="font-bold text-[11px] text-[#21302A] leading-tight">{titleNewsOcr}</h5>
                                <p className="text-[9.5px] text-[#5C6E60] leading-normal flex-1">
                                  {descNewsOcr}
                                </p>
                              </div>
                            </div>

                            {/* Contoh Chat WA Card */}
                            <div className="bg-white rounded-xl border border-[#21302A]/5 overflow-hidden shadow-xs flex flex-col">
                              <div className="relative aspect-video bg-gray-50 flex items-center justify-center overflow-hidden">
                                <img 
                                  src="/examples/contohchatwa.png" 
                                  alt={titleChatOcr} 
                                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                  loading="lazy"
                                />
                                <span className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-[8px] font-medium px-1.5 py-0.5 rounded-md">Chat WA</span>
                              </div>
                              <div className="p-2.5 flex-1 flex flex-col gap-0.5">
                                <h5 className="font-bold text-[11px] text-[#21302A] leading-tight">{titleChatOcr}</h5>
                                <p className="text-[9.5px] text-[#5C6E60] leading-normal flex-1">
                                  {descChatOcr}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Subseksi 2: Dokumen Resmi (PDF / Surat) */}
                        <div className="bg-white p-3.5 rounded-xl border border-[#21302A]/5 shadow-xs mb-3 font-sans">
                          <h4 className="font-bold text-[#21302A] text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5 font-serif">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {titleOfficialDoc}
                          </h4>
                          <p className="text-xs text-[#5C6E60] leading-relaxed">
                            {descOfficialDoc}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="mt-5 pt-4 border-t border-[#21302A]/10 flex-shrink-0">
                    <button 
                      disabled={!hasReadToBottom}
                      onClick={onClose}
                      className={`w-full py-3 rounded-2xl font-semibold transition-all duration-200 shadow-md ${
                        hasReadToBottom 
                          ? 'bg-[#21302A] text-[#FFFDF6] hover:bg-[#2F443C] active:scale-[0.98] cursor-pointer shadow-[#21302A]/10' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                      }`}
                    >
                      {hasReadToBottom ? t.agreeScan : t.agreeScroll}
                    </button>
                  </div>
                </>
              );
            })()}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
