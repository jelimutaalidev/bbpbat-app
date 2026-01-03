# apps/bimbingan/pdf_utils.py
import io
import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.colors import white, black
from pypdf import PdfReader, PdfWriter
from django.conf import settings

def generate_pdf_certificate(template_path, data):
    """
    Menghasilkan file PDF sertifikat dengan mengisi template yang diberikan.
    Menggunakan teknik 'whiteout' untuk menutupi placeholder yang ada.
    """
    
    packet = io.BytesIO()
    # Gunakan A4 Landscape (842 x 595 points)
    can = canvas.Canvas(packet, pagesize=landscape(A4))
    width, height = landscape(A4) # 842, 595
    center_x = width / 2
    
    # Helper untuk menggambar teks dengan background putih (menutupi placeholder)
    def draw_centered_text_with_bg(y, text, font_name="Helvetica-Bold", font_size=12, bg_width=400, bg_height=20, offset_y=0):
        # Draw white rectangle to cover placeholder
        # Rect coordinates: (x, y, width, height). y is bottom-left of rect.
        # Text y is baseline. We need to adjust rect position relative to text baseline.
        rect_x = center_x - (bg_width / 2)
        rect_y = y - 5 # Sedikit ke bawah dari baseline teks
        
        can.setFillColor(white)
        can.setStrokeColor(white)
        can.rect(rect_x, rect_y, bg_width, bg_height, fill=1, stroke=1)
        
        # Draw Text
        can.setFillColor(black)
        can.setFont(font_name, font_size)
        can.drawCentredString(center_x, y, text)

    # --- KONFIGURASI KOORDINAT (Disesuaikan dengan Screenshot User) ---
    
    # 1. Nomor Sertifikat (Di bawah tulisan SERTIFIKAT)
    if "{{NOMOR_SERTIFIKAT}}" in data:
        # Estimasi posisi: y=420 (di bawah judul)
        text = f"Nomor: {data['{{NOMOR_SERTIFIKAT}}']}"
        draw_centered_text_with_bg(405, text, "Helvetica", 14, bg_width=300, bg_height=20)

    # 2. Nama Peserta (Besar di tengah)
    if "{{NAMA_LENGKAP}}" in data:
        # Estimasi posisi: y=310 (overlaping placeholder NAMA MAHASISWA)
        # Background name harus cukup lebar/tinggi
        draw_centered_text_with_bg(310, data["{{NAMA_LENGKAP}}"], "Helvetica-Bold", 24, bg_width=500, bg_height=30)

    # 3. Institusi (Di bawah Nama)
    if "{{NAMA_INSTITUSI}}" in data:
        # Estimasi posisi: y=285
        draw_centered_text_with_bg(285, data["{{NAMA_INSTITUSI}}"], "Helvetica", 16, bg_width=400, bg_height=20)

    # 4. Unit Penempatan (Di bagian "dengan judul : " atau "Unit Penempatan")
    if "{{PENEMPATAN}}" in data:
        # User screenshot shows "Unit Penempatan: PERPUSTAKAAN"
        # Placeholder looks like it is around y=240
        text = f"Unit Penempatan: {data['{{PENEMPATAN}}']}"
        draw_centered_text_with_bg(240, text, "Helvetica-Bold", 14, bg_width=400, bg_height=20)

    # 5. Periode / Tanggal (Di bawah penempatan)
    if "{{TANGGAL_MULAI}}" in data and "{{TANGGAL_SELESAI}}" in data:
        text = f"{data['{{TANGGAL_MULAI}}']} - {data['{{TANGGAL_SELESAI}}']}"
        draw_centered_text_with_bg(215, text, "Helvetica", 12, bg_width=300, bg_height=18)

    # 6. Tanggal Terbit / Tanda Tangan (Pojok Kanan Bawah)
    # Ini biasanya tidak perlu whiteout karena area kosong, tapi bisa diatur
    if "{{TANGGAL_TERBIT}}" in data:
        can.setFillColor(black)
        can.setFont("Helvetica", 11)
        # Posisi di atas tanda tangan kepala balai
        # Estimasi x=550, y=120 ?
        # "Sukabumi, <<TanggalSelesai>>" -> Wait, template says Sukabumi.
        # But data says Jambi/Sukabumi? Let's follow template "Sukabumi".
        # We need to cover "<<TanggalSelesai>>" above the signature line.
        
        # Koordinat kira-kira di kanan bawah
        date_text = f"Sukabumi, {data['{{TANGGAL_TERBIT}}']}"
        
        # Manual Whiteout for date area
        can.setFillColor(white)
        can.setStrokeColor(white)
        # Rect di sekitar x=580, y=95
        can.rect(560, 95, 200, 15, fill=1, stroke=1)
        
        can.setFillColor(black)
        can.drawString(560, 98, date_text)

    can.save()
    packet.seek(0)
    
    try:
        new_pdf = PdfReader(packet)
        existing_pdf = PdfReader(open(template_path, "rb"))
        output = PdfWriter()

        page = existing_pdf.pages[0]
        page.merge_page(new_pdf.pages[0])
        output.add_page(page)

        output_stream = io.BytesIO()
        output.write(output_stream)
        output_stream.seek(0)
        
        return output_stream
        
    except Exception as e:
        print(f"Error merging PDF: {e}")
        raise e
