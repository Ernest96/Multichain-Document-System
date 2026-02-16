import { isValidHash } from "./services/crypto.js";
import { displayFileHash } from "./services/utils.js";
import { EthereumService } from "./services/ethereum.js";

const ethService = new EthereumService();

// UI
const fileInput = document.getElementById("fileInput");
const fileMeta = document.getElementById("fileMeta");
const hashOut = document.getElementById("hashOut");
const btnCopy = document.getElementById("btnCopy");
const btnApprove = document.getElementById("btnApprove");
const btnCheckSignature = document.getElementById("btnCheckSignature");
const chainLog = document.getElementById("chainLog");
const btnEthConnect = document.getElementById("btnEthConnect");

let selectedFile = null;
let ethConnected = false;

btnApprove.disabled = true;
btnCheckSignature.disabled = true;

function updateButtons() {
    const hash = hashOut.value.trim();
    btnApprove.disabled = !(ethConnected && isValidHash(hash));
    btnCheckSignature.disabled = !(ethConnected && isValidHash(hash));
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
btnEthConnect.addEventListener("click", async () => {
    try {
        setChainLog("Connecting Wallet");
        const addr = await ethService.connect();
        ethConnected = true;

        setChainLog(`✅ Connected: ${addr}`);
    } catch (err) {
        ethConnected = false;
        setChainLog(`❌ Connect error: ${err?.message}`);
    } finally {
        updateButtons();
    }
});


btnApprove.addEventListener("click", async () => {
    try {
        const hash = hashOut.value.trim();

        const isAnchored = await ethService.isAnchored(hash);
        if (!isAnchored) {
            setChainLog(`⚠️ Document ${selectedFile.name} not anchored on Ethereum`);
            return;
        }

        const isApproved = await ethService.isApproved(hash);
        if (isApproved) {
            setChainLog(`⚠️ Document ${selectedFile.name} already approved on Ethereum by this user`);
            return;
        }

        setChainLog("Sending transaction…");
        const tx = await ethService.approve(hash);

        setChainLog(`✅ Document ${selectedFile.name} is approved \nTx: ${tx.hash}`);
    } catch (err) {
        setChainLog(`❌ Error approving document: ${err.message}`);
    }
});

btnCheckSignature.addEventListener("click", async () => {
    try {
        const hash = hashOut.value.trim();

        const isAnchored = await ethService.isAnchored(hash);
        if (!isAnchored) {
            setChainLog(`⚠️ Document ${selectedFile.name} not anchored on Ethereum`);
            return;
        }

        const isApproved = await ethService.isApproved(hash);
        if (!isApproved) {
            setChainLog(`⚠️ Document ${selectedFile.name} not approved on Ethereum by this user`);
            return;
        }

        setChainLog(`✅ Document ${selectedFile.name} is approved.`);
    } catch (err) {
        setChainLog(`❌ Error approving document: ${err.message}`);
    }
});