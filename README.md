# AgentPass — Paspor Kredensial On-Chain untuk Pemegang Agent ID

**Hackathon:** Binance Agent ID Hackathon (60.000 USDC) — submission 18 Nov–9 Des 2026.
**Konsep:** lihat [`CONCEPT.md`](CONCEPT.md) (konsep B — Agent Badge Passport, terpilih 19 Nov 2026).

AgentPass adalah paspor kredensial on-chain: pemegang Agent ID (`.ai`, kontrak
`0x60b9262456de011f7d15a54cdd8c48baaa8b022f`) mendapatkan badge lewat aksi nyata
yang terverifikasi on-chain. Badge menempel pada nama `.ai` yang non-transferable —
kredensial tidak bisa dijual/dipindah. dApp lain bisa membaca badge lewat view function.

## Badge (v1)

| ID | Badge | Cara dapat |
|----|-------|-----------|
| 1 | Daily Proof | Check-in 1x/hari UTC (streak tercatat) |
| 2 | First Mark | Tinggalkan pesan publik pertama (maks 280 karakter) |
| 3 | Tipper | Tip BNB ke pemegang Agent ID lain (diteruskan 100%, tanpa fee) |
| 4 | Builder | Klaim kontrak BSC yang kamu deploy (terverifikasi BscScan) |
| 5 | Early Agent | 100 pemegang badge pertama |

## Struktur

```
contracts/AgentPass.sol    — kontrak utama (Solidity ^0.8.20, tanpa owner/admin/pause/fee)
contracts/MockAgentId.sol  — mock ERC-721 untuk test lokal SAJA
test/AgentPass.test.js      — 20 test (alur + edge)
frontend/index.html        — situs statis (tanpa build step)
frontend/app.js            — logika dApp (ethers v6 via CDN)
frontend/config.js         — alamat kontrak + blok deploy (ISI SETELAH DEPLOY)
```

## Test (lokal)

```bash
cd ~/workspace/agent-id-hackathon
npm install          # install lokal di folder ini (Hardhat 2.28.0, JANGAN global)
npx hardhat test     # 20 test — HARUS semua hijau
```

Hasil 19 Nov 2026: **20 passing, 0 failing.**

## Gas (diukur Hardhat lokal, optimizer runs=200)

| Aksi | Gas |
|------|-----|
| Deploy AgentPass | **1.188.137** |
| checkIn (pertama, +badge DAILY) | 186.674 |
| checkIn (ulang, badge sudah ada) | 51.846 |
| leaveMark | 143.306 |
| tip | 154.790 |
| claimBuilder | 120.085 |
| claimEarly | 97.045 |

### Biaya deploy

Harga gas BSC diukur langsung dari RPC publik `bsc-dataseed.bnbchain.org`
(`eth_gasPrice`) pada 19 Nov 2026 ~13:15 WIB: **0,05 gwei** — dua kali pengecekan
hasil sama. (Catatan: harga gas bisa naik sewaktu-waktu; cek ulang saat deploy.)

| Harga gas | Biaya deploy (1.188.137 gas) | vs saldo wallet agentic ~0,00016 BNB |
|-----------|------------------------------|--------------------------------------|
| 0,05 gwei (terukur) | **0,0000594 BNB** | cukup — 37% saldo, sisa ~0,00010 BNB |
| 0,1 gwei | 0,0001188 BNB | cukup, sisa ~0,00004 BNB |
| 1 gwei | 0,0011881 BNB | **TIDAK cukup** (7,4x saldo) |
| 3 gwei | 0,0035644 BNB | **TIDAK cukup** |
| 5 gwei | 0,0059407 BNB | **TIDAK cukup** |

**Kesimpulan:** deploy HANYA saat harga gas rendah (≤0,1 gwei, idealnya 0,05 gwei
seperti terukur) — atau top-up wallet dulu. Biaya transaksi user sesudah deploy
kecil: check-in ulang ~0,0000026 BNB @0,05 gwei; check-in pertama ~0,0000093 BNB.

## Deploy (TER-DEPLOY ✅ 19 Nov 2026)

- **Kontrak AgentPass:** [`0xa6Ef7BEb5892b9d07978a554F4ee982439531325`](https://bscscan.com/address/0xa6Ef7BEb5892b9d07978a554F4ee982439531325) — BSC mainnet (chain 56)
- **Deployer:** wallet personal Selena `0x13C7F560367AfC703d9885c5597a91A27919ac24`
- **Waktu deploy:** 19 Nov 2026 ~14:28 WIB
- **Biaya deploy:** 0,0000654384 BNB — sisa wallet personal ~0,0000155616 BNB
- **Tx hash deploy:** `TX_HASH_MENYUSUL` (belum terverifikasi — diisi setelah dicek di BscScan)
- **Blok deploy:** `DEPLOY_BLOCK_MENYUSUL` (belum terverifikasi — diisi setelah dicek di BscScan)
- **BscScan:** https://bscscan.com/address/0xa6Ef7BEb5892b9d07978a554F4ee982439531325

Langkah sesudah deploy (belum semua selesai):

1. ✅ Deploy dari wallet personal (nonce 122, gas ≤0,06 gwei).
2. ⏳ Verifikasi source di BscScan (flatten / multi-file, lisensi MIT, optimizer runs 200).
3. ⏳ Isi `frontend/config.js`: `AGENTPASS_ADDRESS` + `DEPLOY_BLOCK` (setelah tx hash/blok terverifikasi).
4. ⏳ Host `frontend/` sebagai situs statis (lihat "Situs live" di bawah) — tanpa build step.
5. ⏳ Uji end-to-end di mainnet: connect wallet → check-in → mark → tip kecil → klaim badge.

## Situs live

- **URL:** https://rizalagustin448-bit.github.io/agentpass/ — ⏳ **menyusul setelah GitHub Pages aktif** (branch `gh-pages` sudah disiapkan di repo lokal, belum di-push).
- Frontend statis di `frontend/` (tanpa build step, ethers v6 via CDN).

## Resolusi nama .ai (TERVERIFIK, bukan tebakan)

Kontrak Agent ID **tidak punya enumerable** — `totalSupply()` dan `tokenByIndex(0)`
revert saat dipanggil via RPC publik (diuji 19 Nov 2026). Jadi alamat → nama
**tidak bisa** dienumerasi murni on-chain.

Yang **terverifikasi berhasil** (via `bsc-dataseed.bnbchain.org`, 19 Nov 2026):
- `tokenId = keccak256(label)` — `ownerOf(keccak256("agent"))` =
  `0x17151e925274E878912D339760132E966dEE67C3`; `ownerOf(keccak256("binance"))` =
  `0x5E3fBbc8D260a63C9fe19CbBb0A9d5792C3375eA`; label belum terdaftar (`"ai"`,
  `"test"`, `"sellenawiee"`) revert.
- `tokenURI(keccak256("agent"))` =
  `https://agentid.prd.space.id/metadata/agent.json` — host ini **dibaca dari
  kontrak**, bukan ditebak. Isi metadata: `{"name": "agent", "image": "https://agentid-nft.prd.space.id/.../image.png", "description": "Binance Agent Id"}`.
  (Catatan: `binance.json` mengembalikan `{"error":{"code":"not_found"}}` — metadata
  tidak tersedia untuk semua nama; frontend memperlakukannya opsional.)

**Alur di frontend:** user mengetik label `.ai`-nya sendiri → frontend menghitung
`keccak256(label)`, memanggil `ownerOf`, dan hanya menampilkan nama bila pemiliknya
= alamat wallet yang terhubung → lalu memuat metadata (avatar) dari `tokenURI`.
Bila verifikasi gagal, tampilkan alamat terpotong + "Agent ID ✓".

API SPACE ID / NodeReal untuk reverse lookup butuh API key dan **tidak** dipakai —
tidak ada cara publik terverifikasi tanpa key.

## Asumsi Builder

Verifikasi "kontrak terverifikasi di BscScan" **tidak bisa** dilakukan kontrak
Solidity (kontrak tidak bisa memanggil API web). Maka:
- **Frontend** memanggil API publik BscScan
  (`api.bscscan.com/api?module=contract&action=getsourcecode&address=...`)
  SEBELUM tombol klaim aktif.
- Bila API tidak bisa diakses (rate-limit / butuh key / offline), frontend menampilkan
  peringatan jujur dan tetap mengizinkan klaim dengan catatan — user wajib memastikan
  sendiri kontraknya terverifikasi di bscscan.com.
- **Kontrak** hanya mencatat alamat kontrak yang diklaim (`builderContract`) — 1x per
  agent, tidak bisa diubah. Klaim Builder yang tidak jujur bisa diaudit siapa saja
  lewat event `BuilderClaimed` + cek BscScan manual.

## Kepatuhan red lines (hackathon + PROMPT INDUK)

- ✅ Tanpa login QR / pairing code; tanpa simpan sesi/key. Connect injected wallet saja.
- ✅ Semua tx dikonfirmasi user di walletnya; tanpa bypass konfirmasi.
- ✅ Tanpa transfer tanpa izin: tip hanya atas perintah user, langsung ke penerima.
- ✅ Tanpa fee/custody/owner/admin/pause: kontrak tanpa owner; tip meneruskan 100%
  `msg.value` via `call` di tx yang sama; saldo kontrak selalu 0 sesudah tip.
- ✅ Tanpa janji return: badge = reputasi, bukan uang; tidak ada token.
- ✅ Tanpa kumpulkan seed/key; tanpa brand Binance/BNB di nama/kode (nama proyek
  "AgentPass" netral; "Agent ID" adalah nama resmi produk yang dipakai sesuai aturan).
- ✅ Bukan tool lookup wallet orang: profil hanya untuk diri sendiri + badge yang
  diklaim sukarela; leaderboard hanya dari event CheckIn publik.
- ✅ Hanya wallet pemegang Agent ID yang bisa memakai fungsi tulis (`balanceOf > 0`).

## Batasan yang diketahui

- `leaveMark` menghitung panjang pesan dalam **byte**, bukan karakter Unicode —
  pesan non-ASCII (mis. emoji) bisa terpotong batas 280 lebih cepat.
- Leaderboard membaca event dari `DEPLOY_BLOCK` — makin lama makin banyak log;
  untuk skala besar perlu indexer.
- Metadata `.ai` tidak tersedia untuk semua nama (contoh: `binance.json` 404).
