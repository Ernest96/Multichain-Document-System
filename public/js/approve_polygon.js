import { isValidHash } from "./services/crypto.js";
import { displayFileHash } from "./services/utils.js";
import { PolygonService } from "./services/polygon.js";

const polService = new PolygonService();

// UI
const fileInput = document.getElementById("fileInput");
const fileMeta = document.getElementById("fileMeta");
const hashOut = document.getElementById("hashOut");
const btnCopy = document.getElementById("btnCopy");
const btnApprove = document.getElementById("btnApprove");
const btnCheckSignature = document.getElementById("btnCheckSignature");
const chainLog = document.getElementById("chainLog");
const btnPolConnect = document.getElementById("btnPolConnect");

let selectedFile = null;
let polConnected = false;

btnApprove.disabled = true;
btnCheckSignature.disabled = true;

function updateButtons() {
    const hash = hashOut.value.trim();
    btnApprove.disabled = !(polConnected && isValidHash(hash));
    btnCheckSignature.disabled = !(polConnected && isValidHash(hash));
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

// ETH connect button
btnPolConnect.addEventListener("click", async () => {
    try {
        setChainLog("Connecting Wallet");
        const addr = await polService.connect();
        polConnected = true;

        setChainLog(`✅ Connected: ${addr}`);
    } catch (err) {
        polConnected = false;
        setChainLog(`❌ Connect error: ${err?.message}`);
    } finally {
        updateButtons();
    }
});


btnApprove.addEventListener("click", async () => {
    try {
        const hash = hashOut.value.trim();

        const isAnchored = await polService.isAnchored(hash);
        if (!isAnchored) {
            setChainLog(`⚠️ Document ${selectedFile.name} not anchored on Polygon`);
            return;
        }

        const isApproved = await polService.isApproved(hash);
        if (isApproved) {
            setChainLog(`⚠️ Document ${selectedFile.name} already approved on Polygon by this user`);
            return;
        }

        setChainLog("Sending transaction…");
        const tx = await polService.approve(hash);

        setChainLog(`✅ Document ${selectedFile.name} is approved \nTx: ${tx.hash}`);
    } catch (err) {
        setChainLog(`❌ Error approving document: ${err.message}`);
    }
});

btnCheckSignature.addEventListener("click", async () => {
    try {
        const hash = hashOut.value.trim();

        const isAnchored = await polService.isAnchored(hash);
        if (!isAnchored) {
            setChainLog(`⚠️ Document ${selectedFile.name} not anchored on Polygon`);
            return;
        }

        const isApproved = await polService.isApproved(hash);
        if (!isApproved) {
            setChainLog(`⚠️ Document ${selectedFile.name} not approved on Polygon by this user`);
            return;
        }

        setChainLog(`✅ Document ${selectedFile.name} is approved.`);
    } catch (err) {
        setChainLog(`❌ Error approving document: ${err.message}`);
    }
});