# Laporan Verifikasi Deploy AgentPass

Tanggal verifikasi: 19 Nov 2026 ~14:50 WIB. Tanpa transaksi apa pun (hanya baca on-chain + compile lokal).

## 1. Tx hash + receipt deploy — DITEMUKAN

- **Tx hash:** `0x073d6368d9429499ca45d6e2934c49e623764024e78a47c0ec1ad7ab2475b49b`
- **Blok deploy:** 134463283 (txIndex 40), timestamp **2026-11-19 14:28:05 WIB**
- **From:** `0x13C7F560367AfC703d9885c5597a91A27919ac24`, nonce 122, to: null (contract creation), value 0
- **Gas price:** 0,056297612 gwei — **gas used:** 1.162.366 (limit 1.407.309)
- **Status receipt:** 1 (sukses)
- **contractAddress dari receipt:** `0xa6Ef7BEb5892b9d07978a554F4ee982439531325` ✓ cocok
- **Biaya:** 0,0000654384 BNB — sama persis dengan angka yang dilaporkan saat deploy
- **Input tx:** 5.369 byte, sha256 `61d8b20436d34df89e78a8cf781ddf07a36fa0f69ea2bb053f43c56cb5086a1f`
- **Link:** https://bscscan.com/tx/0x073d6368d9429499ca45d6e2934c49e623764024e78a47c0ec1ad7ab2475b49b

Cara menemukannya: binary search nonce gagal — endpoint dataseed mengembalikan `missing trie node` untuk state historis, dan publicnode membatasi arsip + rate limit. Tx akhirnya ditemukan dengan scan blok berisi transaksi lengkap via dataseed (blok 134.463.000–134.464.000). Catatan: dua scan blok sebelumnya gagal karena salah baca hex — `0x803c297` = 134.464.151, bukan 134.422.935 — sehingga rentang yang di-scan meleset ~42.000 blok.

Catatan hash: sha256 creation `61c8710c…` yang tercatat saat deploy TIDAK cocok dengan input tx (`61d8b204…`) maupun compile lokal. Kemungkinan dihitung dari salinan bytecode sisi Remix sebelum argumen constructor ditempel. Bukan penentu — bukti penentu adalah perbandingan byte-langsung di bawah (butir 2).

## 2. Kecocokan bytecode — MATCH

- Runtime code on-chain: 5.124 byte (5.071 byte kode + 53 byte metadata).
- Artifact lokal default (hardhat, evmVersion paris) TIDAK sama: beda panjang (5.250 byte) dan byte ke-11 sudah beda (`5f` PUSH0 on-chain vs `6000` PUSH1 0x00 lokal).
- Compile ulang dengan **solc 0.8.20, optimizer 200 runs, evmVersion shanghai** (di proyek sementara /tmp/hh-test, repo tidak diubah kecuali recompile artifact): runtime code **identik byte-per-byte** dengan on-chain, kecuali:
  - hash metadata IPFS 32 byte (wajar: lingkungan compile Remix vs Hardhat berbeda, path source berbeda);
  - 7 slot immutable `agentId` (0x60b9262456de011f7d15a54cdd8c48baaa8b022f) yang ter-embed di 7 titik pemakaian — di artifact lokal slot-slot itu nol, sesuai sifat artifact.
- Input creation tx (5.369 byte) vs compile lokal shanghai + argumen constructor: identik kecuali persis 32 byte hash metadata IPFS (byte 5294–5325).
- Kesimpulan: **MATCH — kontrak yang ter-deploy adalah persis source repo `contracts/AgentPass.sol` yang dikompilasi dengan solc 0.8.20 + optimizer 200 + evmVersion shanghai + constructor arg agentId 0x60b9262456de011f7d15a54cdd8c48baaa8b022f.**

## 3. Verifikasi source

### Sourcify — SUDAH TERVERIFIKASI (exact match)
- Status: `exact_match` — creationMatch `exact_match`, runtimeMatch `exact_match`
- verifiedAt: 2026-11-19T07:28:18Z (14:28:18 WIB, 13 detik sesudah blok deploy), matchId 59511761
- Compiler: 0.8.20+commit.a1b79de6, evmVersion shanghai, optimizer enabled 200 runs, source `AgentPass.sol` **identik byte-per-byte dengan source repo** (10.872 karakter)
- Link API: https://sourcify.dev/server/v2/contract/56/0xa6Ef7BEb5892b9d07978a554F4ee982439531325
- Link UI: https://sourcify.dev/#/lookup/0xa6Ef7BEb5892b9d07978a554F4ee982439531325
- Catatan: verifikasi ini sudah ada sebelum saya memeriksa (kemungkinan auto-verify Remix saat deploy) — saya tidak submit apa pun, hanya membaca statusnya.

### BscScan — TIDAK BISA DICEK DARI VM INI
- `bscscan.com` → HTTP 403 (masih terblokir, sama seperti sebelumnya)
- `api.bscscan.com` → HTTP 301 ke `docs.etherscan.io` (API v1 dipensiunkan)
- Etherscan v2 API (`api.etherscan.io/v2/api?chainid=56…`) → `{"status":"0","message":"NOTOK","result":"Missing/Invalid API Key"}` — butuh API key, dan saya tidak mengarang key.
- Status verifikasi BscScan tidak bisa ditentukan dari VM ini. Opsi lanjutan: (a) verifikasi lewat UI BscScan di browser (tidak butuh API key, hanya butuh akses browser yang tidak terblokir); (b) pakai API key Etherscan/BscScan bila ada. Karena Sourcify sudah exact match, verifikasi BscScan lewat UI mestinya langsung lolos dengan source + setting yang sama.

## 4. Cek baca on-chain (eth_call, blok terbaru)

| View | Hasil | Harapan |
|---|---|---|
| `agentId()` | `0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F` | ✓ cocok |
| `totalHolders()` | 0 | ✓ cocok |
| `totalCheckIns()` | 0 | — |
| `DAY_SECONDS()` | 86400 | — |
| `EARLY_CAP()` | 100 | — |
| `BADGE_DAILY / MARK / TIPPER / BUILDER / EARLY` | 1 / 2 / 3 / 4 / 5 | ✓ |
| `MAX_MARK_LENGTH()` | 280 | ✓ |
| `badgesOf(deployer)` | [false × 5] | — |
| `profile(deployer)` | 0, 0, 0, 0, 0 | — |

Kontrak segar: belum ada interaksi apa pun (0 holder, 0 check-in). Nonce deployer saat ini 123 (122→123 di blok deploy).
