import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface CertificateData {
    nama: string;
    nomorSertifikat: string;
    sebagai: string;
    judulKompetensi: string;
    tanggalMulai: string;
    tanggalSelesai: string;
    tanggalTerbit: string;
}

export const generateAndDownloadCertificate = async (data: CertificateData, templatePath: string) => {
    try {
        const existingPdfBytes = await fetch(templatePath).then(res => res.arrayBuffer());

        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        // const { width, height } = firstPage.getSize(); 

        // TODO: Adjust these coordinates based on the actual template layout
        // Coordinates are in points (1/72 inch). Origin (0,0) is usually bottom-left.

        // Nama Peserta
        drawCenteredText(firstPage, data.nama, 350, helveticaBold, 24);

        // Nomor Sertifikat
        firstPage.drawText(data.nomorSertifikat, {
            x: 380, // Adjust
            y: 500, // Adjust
            size: 12,
            font: helveticaFont,
            color: rgb(0, 0, 0),
        });

        // Waktu Pelaksanaan (Contoh)
        const periodText = `${data.tanggalMulai} s.d ${data.tanggalSelesai}`;
        drawCenteredText(firstPage, periodText, 300, helveticaFont, 14);

        // Tanggal Terbit (Biasanya di bawah, dekat tanda tangan)
        firstPage.drawText(`Jambi, ${data.tanggalTerbit}`, {
            x: 500,
            y: 150,
            size: 12,
            font: helveticaFont,
        });

        const pdfBytes = await pdfDoc.save();

        // Trigger download
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `Sertifikat_${data.nama.replace(/\s+/g, '_')}.pdf`;
        link.click();

    } catch (error) {
        console.error("Error generating certificate:", error);
        throw new Error("Gagal membuat sertifikat PDF.");
    }
};

const drawCenteredText = (page: any, text: string, y: number, font: any, size: number) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    const { width } = page.getSize();
    page.drawText(text, {
        x: (width - textWidth) / 2,
        y: y,
        size: size,
        font: font,
        color: rgb(0, 0, 0),
    });
}
