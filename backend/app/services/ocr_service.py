import os
import io
import json
from google import genai
from google.genai import types
from .gemini_client import generate_content_sync_with_failover

# Coba import pypdf untuk ekstraksi PDF lokal jika tersedia
try:
    import pypdf
    PYPDF_AVAILABLE = True
except ImportError:
    PYPDF_AVAILABLE = False

# Coba import pytesseract untuk ekstraksi Gambar lokal jika tersedia
try:
    import pytesseract
    from PIL import Image
    PYTESSERACT_AVAILABLE = True
except ImportError:
    PYTESSERACT_AVAILABLE = False

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Ekstraksi teks dari PDF secara lokal menggunakan pypdf.
    Jika gagal atau pypdf tidak ada, return string kosong untuk fallback ke Gemini.
    """
    if not PYPDF_AVAILABLE:
        return ""
    try:
        pdf_file = io.BytesIO(pdf_bytes)
        reader = pypdf.PdfReader(pdf_file)
        text_list = []
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_list.append(page_text)
        return "\n".join(text_list)
    except Exception as e:
        print(f"Gagal ekstraksi PDF lokal: {e}")
        return ""

def extract_text_from_image(image_bytes: bytes) -> str:
    """
    Ekstraksi teks dari gambar secara lokal menggunakan pytesseract jika terpasang.
    Jika tidak tersedia, return string kosong untuk fallback ke Gemini.
    """
    if not PYTESSERACT_AVAILABLE:
        return ""
    try:
        img = Image.open(io.BytesIO(image_bytes))
        return pytesseract.image_to_string(img)
    except Exception as e:
        print(f"Gagal ekstraksi gambar lokal via pytesseract: {e}")
        return ""

def perform_ocr_with_fallback(file_bytes: bytes, mime_type: str, api_key: str = None) -> str:
    """
    Mengekstrak teks dengan mencoba metode lokal terlebih dahulu.
    Jika tidak didukung/gagal, sistem menggunakan Gemini untuk mengekstrak teks secara visual.
    """
    # 1. Coba metode lokal
    extracted_text = ""
    if "pdf" in mime_type.lower():
        extracted_text = extract_text_from_pdf(file_bytes)
    else:
        extracted_text = extract_text_from_image(file_bytes)



    if extracted_text and extracted_text.strip():
        print("Teks berhasil diekstrak menggunakan pustaka lokal.")
        return extracted_text.strip()

    # 2. Fallback ke Gemini Vision/Document OCR
    print("Menggunakan fallback Gemini API untuk ekstraksi teks (OCR).")
    # Kirim file ke model Gemini 2.5 Flash via pool failover
    response = generate_content_sync_with_failover(
        model='gemini-2.5-flash',
        contents=[
            types.Part.from_bytes(
                data=file_bytes,
                mime_type=mime_type,
            ),
            "Extract all readable text from this file exactly. Return only the extracted text without any summaries, comments, formatting edits, or annotations."
        ],
        custom_api_key=api_key
    )
    
    text_res = response.text or ""
    return text_res.strip()

def verify_extracted_text(text: str, mode: str, api_key: str = None) -> dict:
    """
    Menggunakan Gemini API untuk memverifikasi teks hasil ekstraksi OCR.
    Menerapkan mode 'screenshot' (untuk chat/news) atau 'document' (untuk UU/kebijakan).
    """
    import datetime
    import re
    
    today = datetime.date.today()
    hari_dict = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]
    bulan_dict = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
    
    day_name = hari_dict[today.weekday()]
    month_name = bulan_dict[today.month - 1]
    formatted_date = f"{day_name}, {today.day:02d} {month_name} {today.year}"

    if mode == "screenshot":
        system_instruction = (
            f"Anda adalah Agen Forensik Tangkapan Layar Factize. Hari ini adalah {formatted_date}.\n"
            "Tugas Anda adalah menganalisis teks hasil ekstraksi tangkapan layar (screenshot berita digital atau chat seperti WA/Telegram).\n"
            "Periksa apakah teks tersebut mengandung informasi palsu (hoax), judul berita hasil manipulasi edit gambar, atau klaim bohong.\n"
            "Bandingkan dengan fakta dunia nyata. Gunakan hari ini ({formatted_date}) sebagai patokan waktu saat menilai apakah suatu tanggal berada di masa depan atau masa lalu.\n"
            "Jika terbukti bahwa informasi tersebut adalah hoax/manipulasi/tidak sesuai fakta resmi, maka klasifikasikan 'isManipulated': true.\n"
            "Anda wajib mengembalikan respon JSON mentah (tanpa format markdown ```json, tanpa pembuka/penutup) dengan struktur berikut:\n"
            "{\n"
            "  \"isManipulated\": true/false,\n"
            "  \"confidence\": \"95.0%\",\n"
            "  \"sourceMatch\": \"Nama media berita resmi/sumber rujukan atau 'Tidak Ditemukan'\",\n"
            "  \"analysis\": \"Berikan penjelasan fakta yang sangat RAPI, DETAIL, dan TERSTRUKTUR dalam Bahasa Indonesia. Gunakan paragraf yang jelas. "
            "Gunakan format daftar poin-poin menggunakan tanda dash (-) untuk menyebutkan rincian fakta atau kejanggalan agar mudah dibaca.\"\n"
            "}"
        )
    else:  # mode == "document"
        system_instruction = (
            f"Anda adalah Agen Verifikasi Kebijakan Dokumen Factize. Hari ini adalah {formatted_date}.\n"
            "Tugas Anda adalah menganalisis teks dari dokumen resmi (PDF undang-undang, keputusan pemerintah, peraturan tertulis).\n"
            "Evaluasi apakah aturan atau pasal-pasal di dalamnya asli dan sesuai dengan regulasi resmi negara Indonesia, "
            "atau jika ada pasal yang dipelintir, diubah, disunting secara sepihak, atau dipalsukan.\n"
            "Jika ada manipulasi teks/pasal, klasifikasikan 'isManipulated': true.\n"
            "Anda wajib mengembalikan respon JSON mentah (tanpa format markdown ```json, tanpa pembuka/penutup) dengan struktur berikut:\n"
            "{\n"
            "  \"isManipulated\": true/false,\n"
            "  \"confidence\": \"90.0%\",\n"
            "  \"sourceMatch\": \"Nama regulasi/pasal resmi terkait atau 'Tidak Ditemukan'\",\n"
            "  \"analysis\": \"Berikan penjelasan fakta hukum yang sangat RAPI, DETAIL, dan TERSTRUKTUR dalam Bahasa Indonesia. Gunakan paragraf yang jelas. "
            "Gunakan format daftar poin-poin menggunakan tanda dash (-) untuk memaparkan pasal yang asli vs pasal yang dipelintir.\"\n"
            "}"
        )

    # Panggil Gemini via pool failover
    response = generate_content_sync_with_failover(
        model='gemini-2.5-flash',
        contents=[
            f"Please verify this extracted text:\n\n{text}"
        ],
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            response_mime_type="application/json"
        ),
        custom_api_key=api_key
    )
    
    raw_text = response.text.strip()
    if raw_text.startswith("```"):
        raw_text = re.sub(r'^```(?:json)?\n', '', raw_text)
        raw_text = re.sub(r'\n```$', '', raw_text)
        raw_text = raw_text.strip()

    try:
        res_json = json.loads(raw_text)
        return res_json
    except Exception as e:
        print(f"Failed to parse Gemini OCR JSON response: {e}, raw: {response.text}")
        is_manip = "true" in raw_text.lower()
        conf_match = re.search(r'"confidence":\s*"([^"]+)"', raw_text)
        src_match = re.search(r'"sourceMatch":\s*"([^"]+)"', raw_text)
        analysis_match = re.search(r'"analysis":\s*"([^"]+)"', raw_text)
        
        return {
            "isManipulated": is_manip,
            "confidence": conf_match.group(1) if conf_match else "75.0%",
            "sourceMatch": src_match.group(1) if src_match else "Tidak Ditemukan",
            "analysis": analysis_match.group(1) if analysis_match else raw_text
        }
