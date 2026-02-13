import { EthereumService } from "./services/ethereum.js";
import { isValidHash, sha256FileHex } from "./services/crypto.js";

const ethService = new EthereumService();

// UI
const fileInput = document.getElementById("fileInput");
const fileMeta = document.getElementById("fileMeta");
const hashOut = document.getElementById("hashOut");
const btnCopy = document.getElementById("btnCopy");

let selectedFile = null;

// ETH
const btnEthConnect = document.getElementById("btnEthConnect");
const btnEthAnchor = document.getElementById("btnEthAnchor");
const ethLog = document.getElementById("ethLog");
const ethBadge = document.getElementById("ethBadge");
let ethConnected = false;

btnEthAnchor.disabled = true;

function getBadgeText(badgeType) {
  if (badgeType === "ok")
    return "Connected";
  else if (badgeType === "warn")
    return "Needs action";
  else
    return "Not connected";
}

function setEthUI(message, badgeType = "neutral") {
  ethLog.textContent = message;
  ethBadge.className = `badge ${badgeType}`;
  ethBadge.textContent = getBadgeText(badgeType);
}

function updateEthButton() {
  const hash = hashOut.value.trim();
  btnEthAnchor.disabled = !(ethConnected && isValidHash(hash));
}

//calculate hash event
async function calculateHash() {
  try {
    if (!selectedFile) {
      fileMeta.textContent = "Select a file first.";
      return;
    }

    fileMeta.textContent = "Computing SHA-256…";
    const hash = await sha256FileHex(selectedFile);

    hashOut.value = hash;
    fileMeta.textContent = `Hash computed ✅ (${selectedFile.name})`;

    updateEthButton();
  } catch (err) {
    fileMeta.textContent = `Hash error: ${err?.message}`;
  }
};

// select file
fileInput.addEventListener("change", async (e) => {
  selectedFile = e.target.files?.[0] || null;
  hashOut.value = "";
  updateEthButton();

  if (!selectedFile) {
    fileMeta.textContent = "";
    return;
  }

  await calculateHash();
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
    setEthUI("Connecting MetaMask…", "warn");
    const addr = await ethService.connect();
    ethConnected = true;

    setEthUI(`Connected: ${addr}\n`, "ok");
  } catch (err) {
    ethConnected = false;
    setEthUI(`Connect error: ${err?.message}`, "warn");
  } finally {
    updateEthButton();
  }
});

// ETH anchor event
btnEthAnchor.addEventListener("click", async () => {
  const hash = hashOut.value.trim();
  try {
    setEthUI("Sending transaction…", "ok");
    const tx = await ethService.anchor(hash);

    setEthUI(`Anchored ✅\nTx: ${tx.hash}`, "ok");
  } catch (err) {
    setEthUI(`Anchor error: ${err?.message}`, "warn");
  }
});
