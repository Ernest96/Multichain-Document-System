import { isValidHash } from "./services/crypto.js";
import { displayFileHash } from "./services/utils.js";
import { SolanaService } from "./services/solana.js";

const solService = new SolanaService();

// UI
const fileInput = document.getElementById("fileInput");
const fileMeta = document.getElementById("fileMeta");
const hashOut = document.getElementById("hashOut");
const btnCopy = document.getElementById("btnCopy");
const btnApprove = document.getElementById("btnApprove");
const btnCheckSignature = document.getElementById("btnCheckSignature");
const chainLog = document.getElementById("chainLog");
const btnSolConnect = document.getElementById("btnSolConnect");

let selectedFile = null;
let solConnected = false;

btnApprove.disabled = true;
btnCheckSignature.disabled = true;

function updateButtons() {
    const hash = hashOut.value.trim();
    btnApprove.disabled = !(solConnected && isValidHash(hash));
    btnCheckSignature.disabled = !(solConnected && isValidHash(hash));
}

function setChainLog(message) {
    chainLog.textContent = message;
}

// select file
fileInput.addEventListener("change", async (e) => {
    selectedFile = e.target.files?.[0] || null;
    hashOut.value = "";

    if (!selectedFile) {
        fileMeta.textContent = "";
        return;
    }

    await displayFileHash(selectedFile, fileMeta, hashOut);
    updateButtons();
});


// copy event
btnCopy.addEventListener("click", async () => {
    const hash = hashOut.value.trim();
    if (!isValidHash(hash)) {
        fileMeta.textContent = "Nothing to copy. Compute hash first.";
        return;
    }
    await navigator.clipboard.writeText(hash);
    fileMeta.textContent = "Copied ✅";
});

// SOL connect button
btnSolConnect.addEventListener("click", async () => {
    try {
        setChainLog("Connecting Wallet");
        const addr = await solService.connect();
        solConnected = true;

        setChainLog(`✅ Connected: ${addr}`);
    } catch (err) {
        solConnected = false;
        setChainLog(`❌ Connect error: ${err?.message}`);
    } finally {
        updateButtons();
    }
});

btnApprove.addEventListener("click", async () => {
    try {
        const hash = hashOut.value.trim();

        const isAnchored = await solService.isAnchored(hash);
        if (!isAnchored) {
            setChainLog(`⚠️ Document ${selectedFile.name} not anchored on Solana`);
            return;
        }

        const isApproved = await solService.isApproved(hash);
        if (isApproved) {
            setChainLog(`⚠️ Document ${selectedFile.name} already approved on Solana by this user`);
            return;
        }

        setChainLog("Sending transaction…");
        const sig = await solService.approve(hash);

        setChainLog(`✅ Document ${selectedFile.name} is approved \nSig: ${sig}`);
    } catch (err) {
        setChainLog(`❌ Error approving document: ${err.message}`);
    }
});

btnCheckSignature.addEventListener("click", async () => {
    try {
        const hash = hashOut.value.trim();

        const isAnchored = await solService.isAnchored(hash);
        if (!isAnchored) {
            setChainLog(`⚠️ Document ${selectedFile.name} not anchored on Solana`);
            return;
        }

        const isApproved = await solService.isApproved(hash);
        if (!isApproved) {
            setChainLog(`⚠️ Document ${selectedFile.name} not approved on Solana by this user`);
            return;
        }

        setChainLog(`✅ Document ${selectedFile.name} is approved`);
    } catch (err) {
        setChainLog(`❌ Error approving document: ${err.message}`);
    }
});