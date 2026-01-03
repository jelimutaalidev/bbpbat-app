import holidays
from datetime import date, timedelta

def calculate_working_days(start_date, end_date):
    """
    Menghitung jumlah hari kerja antara dua tanggal.

    - Hari kerja adalah Senin sampai Jumat.
    - Tidak termasuk hari Sabtu dan Minggu.
    - Tidak termasuk hari libur nasional Indonesia.
    """
    
    # Inisialisasi kalender hari libur untuk Indonesia
    # 'ID' adalah kode negara untuk Indonesia
    id_holidays = holidays.Indonesia()
    
    working_days = 0
    current_date = start_date
    
    # Loop melalui setiap hari dari tanggal mulai hingga tanggal selesai
    while current_date <= end_date:
        # weekday() mengembalikan 0 untuk Senin dan 6 untuk Minggu.
        # Jadi, 5 adalah Sabtu dan 6 adalah Minggu.
        is_weekend = current_date.weekday() >= 5
        
        # Cek apakah tanggal saat ini adalah hari libur atau weekend
        if not is_weekend and current_date not in id_holidays:
            working_days += 1
            
        # Lanjut ke hari berikutnya
        current_date += timedelta(days=1)
        
    return working_days