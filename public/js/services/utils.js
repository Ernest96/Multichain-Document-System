import { sha256FileHex } from "./crypto.js";

export function getEvmProviders() {
    const out = [];

    const eth = window.ethereum;
    if (eth) {
        const providers = Array.isArray(eth.providers) ? eth.providers : [eth];
        for (const p of providers) {
            out.push({
                provider: p,
                name:
                    (p.isMetaMask && "MetaMask") ||
                    (p.isRabby && "Rabby") ||
                    (p.isCoinbaseWallet && "Coinbase Wallet") ||
                    (p.isTrust && "Trust Wallet") ||
                    (p.isBraveWallet && "Brave Wallet") ||
                    "EVM Wallet",
            });
        }
    }

    const phantomEvm = window.phantom?.ethereum;
    if (phantomEvm) {
        out.push({ provider: phantomEvm, name: "Phantom (EVM)" });
    }

    return out;
}

export async function pickEvmProvider() {
    const list = getEvmProviders();
    if (!list.length) return null;
    if (list.length === 1) return list[0].provider;

    const optionsText = list.map((x, i) => `${i + 1}) ${x.name}`).join("\n");
    const ans = prompt(`Choose wallet:\n${optionsText}\n\nType a number:`);

    const idx = Number(ans) - 1;
    if (!Number.isInteger(idx) || idx < 0 || idx >= list.length) return null;

    return list[idx].provider;
}

export async function displayFileHash(selectedFile, fileMeta, hashOut) {
  try {
    if (!selectedFile) {
      fileMeta.textContent = "Select a file first.";
      return;
    }

    fileMeta.textContent = "Computing SHA-256…";
    const hash = await sha256FileHex(selectedFile);

    hashOut.value = hash;
    fileMeta.textContent = `Hash computed ✅ (${selectedFile.name})`;


  } catch (err) {
    fileMeta.textContent = `Hash error: ${err?.message}`;
  }
};