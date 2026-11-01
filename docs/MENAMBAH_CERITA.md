# Cara Menambah Cerita

Dataset cerita ada di `assets/data/stories.json`. Setiap cerita adalah satu objek
dalam array. Aplikasi membaca file ini langsung (bundled), jadi setelah menambah
cerita cukup reload app — tidak perlu build ulang.

## Struktur satu cerita

```json
{
  "id": "s16",
  "title": "さかな",
  "titleId": "Ikan",
  "level": 1,
  "sentences": [
    { "kana": "わたしはさかなをたべます", "romaji": "watashi wa sakana wo tabemasu", "id": "Aku makan ikan" },
    { "kana": "さかなはおいしいです", "romaji": "sakana wa oishii desu", "id": "Ikannya enak" }
  ],
  "questions": [
    { "prompt": "Apa yang dimakan?", "answerKana": ["さかな"], "answerId": "ikan", "bank": ["か", "さ", "な"] },
    { "prompt": "Bagaimana rasanya?", "answerKana": ["おいしい"], "answerId": "enak", "bank": ["い", "お", "し", "い"] }
  ]
}
```

## Field

| Field | Arti | Aturan |
|---|---|---|
| `id` | ID unik cerita | Mulai `s16`, `s17`, … **tidak boleh sama** |
| `title` | Judul dalam kana | Boleh beberapa kana |
| `titleId` | Judul bahasa Indonesia | Bebas |
| `level` | Tingkat kesulitan | Saat ini semua `1` |
| `sentences` | Kalimat cerita | 2–3 kalimat |
| `sentences[].kana` | Kalimat dalam kana | **Hanya kana yang ada di data** |
| `sentences[].romaji` | Bacaan latin | Huruf kecil |
| `sentences[].id` | Terjemahan Indonesia | Bebas |
| `questions` | Daftar soal | Boleh beberapa (2–3) |
| `questions[].prompt` | Pertanyaan (Indonesia) | Bebas |
| `questions[].answerKana` | Jawaban sebagai array kata kana | Multi kata didukung, mis. `["ちち", "はは"]` |
| `questions[].answerId` | Jawaban bahasa Indonesia | Ditampilkan saat salah |
| `questions[].bank` | Kepingan kana untuk disusun | **Hanya kana jawaban** (tanpa distraktor) |

## Aturan penting (agar tidak error)

1. **Kana harus valid.** Semua karakter di `sentences[].kana`, `answerKana`, dan
   `bank` harus ada di `assets/data/hiragana.json` (71 kana), **plus `っ`** (sokuon).
   Karakter kecil `ゃ ゅ ょ` (yata) **TIDAK** tersedia — hindari kata seperti
   きょう / いっしょ. Contoh ganti: きのう, ふたり.
2. **Bank harus cukup.** Total huruf di `bank` harus ≥ kebutuhan gabungan
   `answerKana`. Contoh jawaban `["ねこ"]` → bank butuh `ね` dan `こ`.
3. **Bank tanpa distraktor.** Sesuai desain, bank hanya berisi kana jawaban
   (diacak saat runtime). Jangan tambah huruf lain.
4. **Multi kata.** `answerKana: ["ちち", "はは"]` → digabung jadi `ちちはは` saat
   dicek. Bank harus berisi semua huruf kedua kata.
5. **JSON valid.** Koma antar objek, tanpa komentar. Cek dengan `npx tsc --noEmit`
   tidak menangkap JSON — pastikan lewat VS Code (error merah) sebelum reload.

## Cara cepat mengecek

1. Simpan `stories.json`.
2. Jalankan `npx expo start`, reload app.
3. Buka menu **Cerita** → cerita baru muncul di daftar.
4. Coba susun jawaban → pastikan "Periksa" benar untuk jawaban yang tepat.

## Setelah semua cerita selesai & benar

Ketika seluruh cerita sudah kamu kerjakan dan semua jawaban benar
(`bestCorrect == total` untuk tiap cerita di `StoryListScreen`, ditandai ikon
centang hijau), lanjutkan dengan:

1. **Naikkan level.** Buat cerita `level: 2` dengan kalimat lebih panjang, lalu
   tambah filter level di `StoryListScreen` bila perlu.
2. **Tambah cerita baru.** Ulangi langkah di atas dengan `id` berikutnya (`s16`,
   `s17`, …).
3. **Sokuon & yōon.** Jika ingin pakai きょう / いっしょ, tambahkan dulu kana kecil
   (ゃ ゅ ょ) ke `hiragana.json`, baru pakai di cerita.
4. **Audio (opsional).** Fitur cerita sengaja tanpa audio. Bila nanti mau,
   gunakan `expo-speech` (sudah terpasang) seperti pada fitur kana.

## Riwayat skor

Skor cerita disimpan terpisah dari skor kana:

- Key AsyncStorage: `story_history` (kana memakai `quiz_history`).
- Struktur: `{ storyId, correct, total, date }`.
- Statistik per cerita dihitung di `src/data/storyStore.ts` (`getStoryStats`).
