# Roadmap Pengembangan — Hiragana App RN

## Kondisi sekarang
- 2 tipe kana (hiragana/katakana), 71 masing-masing, dikelompokkan per baris (row).
- Layar: Home (ringkasan stats), KanaList + KanaDetailSheet + audio, QuizSetup, Quiz.
- Quiz: multiple-choice adaptif berbasis SRS (`srsWeight`), arah kana -> romaji.
- Stats disimpan di AsyncStorage (`quiz_history`, `quiz_letter_stats`).
- Navigasi stack 4 layar (React Navigation).

## Celah yang teridentifikasi
1. `audioPath` di JSON semua `null` — audio dipetakan manual via romaji (46 sound). Kana yōon/dakuten mungkin belum bersuara.
2. Quiz hanya 1 arah (kana -> romaji), hanya multiple-choice.
3. `srsWeight` sudah ada tapi belum ada review terjadwal / tampilan spaced repetition.
4. Data kana belum mencakup dakuten/handakuten (が, ぱ) & yōon (きゃ).

---

## Kandidat fitur (per dampak / effort)

### Tier 1 — cepat, dampak besar
1. **Mode quiz baru**: romaji -> kana (pilih karakter), dan mode ketik jawaban (text input).
2. **Layar Progress/Stats penuh**: grafik per baris, akurasi, kana terlemah (data `statsStore` sudah menampung). Route baru `Progress`.
3. **Mode SRS / Missed-only**: quiz khusus kana yang sering salah (pakai `srsWeight` + `getLetterStats`). Reuse `QuizScreen`.
4. **Flashcard** swipe (belajar tanpa opsi). Route baru + komponen gesture.

### Tier 2 — konten lebih kaya
5. **Dakuten/handakuten + yōon**: tambah data + audio (perlu tambahan mp3).
6. **Kanji / kosakata N5** sebagai tipe baru (generalisasi `KanaType` -> kategori).
7. **Streak harian + pengingat** (`expo-notifications`).
8. **Mode tulisan tangan** goresan (canvas SVG, `react-native-svg` sudah tersedia).

### Tier 3 — polish & release
9. **Dark mode** (theme sudah terpusat di `src/theme/theme.ts`).
10. **i18n** (ID/EN) — UI saat ini hardcoded Indonesia.
11. **Settings**: reset progress, pilih suara, jumlah soal default.
12. **Audio preload + fallback TTS** (`expo-speech`) bila mp3 tidak ada.
13. **EAS release pipeline** + OTA update.

---

## Rekomendasi urutan (jika mulai)
1. Layar Progress/Stats (murah, semua data sudah ada).
2. Mode quiz baru: romaji -> kana + ketik jawaban.
3. Mode SRS "fokus kana lemah".
4. Flashcard.
5. Konten dakuten/yōon.

## Pertanyaan terbuka
1. Prioritas: **belajar lebih dalam** (konten/kanji) atau **latihan lebih pintar** (SRS/mode quiz)?
2. Cakupan: tetap hiragana/katakana saja, atau tambah kanji & kosakata?
3. Target rilis: Play Store, atau pemakaian pribadi?
