# SUBMISSION DRAFT — AgentPass (Binance Agent ID Hackathon)

> DRAF — belum di-submit. Deploy + submit butuh tap Selena (PROMPT INDUK 12.1).
> Deadline submission: 9 Des 2026 08:00 UTC (15:00 WIB).

## Nama proyek

**AgentPass** — Paspor Kredensial On-Chain untuk Pemegang Agent ID

## Deskripsi singkat

AgentPass adalah paspor kredensial on-chain untuk pemegang Agent ID (`.ai`).
Badge didapat lewat aksi nyata yang terverifikasi on-chain dan menempel pada nama
`.ai` yang non-transferable — kredensial tidak bisa dijual atau dipindah.
Setiap agent punya profil publik: nama `.ai` + badge + streak check-in + statistik
tip/mark. dApp lain bisa membaca badge lewat view function dan menggunakannya
untuk gating fitur (mis. hanya Builder boleh posting).

Lima badge v1: Daily Proof (check-in harian UTC + streak), First Mark (pesan
publik bertanda tangan), Tipper (tip BNB diteruskan 100%, tanpa fee/custody),
Builder (deploy kontrak BSC terverifikasi BscScan), Early Agent (100 pemegang
badge pertama).

## Pemakaian Agent ID

- **Gate di semua fungsi tulis:** `checkIn`, `leaveMark`, `tip`, `claimBuilder`,
  `claimEarly` semuanya revert bila `balanceOf(msg.sender) == 0` pada kontrak
  Agent ID `0x60b9262456de011f7d15a54cdd8c48baaa8b022f`.
- **Tip hanya antar pemegang Agent ID:** penerima wajib pegang Agent ID.
- **Identitas = nama .ai:** profil terikat pada nama `.ai` non-transferable;
  frontend memverifikasi kepemilikan nama on-chain (`ownerOf(keccak256(label))`)
  dan memuat avatar dari `tokenURI` kontrak Agent ID.
- **Komposabel:** `hasBadge`, `badgesOf`, `profile`, `totalHolders` bisa dibaca
  dApp mana pun.

## File / link

| Item | Lokasi / status |
|------|-----------------|
| Konsep terpilih + alasan menang | `CONCEPT.md` (di repo) |
| Kontrak | `contracts/AgentPass.sol` (MIT, tanpa owner/admin/pause/fee) |
| Mock test | `contracts/MockAgentId.sol` (test lokal saja) |
| Test | `test/AgentPass.test.js` — 20/20 hijau |
| Frontend | `frontend/` (statis, ethers v6 CDN) |
| README (cara test/deploy, gas, asumsi) | `README.md` |
| Kontrak ter-deploy | ⏳ BELUM — butuh tap Selena |
| Verifikasi BscScan | ⏳ BELUM — sesudah deploy |
| Repo publik / situs live | ⏳ BELUM — publish sesudah deploy |
| Link submission form | ⏳ BELUM — isi saat submit |

## Checklist yang masih butuh Selena

- [ ] **Tap deploy** — deploy `AgentPass.sol` ke BSC mainnet dari wallet PERSONAL Selena
  (0x13C7F560367AfC703d9885c5597a91A27919ac24), BUKAN agentic — baw tidak bisa deploy
  kontrak. Biaya ~0,0000598 BNB @0,05 gwei (terukur 19 Nov 2026 13:24 WIB, nonce 122);
  saldo personal ~0,000081 BNB, sisa ~0,0000212 BNB. Deploy HANYA saat gas ≤0,06 gwei.
  Alamat kontrak prediksi (nonce 122): 0xa6Ef7BEb5892b9d07978a554F4ee982439531325.
  Cek ulang gas + nonce sesaat sebelum broadcast (`check-personal-deploy.cjs`).
  (Detail: `deploy-params-personal.json` + `deploy-data.txt`.)
- [ ] **Verifikasi BscScan** — verifikasi source kontrak sesudah deploy (gratis, tanpa tx).
- [ ] **Isi `frontend/config.js`** — alamat kontrak + nomor blok deploy.
- [ ] **Publish repo + hosting frontend** — repo publik (GitHub) + situs statis (mis. GitHub Pages).
- [ ] **Submit form hackathon** — isi form resmi dengan nama, deskripsi, link repo/situs/kontrak.
- [ ] **Promosi 30 alamat** — rekrut ≥30 alamat pemegang Agent ID untuk check-in/klaim
  badge (syarat Innovation Award: proyek live + ≥30 alamat Agent ID berinteraksi).
  Target metrik harian: check-in + klaim badge + tip (tx berulang per user).

## Angka kunci (untuk form)

- Gas deploy: 1.188.137 — biaya ~0,0000594 BNB @0,05 gwei (terukur live).
- Test: 20/20 pass (Hardhat lokal).
- Biaya user: check-in ulang ~0,0000026 BNB; check-in pertama ~0,0000093 BNB (@0,05 gwei).
