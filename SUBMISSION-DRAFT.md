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
| Kontrak ter-deploy | ✅ 19 Nov 2026 14:28:05 WIB — `0xa6Ef7BEb5892b9d07978a554F4ee982439531325` (BSC mainnet, chain 56), deployer wallet personal `0x13C7F560367AfC703d9885c5597a91A27919ac24`, nonce 122→123, gas used 1.162.366 @ 0,056297612 gwei, biaya 0,0000654384 BNB, sisa personal ~0,0000155616 BNB. Tx: `0x073d6368d9429499ca45d6e2934c49e623764024e78a47c0ec1ad7ab2475b49b`, blok **134463283** (txIndex 40), status sukses. |
| Verifikasi source | ✅ **Sourcify exact match** (creation + runtime), 19 Nov 2026 14:28:18 WIB — https://sourcify.dev/server/v2/contract/56/0xa6Ef7BEb5892b9d07978a554F4ee982439531325 (solc 0.8.20, evmVersion shanghai, optimizer 200 runs; bytecode runtime identik byte-per-byte kecuali hash metadata IPFS). BscScan UI: ⏳ belum bisa dari VM (situs 403, API v1 pensiun + v2 butuh API key) — verifikasi via UI browser menyusul, mestinya langsung lolos. |
| Repo publik / situs live | ⏳ SIAP PUSH — git init + commit `c1ee5e5` + `ffee671` (config.js terisi, README lengkap); branch `gh-pages` siap; push tertahan auth GitHub (gh belum login — repo `rizalagustin448-bit/agentpass` belum dibuat). URL yang diharapkan: https://rizalagustin448-bit.github.io/agentpass/ |
| Link submission form | ⏳ BELUM — isi saat submit (form resmi Binance, tidak bisa diedit sesudah submit) |

## Checklist yang masih butuh Selena

- [x] **Tap deploy** — SELESAI 19 Nov 2026 14:28:05 WIB: `AgentPass.sol` ter-deploy dari wallet PERSONAL Selena (0x13C7F560367AfC703d9885c5597a91A27919ac24), kontrak `0xa6Ef7BEb5892b9d07978a554F4ee982439531325`, nonce 122→123, biaya 0,0000654384 BNB, sisa ~0,0000155616 BNB. Tx `0x073d6368d9429499ca45d6e2934c49e623764024e78a47c0ec1ad7ab2475b49b`, blok 134463283, gas used 1.162.366 @ 0,056297612 gwei.
- [x] **Verifikasi source** — SELESAI via Sourcify exact match (creation + runtime), 19 Nov 2026 14:28:18 WIB: https://sourcify.dev/server/v2/contract/56/0xa6Ef7BEb5892b9d07978a554F4ee982439531325. Bytecode runtime identik byte-per-byte dengan kompilasi lokal (solc 0.8.20, shanghai, optimizer 200). BscScan UI menyusul (butuh browser/API key).
- [x] **Isi `frontend/config.js`** — SELESAI: alamat kontrak + `DEPLOY_BLOCK: 134463283` (commit `ffee671`).
- [ ] **Publish repo + hosting frontend** — BUTUH AUTH GITHUB Selena: buat repo publik `rizalagustin448-bit/agentpass`, push `main` + `gh-pages`, aktifkan Pages (perintah persis di bawah § Perintah push).
- [ ] **Submit form hackathon** — isi form resmi dengan payload § Payload submission di bawah. JANGAN submit sebelum repo + situs live.
- [ ] **Promosi 30 alamat** — rekrut ≥30 alamat pemegang Agent ID untuk check-in/klaim
  badge (syarat Innovation Award: proyek live + ≥30 alamat Agent ID berinteraksi).
  Target metrik harian: check-in + klaim badge + tip (tx berulang per user).
  Draf + kanal + lembar lacak: `PROMOTION.md` (jangan posting tanpa persetujuan Selena).

## Angka kunci (untuk form)

- Gas deploy aktual: 1.162.366 @ 0,056297612 gwei — biaya 0,0000654384 BNB (receipt, blok 134463283).
- Test: 20/20 pass (Hardhat lokal).
- Biaya user: check-in ulang ~0,0000026 BNB; check-in pertama ~0,0000093 BNB (@0,05 gwei).

## Perintah push (jalankan sesudah repo GitHub dibuat — butuh auth)

```bash
cd ~/workspace/agent-id-hackathon
git remote add origin https://github.com/rizalagustin448-bit/agentpass.git
git push -u origin main
git push origin gh-pages
```

Lalu di browser (repo `agentpass` → Settings → Pages): Source **Deploy from a branch** → Branch **`gh-pages`** → folder `/ (root)` → Save. Situs live: https://rizalagustin448-bit.github.io/agentpass/

## Payload submission (SIAP TAP — JANGAN submit tanpa tap Selena)

> Isi form resmi hackathon dengan field berikut. Repo + situs HARUS sudah live
> sebelum submit (URL di bawah masih "diharapkan" sampai push + Pages aktif).

| Field form | Isi |
|---|---|
| Nama proyek | **AgentPass** — Paspor Kredensial On-Chain untuk Pemegang Agent ID |
| Deskripsi | AgentPass adalah paspor kredensial on-chain untuk pemegang Agent ID (`.ai`). Badge didapat lewat aksi nyata yang terverifikasi on-chain dan menempel pada nama `.ai` yang non-transferable — kredensial tidak bisa dijual atau dipindah. Setiap agent punya profil publik: nama `.ai` + badge + streak check-in + statistik tip/mark. dApp lain bisa membaca badge lewat view function dan menggunakannya untuk gating fitur. Lima badge v1: Daily Proof (check-in harian UTC + streak), First Mark (pesan publik), Tipper (tip BNB diteruskan 100%, tanpa fee/custody), Builder (deploy kontrak BSC terverifikasi), Early Agent (100 pemegang badge pertama). |
| Pemakaian Agent ID | Semua fungsi tulis (`checkIn`, `leaveMark`, `tip`, `claimBuilder`, `claimEarly`) revert bila `balanceOf(msg.sender) == 0` pada kontrak Agent ID `0x60b9262456de011f7d15a54cdd8c48baaa8b022f`. Tip hanya antar pemegang Agent ID. Profil terikat nama `.ai` non-transferable; frontend memverifikasi kepemilikan nama on-chain (`ownerOf(keccak256(label))`) + avatar dari `tokenURI`. View `hasBadge`/`badgesOf`/`profile`/`totalHolders` bisa dibaca dApp mana pun. |
| Alamat kontrak | `0xa6Ef7BEb5892b9d07978a554F4ee982439531325` (BSC mainnet, chain 56) |
| Tx deploy | `0x073d6368d9429499ca45d6e2934c49e623764024e78a47c0ec1ad7ab2475b49b` (blok 134463283, 19 Nov 2026 14:28:05 WIB) |
| Verifikasi source | Sourcify exact match: https://sourcify.dev/server/v2/contract/56/0xa6Ef7BEb5892b9d07978a554F4ee982439531325 — BscScan: https://bscscan.com/address/0xa6Ef7BEb5892b9d07978a554F4ee982439531325 |
| Repo (publik) | https://github.com/rizalagustin448-bit/agentpass (⏳ push menyusul auth) |
| Situs live | https://rizalagustin448-bit.github.io/agentpass/ (⏳ Pages menyusul push) |
| Catatan | Kontrak tanpa owner/admin/pause/fee; tanpa token; badge = reputasi, bukan return. Test 20/20 (Hardhat). |
