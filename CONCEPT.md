# Agent ID Hackathon — Fase 1: Riset & Pemilihan Konsep

Tanggal: 19 Nov 2026. Submission: 18 Nov 2026 08:00 UTC – 9 Des 2026 08:00 UTC (15:00 WIB 9 Des).
Hadiah: 60.000 USDC. Project Awards 29.000 (top 10 metrik on-chain; juara 1 10.000) +
Innovation Award 29.000 (juri 100 poin: kedalaman Agent ID 30%, kepraktisan 25%,
kelengkapan 25%, inovasi 20%; syarat live + ≥30 alamat Agent ID) + Community 2.000.
Kontrak Agent ID: 0x60b9262456de011f7d15a54cdd8c48baaa8b022f (SPACE ID ERC-721, non-transferable).

## Pesaing yang sudah terlihat (19 Nov 2026, hari ke-2 submission)

1. **AgentWall** (heavenholic, live 18 Nov, febry10.github.io/agentwall, kontrak terverifikasi):
   hall on-chain untuk pemegang Agent ID — daily check-in + streak + poin, message wall
   publik, tip BNB tanpa fee/custody/owner. Sedang merekrut "30 agent pertama".
   -> Slot check-in + wall SUDAH DIAMBIL first-mover. Klon = skor inovasi ~0.
2. **Arena shooter gratis** (odette/minkymomo): game Agent ID-gated, skor on-chain + leaderboard.
3. Proyek Agent ID-gated lama (bukan hackathon): Flaggies (mint NFT, mint tutup 3 Nov),
   Jager/JAGENT (mint berbayar 4 USDT/share — berbayar, skip).

## Konsep yang dinilai (skala 1–5)

| Konsep | Depth | Praktis | Selesai | Inovasi | 30 alamat | Metrik | Total |
|---|---|---|---|---|---|---|---|
| A. Check-in + wall (klon AgentWall) | 3 | 3 | 5 | 1 | 3 | 4 | 19 |
| B. **Agent Badge Passport** | 5 | 4 | 4 | 4 | 4 | 4 | **25** |
| C. Task board antar-agent | 4 | 4 | 2 | 4 | 2 | 3 | 19 |
| D. Registry vouch/trust | 4 | 3 | 3 | 3 | 3 | 2 | 18 |
| E. Liga prediksi (reputasi) | 3 | 3 | 2 | 4 | 3 | 3 | 18 |

## KONSEP TERPILIH: B — AgentPass (Agent Badge Passport)

**Ide:** Paspor kredensial on-chain untuk pemegang Agent ID. Badge didapat lewat aksi
nyata yang terverifikasi on-chain, dan menempel pada nama .ai yang non-transferable
(kredensial tidak bisa dijual/dipindah). Setiap agent punya profil publik:
nama.ai + badge + streak + statistik. Kontrak bisa dibaca dApp lain (komposabel).

**Badge peluncuran (v1):**
1. **Daily Proof** — check-in 1x/hari (UTC), streak tercatat. (Driver metrik harian.)
2. **First Mark** — tinggalkan pesan publik bertanda tangan di wall.
3. **Tipper** — tip BNB ke pemegang Agent ID lain (diteruskan langsung, tanpa fee/custody).
4. **Builder** — buktikan deploy kontrak BSC terverifikasi (frontend cek BscScan; klaim dicatat on-chain).
5. **Early Agent** — 100 pemegang badge pertama.

**Kenapa bisa menang:**
- Kedalaman Agent ID (30%): tanpa Agent ID tidak ada yang bisa dilakukan — gate
  `balanceOf > 0` di SEMUA fungsi tulis; profil = identitas .ai itu sendiri.
- Kepraktisan (25%): kredensial agent yang portabel & bisa dicek siapa saja; dApp lain
  bisa gating fitur dari badge (mis. hanya Builder boleh posting).
- Inovasi (20%): belum ada proyek kredensial/paspor untuk agent; AgentWall = wall sosial,
  shooter = game — kategori berbeda.
- Metrik (Project Awards): check-in harian + klaim badge + tip = tx berulang per user;
  budaya kejar poin di komunitas agent (Boltbook dsb.) memudahkan rekrut 30 alamat.
- Kelengkapan (25%): 1 kontrak + frontend statis — bisa live dalam hitungan hari,
  jauh sebelum deadline 9 Des.

**Kepatuhan red lines:** tanpa login QR; tanpa bypass konfirmasi (semua tx dikonfirmasi
user di walletnya); tanpa transfer tanpa izin (tip hanya atas perintah user, langsung
ke penerima); tanpa fee/custody/owner (kontrak tanpa owner, tanpa admin, tanpa pause);
tanpa janji return (badge = reputasi, bukan uang); tanpa kumpulkan seed/key; tanpa
impersonasi brand Binance/BNB; bukan tool lookup wallet orang (profil hanya untuk
diri sendiri + badge yang diklaim sukarela).

**Yang TIDAK dilakukan fase ini:** deploy mainnet + submit (butuh tap Selena, PROMPT INDUK 12.1).
Build + test lokal saja. Estimasi gas deploy dihitung dari hasil compile (lapor terpisah).
