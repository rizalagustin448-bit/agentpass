# PROMOTION.md — AgentPass (Binance Agent ID Hackathon)

> DRAF KERJA — belum ada yang diposting. Semua posting butuh persetujuan Selena dulu.
> Terakhir diperbarui: 19 Nov 2026 ~14:50 WIB.

## 0. Fakta proyek (untuk semua draf)

- Kontrak AgentPass (BSC mainnet, terverifikasi di BscScan — cek ulang sebelum posting):
  `0xa6Ef7BEb5892b9d07978a554F4ee982439531325`
- Kontrak Agent ID (SPACE ID, ERC-721 non-transferable):
  `0x60b9262456de011f7d15a54cdd8c48baaa8b022f`
- Situs: `[URL SITUS]` — ISI setelah situs live (rencana: GitHub Pages).
- Repo: `[URL REPO]` — ISI setelah repo dipublikasikan.
- Badge v1 (5): Daily Proof (check-in harian UTC), First Mark (pesan publik ≤280 byte),
  Tipper (tip BNB diteruskan 100%, tanpa fee), Builder (klaim kontrak terverifikasi),
  Early Agent (100 pemegang badge pertama).
- Tanpa owner/fee/token; badge = reputasi, bukan uang; tanpa janji return.
- Biaya user: check-in ulang ~0,0000026 BNB; check-in pertama ~0,0000093 BNB (@0,05 gwei).
- Deadline submission: **9 Des 2026 15:00 WIB** (08:00 UTC).

## 1. Target

| Target | Angka | Tenggat |
|---|---|---|
| Alamat Agent ID unik yang berinteraksi (check-in / klaim badge / tip) | **≥30** | 9 Des 2026 15:00 WIB |
| Buffer aman (jaga-jaga alamat tidak kehitung / di luar periode) | 40 | 7 Des 2026 |
| Check-in harian (semua user) | ≥15/hari di minggu 3 | berjalan |
| Pemegang badge Early Agent (cap 100) | ≥30 dari 100 | 9 Des 2026 |

"Berinteraksi" = alamat wallet pemegang Agent ID yang mengirim ≥1 tx berhasil ke
kontrak AgentPass selama Submission Period (18 Nov 08:00 UTC – 9 Des 08:00 UTC):
`checkIn`, `leaveMark`, `tip`, `claimBuilder`, atau `claimEarly`.
Satu alamat = satu hitungan, berapa pun tx-nya.

## 2. Tabel metrik harian

Isi tiap malam (WIB). "Alamat unik kumulatif" = jumlah alamat berbeda sejak 18 Nov
2026 08:00 UTC (bukan sejak deploy — deploy 19 Nov masih di dalam periode).

| Tanggal | Check-in | Pemegang badge baru | Tip | Mark baru | Klaim Builder | Alamat unik kumulatif | Catatan |
|---|---|---|---|---|---|---|---|
| 19 Nov 2026 | 0 | 0 | 0 | 0 | 0 | 0 | Deploy ~14:28 WIB; situs+repo belum live |
| 20 Nov 2026 | | | | | | | |
| 21 Nov 2026 | | | | | | | |
| 22 Nov 2026 | | | | | | | |
| 23 Nov 2026 | | | | | | | |
| 24 Nov 2026 | | | | | | | |
| 25 Nov 2026 | | | | | | | |
| 26 Nov 2026 | | | | | | | |
| 27 Nov 2026 | | | | | | | |
| 28 Nov 2026 | | | | | | | |
| 29 Nov 2026 | | | | | | | |
| 30 Nov 2026 | | | | | | | |
| 1 Des 2026 | | | | | | | |
| 2 Des 2026 | | | | | | | |
| 3 Des 2026 | | | | | | | |
| 4 Des 2026 | | | | | | | |
| 5 Des 2026 | | | | | | | |
| 6 Des 2026 | | | | | | | |
| 7 Des 2026 | | | | | | | |
| 8 Des 2026 | | | | | | | |
| 9 Des 2026 (s.d. 15:00 WIB) | | | | | | | **Tutup periode** |

## 3. Cara menghitung alamat unik on-chain

Sumber kebenaran = event kontrak AgentPass, BUKAN angka di frontend.
Satu alamat dihitung bila muncul sebagai `who`/`from` di ≥1 event berikut
(dalam Submission Period):

| Event | Topic0 (keccak256 signature) | Alamat yang dihitung |
|---|---|---|
| `CheckIn(address,uint256,uint256)` | `0xb9cfea4717f167774a6e8643c33472935d3ef918453525eefca6936078b7cfdd` | topic1 = `who` |
| `Mark(address,string)` | `0xf94645c21a0621b17421a8bece1b62cdc7e1a356d622d6870ff0016ffc9f6f12` | topic1 = `who` |
| `Tip(address,address,uint256)` | `0xcbefbf6a902aa93a9aafdd30aefd16e61f6c015bbf5fcaccfdf1d29d0c84e7d0` | topic1 = `from` (pengirim tip) |
| `BuilderClaimed(address,address)` | `0x614f71b5c982fd0033960bab4052f473d7e54ba1f956c183dcf9325f372a9926` | topic1 = `who` |
| `EarlyClaimed(address)` | `0xb42d7b739794268daa88cd17d28c0610966391ede1faeaadce75d434a1d3f74c` | topic1 = `who` |
| `BadgeAwarded(address,uint8)` | `0x285a0f2deff4dbdd3719bae595cb2c8b27a45f0814e4db2b1946ab8df9bc548b` | topic1 = `who` (dipakai untuk "pemegang badge baru") |

Topic hash di atas dihitung 19 Nov 2026 dengan `ethers.id()` (v6) dari signature
di `contracts/AgentPass.sol` — verifikasi ulang dengan `npx hardhat` / ethers
sebelum dipakai resmi.

### 3.1 DEPLOY_BLOCK — wajib diisi dulu

`DEPLOY_BLOCK` = nomor blok saat kontrak di-deploy (19 Nov 2026 ~14:28 WIB,
deployer wallet personal `0x13C7F560367AfC703d9885c5597a91A27919ac24`, nonce 122→123).
**Belum terisi saat file ini ditulis** — `frontend/config.js` masih TODO.
Angka pastinya HANYA dari receipt deploy / halaman BscScan kontrak.
Yang sudah dicoba 19 Nov dan GAGAL mendapatkan angka ini:
- RPC publik `bsc-dataseed*.bnbchain.org`: `eth_getCode` di blok lama gagal
  `missing trie node` (state ter-prune); `eth_getLogs` menolak range ≥100 blok
  (`limit exceeded`).
- BscScan API `api.bscscan.com`: mengembalikan halaman dok Etherscan (butuh API key /
  endpoint v2) — bukan data.
- `browser.open` bscscan.com: 403.
- Estimasi kasar dari jam deploy (±134.464.000) **JANGAN** dipakai untuk hitung
  resmi — hanya untuk cek awal.

### 3.2 Perintah contoh (eth_getLogs)

Hitung per event, chunk kecil (RPC publik menolak range besar — mulai dari 100 blok,
naikkan bila lolos). Ganti `DEPLOY_BLOCK` dengan angka pasti dari §3.1.

```bash
# 1) Semua event CheckIn sejak deploy (contoh chunk 100 blok; ulang per chunk)
curl -s -X POST https://bsc-dataseed.bnbchain.org \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"eth_getLogs","params":[{
        "fromBlock":"0x<DEPLOY_BLOCK_HEX>",
        "toBlock":"0x<DEPLOY_BLOCK_HEX+100>",
        "address":"0xa6Ef7BEb5892b9d07978a554F4ee982439531325",
        "topics":["0xb9cfea4717f167774a6e8643c33472935d3ef918453525eefca6936078b7cfdd"]
      }]}'
# topic1 (topics[1]) = alamat who, 32 byte, 12 byte nol di depan -> ambil 20 byte terakhir.
```

Cara yang lebih andal (disarankan): skrip kecil yang memanggil `eth_getLogs`
per chunk 100 blok untuk keenam topic di atas, lalu gabung semua `topics[1]`
(untuk `Tip`, `topics[1]` = pengirim; penerima di `topics[2]` TIDAK dihitung —
hanya pengirim yang berinteraksi) ke satu `set()`, dan hitung:

- **Alamat unik** = ukuran set gabungan.
- **Check-in harian** = jumlah log `CheckIn` yang `blockTimestamp`-nya jatuh di
  tanggal itu (ambil timestamp via `eth_getBlockByNumber` per blok, atau
  kelompokkan dari `blockNumber`).
- **Pemegang badge baru** = alamat yang pertama kali muncul di `BadgeAwarded`
  pada tanggal itu.
- **Tip / Mark / Builder** = jumlah log `Tip` / `Mark` / `BuilderClaimed` per tanggal.

Alternatif bila RPC publik terlalu ketat: BscScan API `getLogs` (butuh API key
gratis) atau node archive / layanan indexer (BscScan, NodeReal, Ankr).
**Jangan** mengandalkan angka dari frontend — frontend hanya membaca
`DEPLOY_BLOCK` yang sama dan bisa tertinggal.

### 3.3 Cek silang cepat

- `totalHolders()` (view, tanpa argumen) = jumlah alamat yang pegang ≥1 badge.
  Harus sama dengan ukuran set dari `BadgeAwarded`. Bila beda, hitungan log ada
  yang terlewat (chunk kosong / range terpotong).
- `totalCheckIns()` = total check-in sepanjang masa. Harus sama dengan jumlah
  log `CheckIn`.
- Verifikasi alamat pemegang Agent ID: tiap alamat unik di set HARUS
  `balanceOf > 0` di kontrak Agent ID — dijamin kontrak (semua fungsi tulis
  revert bila bukan pemegang), jadi cek ini hanya formalitas.

## 4. Kanal promosi (riset 19 Nov 2026 — hanya info publik)

Urutan = prioritas. Jangan spam; 1 postingan per kanal per momen, balas komentar
yang bertanya saja. Semua link di bawah ditemukan lewat pencarian publik hari ini.

| # | Kanal | Link | Bukti ukuran / aktivitas (19 Nov 2026) | Cara pakai |
|---|---|---|---|---|
| 1 | **Binance Square — pengumuman resmi hackathon** | https://www.binance.com/en/support/announcement/detail/95f5dbe0ea674a48a739b59e046648bf | Pengumuman resmi Binance Wallet + BNB Chain; syarat ≥30 alamat & hashtag resmi tercantum di sini | Rujukan utama di semua draf; posting X pakai hashtag resmi dari sini |
| 2 | **Binance Square — postingan berita hackathon** | https://www.binance.com/en-BH/square/post/11-18-2026-binance-wallet-and-bnb-chain-to-host-agent-id-hackathon-with-60-000-usdc-in-rewards-389517706162185 | Berita 18 Nov 2026, dibagikan ulang di Square | Pantau komentar — tempat pemegang Agent ID berkumpul saat pengumuman |
| 3 | **X — hashtag #BinanceWalletHackathon + #AgenticWallet** | Pencarian X untuk kedua hashtag | Hashtag RESMI dari pengumuman; dipakai peserta lain (AgentWall, arena shooter odette) pada 18–19 Nov | Posting 3 draf X di sini; ikut Community Promotion Award (20 pemenang × 100 USDC, kirim link X via survei resmi) |
| 4 | **SPACE ID Discord** | https://discord.gg/spaceid | **384.186 anggota, 2.141 online** (discord.com, 19 Nov); X @SpaceIDProtocol ~748K follower; Telegram @spaceid_news ~29.590 subscriber (18 Nov) | Kanal identitas .ai terbesar; cari channel yang cocok (announcement/showcase), JANGAN spam — 1 pengumuman saja, sesuai aturan server |
| 5 | **BNB Chain Telegram (grup komunitas resmi)** | https://t.me/BNBchaincommunity | **~68.804 anggota, 1.554 online** (19 Nov); channel @bnbchain ~70.810 subscriber | Grup besar BNB Chain; 1 pengumuman + jawab pertanyaan; patuhi aturan grup |
| 6 | **BNB Chain Discord** | https://discord.gg/bnbchain | **306.285 anggota, 3.032 online** (discord.com) | Seperti #5; cari channel dev/showcase |
| 7 | **Binance Wallet (X)** | Akun resmi @BinanceWallet (terverifikasi) — posting klaim 100K Agent ID 29 Okt, 200K pada 16 Nov 2026 | Klaim Agent ID: 100K (29 Okt) → **200K+ (16 Nov 2026)**; ~182.040 per 11 Nov (riset BAS / Medium) | Hanya pantau + balas/quote bila relevan; JANGAN tag spam |
| 8 | **agent.bas.io (BAS index)** | https://agent.bas.io | Indeks SEMUA Agent ID: 182.040 per 11 Nov 2026, ~1.500 klaim baru/hari; 992 pemegang jalankan agent on-chain | Bukan kanal posting — alat riset: cari pemegang aktif (.ai yang sudah beraktivitas) untuk diajak secara personal & sopan, bukan massal |
| 9 | **Threads — komunitas hackathon** | https://www.threads.com/@heavenholic33/post/Df56-wUD7mS (AgentWall), https://www.threads.com/@odet.te64/post/Df6ZCkamPH2 (arena shooter) | AgentWall diumumkan 19 Nov 01:40 UTC (Threads, 7 follower); shooter odette 19 Nov 06:02 UTC; grafis resmi Binance disebar @senihemat (13 follower) | Tempat peserta hackathon saling lihat; posting pengumuman AgentPass di sini + interaksi wajar dengan peserta lain |
| 10 | **Facebook — grup pemegang Agent ID (Indonesia)** | Grup-grup FB tempat pengguna memamerkan kartu .ai (mis. grup id 262627653316040, 1221894938362952, 1419246001993956 — posting 18–19 Nov) | Aktif 18–19 Nov: pengguna Indonesia memamerkan `maestrococo.ai`, `abubakar1608.ai`, `veempiii09.ai`; kreator FB @Zaomin Merana (3,7K follower) aktif bahas check-in harian & hackathon | Audiens Indonesia paling aktif; 1 posting per grup, bahasa Indonesia; jangan posting berulang |
| 11 | **Komunitas proyek Agent ID-gated lain** (GLOOP, Jager, Four.meme Agent ID Exclusive, Flap ID Agent Curve) | https://thecolony.ai/u/spark (GLOOP: 3.333 slime, sold out 8 Nov); https://jager.live (JAGENT); https://bnagent.onrender.com | GLOOP sold out 3.333 (8 Nov), ikut hackathon; JAGENT mint 12,80 USDT/share (berbayar — BUKAN target ajak, hanya tempat pemegang berkumpul) | Pemegangnya SUDAH pegang Agent ID — audiens paling tepat; sapa lewat kanal publik mereka (X/Discord/Telegram proyek), 1x, tanpa spam |
| 12 | **Panduan komunitas Agentic Wallet** (Substack + Telegram) | https://aghaonujohnbosco.substack.com/p/the-most-complete-guide-to-binance ; Telegram https://t.me/coderstechJB (channel) & https://t.me/CoderstechGem (grup) | Panduan 28 Okt 2026 menyebut @congge918 sebagai sumber proyek baru; channel/grup aktif berbagi alpha | Minta (sopan, 1x) agar panduan/creator melirik AgentPass; bukan kanal posting massal |

Catatan riset:
- Total pasar: **>200.000 Agent ID diklaim** (Binance, 16 Nov 2026) — 30 alamat
  = 0,015% dari populasi; target realistis bila menjangkau komunitas yang tepat.
- Pesaing langsung **AgentWall** (heavenholic, live 18 Nov, febry10.github.io/agentwall)
  sudah merekrut "30 agent pertama" dan aktif promosi di Threads + Facebook
  (video 19 Nov 02:39 UTC). Bedakan AgentPass: BUKAN wall — paspor badge
  (Builder + Early Agent 100 pertama adalah pembeda).
- Community Promotion Award terpisah (2.000 USDC, 20 pemenang): posting X orisinal
  tentang proyek peserta + kedua hashtag + kirim link via survei resmi.
  Ini bonus, bukan syarat 30 alamat.
- TIDAK ditemukan: grup Telegram/Discord KHUSUS pemegang Agent ID yang resmi
  dan publik (selain kanal SPACE ID / BNB Chain di atas). Jangan gabung grup
  tidak resmi yang minta seed/key — dan jangan pernah meminta seed/key siapa pun.

## 5. Draf postingan (siap posting — SETELAH situs + repo live)

Ganti `[URL SITUS]` dan `[URL REPO]` dengan URL final. Semua draf X di bawah
sudah dihitung ≤280 karakter DENGAN placeholder 11 karakter — **cek ulang
panjangnya sesudah URL final dimasukkan** (pakai short link bila perlu).

### 5.1 Postingan X — ID (peluncuran)

> AgentPass live di BNB Chain. Paspor badge on-chain untuk pemegang Agent ID (.ai): check-in harian, tinggalkan mark, tip antar agent, klaim badge Builder. Tanpa fee, tanpa owner, tanpa janji cuan — badge = reputasi. [URL SITUS] #BinanceWalletHackathon #AgenticWallet
> (265 karakter dengan placeholder)

### 5.2 Postingan X — EN (launch)

> AgentPass is live on BNB Chain. An on-chain badge passport for Agent ID (.ai) holders: daily check-in, public marks, peer tips, Builder badge. No fees, no owner, no yield promises — badges are reputation. [URL SITUS] #BinanceWalletHackathon #AgenticWallet
> (255 karakter dengan placeholder)

### 5.3 Postingan X — ID (cara ikut)

> Cara ikut AgentPass (1 menit): 1) Buka [URL SITUS] 2) Connect wallet yang pegang Agent ID .ai 3) Check-in harian, dapat badge Daily Proof 4) Tinggalkan mark / tip agent lain. Gas ~0,000003 BNB. #BinanceWalletHackathon #AgenticWallet
> (232 karakter dengan placeholder)

### 5.4 Postingan X — EN (how to join)

> How to join AgentPass (1 min): 1) Open [URL SITUS] 2) Connect the wallet holding your .ai Agent ID 3) Check in daily, earn the Daily Proof badge 4) Leave a mark / tip another agent. Gas ~0.000003 BNB. #BinanceWalletHackathon #AgenticWallet
> (239 karakter dengan placeholder)

### 5.5 Postingan X — ID (badge Early Agent, 100 pertama)

> Hanya 100 pertama. Badge Early Agent di AgentPass cuma untuk 100 pemegang badge pertama — sesudah itu tutup selamanya. Punya Agent ID .ai? Check-in sekarang: [URL SITUS] #BinanceWalletHackathon #AgenticWallet
> (208 karakter dengan placeholder)

### 5.6 Postingan X — EN (Early Agent badge, first 100)

> Only the first 100. The Early Agent badge on AgentPass goes to the first 100 badge holders only — then it closes forever. Hold an Agent ID .ai? Check in now: [URL SITUS] #BinanceWalletHackathon #AgenticWallet
> (208 karakter dengan placeholder)

### 5.7 Thread / pengumuman panjang — ID (untuk X thread, Telegram, Discord)

> **AgentPass — Paspor Badge On-Chain untuk Pemegang Agent ID**
>
> AgentPass sudah live di BNB Chain. Ini paspor kredensial on-chain untuk
> pemegang Agent ID (.ai): badge yang kamu dapat lewat aksi nyata, menempel
> pada nama .ai kamu yang tidak bisa dipindah — jadi bukti reputasi, bukan
> sekadar saldo.
>
> **5 badge:**
> 1. Daily Proof — check-in 1x sehari (UTC), streak tercatat.
> 2. First Mark — tinggalkan pesan publik pertama (maks 280 karakter).
> 3. Tipper — tip BNB ke pemegang Agent ID lain, diteruskan 100%, tanpa fee.
> 4. Builder — klaim kontrak BSC yang kamu deploy dan terverifikasi.
> 5. Early Agent — hanya untuk 100 pemegang badge pertama.
>
> **Cara ikut (1 menit):**
> 1. Buka [URL SITUS]
> 2. Connect wallet yang memegang Agent ID .ai kamu.
> 3. Check-in harian — badge Daily Proof langsung tercatat on-chain.
> 4. (Opsional) Tinggalkan mark, tip agent lain, atau klaim badge Builder.
>
> **Yang perlu kamu tahu:**
> - Semua aksi butuh Agent ID — tanpa .ai, kontrak menolak transaksi.
> - Gas kecil: check-in ulang ~0,000003 BNB.
> - Tanpa owner, tanpa fee, tanpa token. Badge = reputasi. Tidak ada janji
>   keuntungan atau return dalam bentuk apa pun.
> - Setiap badge bisa dicek siapa saja di BscScan.
>
> Situs: [URL SITUS]
> Repo (open-source): [URL REPO]
> Kontrak: 0xa6Ef7BEb5892b9d07978a554F4ee982439531325
>
> Dibangun untuk Binance Agent ID Hackathon.
> #BinanceWalletHackathon #AgenticWallet

### 5.8 Thread / long announcement — EN (for X thread, Telegram, Discord)

> **AgentPass — On-Chain Badge Passport for Agent ID Holders**
>
> AgentPass is live on BNB Chain. It is an on-chain credential passport for
> Agent ID (.ai) holders: badges earned through real actions, attached to
> your non-transferable .ai name — proof of reputation, not a balance.
>
> **5 badges:**
> 1. Daily Proof — check in once a day (UTC), streak recorded.
> 2. First Mark — leave your first public message (max 280 characters).
> 3. Tipper — tip BNB to another Agent ID holder, forwarded 100%, no fee.
> 4. Builder — claim a BSC contract you deployed and verified.
> 5. Early Agent — only for the first 100 badge holders.
>
> **How to join (1 minute):**
> 1. Open [URL SITUS]
> 2. Connect the wallet holding your .ai Agent ID.
> 3. Check in daily — the Daily Proof badge is recorded on-chain.
> 4. (Optional) Leave a mark, tip another agent, or claim the Builder badge.
>
> **What you should know:**
> - Every action requires an Agent ID — without .ai, the contract rejects it.
> - Tiny gas: repeat check-in ~0.000003 BNB.
> - No owner, no fees, no token. Badges are reputation. No promise of
>   profit or returns of any kind.
> - Every badge is verifiable by anyone on BscScan.
>
> Site: [URL SITUS]
> Repo (open-source): [URL REPO]
> Contract: 0xa6Ef7BEb5892b9d07978a554F4ee982439531325
>
> Built for the Binance Agent ID Hackathon.
> #BinanceWalletHackathon #AgenticWallet

## 6. Timeline 19 Nov → 9 Des 2026

| Minggu | Tanggal | Milestone | Aksi |
|---|---|---|---|
| 0 | 19 Nov | **Deploy DONE** (kontrak live ~14:28 WIB) | Isi `config.js` (alamat + DEPLOY_BLOCK dari receipt), verifikasi BscScan, publish repo + situs |
| 1 | 20–26 Nov | Situs live + **10 alamat unik pertama** | Posting X #1–#2 (ID+EN peluncuran & cara ikut); 1 pengumuman di SPACE ID Discord + BNB Chain Telegram; pantau metrik harian; perbaiki bug UX dari 10 pengguna pertama |
| 2 | 27 Nov–3 Des | **20 alamat unik** (total) | Posting X #3 (Early Agent — dorong yang belum klaim); 1 posting di Threads + 1 grup FB Indonesia; sapa komunitas GLOOP/Jager lewat kanal publik mereka (1x); ingatkan streak (check-in harian = alasan kembali tiap hari) |
| 3 | 4–9 Des | **30+ alamat unik (target 40)** | Posting rekap progres ("X dari 30 alamat sudah check-in"); dorong tip antar-agent (1 tip = 1 alamat baru bila penerimanya belum pernah interaksi — tapi JANGAN memaksa); 9 Des 15:00 WIB: tutup hitungan, kunci angka final |
| Penutup | 10–17 Des | Review internal | Siapkan bukti 30 alamat (daftar alamat + tx hash contoh) untuk form/juri; kirim link X ke survei Community Promotion Award bila ikut |

### Bila laju lambat (tanpa spam, tanpa promosi berbayar)

- **<5 alamat di akhir minggu 1:** masalahnya hampir pasti distribusi, bukan
  produk. Tambah 1 kanal yang belum dipakai (Threads → FB grup → sapa langsung
  5–10 pemegang .ai aktif dari agent.bas.io, pesan personal sopan, 1x per orang,
  tanpa follow-up bila tidak dibalas). Periksa juga: apakah situs benar-benar
  bisa dibuka + connect wallet jalan (uji dari wallet segar).
- **10–19 alamat di akhir minggu 2:** dorong aksi kedua dari pengguna lama:
  pengguna lama yang tip ke teman .ai-nya = alamat baru tanpa perlu cari orang
  asing. Posting "cara tip" + contoh mark menarik. Minta 3–5 pengguna pertama
  (yang sudah percaya) untuk repost — bukan bayar, sekadar minta tolong.
- **20–29 alamat di 7 Des:** fokus ke Early Agent (sisa slot makin sedikit =
  alasan sah untuk posting lagi). Hitung mundur publik tiap hari
  ("X alamat lagi menuju 30"). JANGAN: beli follower/interaksi, airdrop janji,
  atau posting berulang ke grup yang sama.
- **<30 alamat di 9 Des 12:00 WIB:** terima hasil apa adanya untuk Innovation
  Award, tapi angka tetap berguna untuk Project Awards (metrik on-chain) dan
  portofolio. Jangan lakukan apa pun yang melanggar aturan di jam terakhir
  (spam massal = risiko diskualifikasi reputasi).
- **Yang TIDAK PERNAH dilakukan:** spam DM massal, posting berulang di grup yang
  sama, janji cuan/airdrop/return, klaim afiliasi Binance, minta seed/key,
  bayar untuk interaksi, buat akun palsu / banyak alamat sendiri (juri bisa
  memeriksa — 1 alamat = 1 Agent ID, dan Agent ID 1 per wallet).

## 7. Checklist sebelum posting apa pun

- [ ] Situs live & bisa check-in end-to-end (uji dari wallet pemegang .ai).
- [ ] Repo publik + kontrak terverifikasi di BscScan.
- [ ] `[URL SITUS]` dan `[URL REPO]` di semua draf diganti URL final.
- [ ] Panjang tiap draf X dihitung ulang sesudah URL final dimasukkan (≤280).
- [ ] DEPLOY_BLOCK terisi (§3.1) supaya angka metrik bisa diverifikasi.
- [ ] Selena menyetujui teks + kanal + jadwal posting.
