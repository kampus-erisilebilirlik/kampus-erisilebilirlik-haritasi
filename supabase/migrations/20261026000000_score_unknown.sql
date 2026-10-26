-- Sahada henüz ölçülmemiş bina: puan verilmeden haritada gösterilir (yeşil/sarı/kırmızı yanıltıcı olur)
alter type access_score add value if not exists 'unknown';
