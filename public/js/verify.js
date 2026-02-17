import { isValidHash } from "./services/crypto.js";
import { displayFileHash } from "./services/utils.js";
import { EthereumService } from "./services/ethereum.js";
import { SolanaService } from "./services/solana.js";
import { PolygonService } from "./services/polygon.js";

const ethService = new EthereumService();
const solService = new SolanaService();
const polService = new PolygonService();

// UI
const fileInput = document.getElementById("fileInput");
const fileMeta = document.getElementById("fileMeta");
const hashOut = document.getElementById("hashOut");
const btnCopy = document.getElementById("btnCopy");
const btnVerify = document.getElementById("btnVerify");

let selectedFile = null;

// ETH
const ethBadge = document.getElementById("ethBadge");

// SOL
const solBadge = document.getElementById("solBadge");

//POL
const polygonBadge = document.getElementById("polygonBadge");

function updateVerifyButton() {
    const hash = hashOut.value.trim();
    btnVerify.disabled = isValidHash(hash);
}

function setBadge(badge, isAnchored) {
    const badgeType = isAnchored ? "ok" : "warn";
    const badgeText = isAnchored ? "Anchored" : "Not Anchored";
    badge.className = `badge ${badgeType}`;
    badge.textContent = badgeText;
}

function setBadgesLoading() {
    ethBadge.className = `badge`;
    solBadge.className = `badge`;
    polygonBadge.className = `badge`;

    ethBadge.textContent = `Verifying...`;
    solBadge.textContent = `Verifying...`;
    polygonBadge.textContent = `Verifying...`;
}

function clearBadges() {
    ethBadge.className = "badge";
    solBadge.className = "badge";
    polygonBadge.className = "badge";

    ethBadge.textContent = "Uknown";
    solBadge.textContent = "Uknown";
    polygonBadge.textContent = "Uknown";
}

// select file
fileInput.addEventListener("change", async (e) => {
    selectedFile = e.target.files?.[0] || null;
    hashOut.value = "";
    updateVerifyButton();

    if (!selectedFile) {
        fileMeta.textContent = "";
        return;
    }

    await displayFileHash(selectedFile, fileMeta, hashOut);
    clearBadges();
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


btnVerify.addEventListener("click", async () => {
    try {
        const hash = hashOut.value.trim();

        setBadgesLoading();
        const isEthAnchored = await ethService.isAnchored(hash);
        const isSolAnchored = await solService.isAnchored(hash);
        const isPolygonAnchored = await polService.isAnchored(hash);

        setBadge(ethBadge, isEthAnchored);
        setBadge(solBadge, isSolAnchored);
        setBadge(polygonBadge, isPolygonAnchored);
    } catch (err) {
        alert("Error verifying anchor status");
        clearBadges();
        console.log(err.message);
    }
});

