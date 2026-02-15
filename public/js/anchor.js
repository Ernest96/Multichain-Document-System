import { isValidHash} from "./services/crypto.js";
import { displayFileHash } from "./services/utils.js";
import { EthereumService } from "./services/ethereum.js";
import { SolanaService } from "./services/solana.js";

const ethService = new EthereumService();
const solService = new SolanaService();

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

// SOL
const btnSolConnect = document.getElementById("btnSolConnect");
const btnSolAnchor = document.getElementById("btnSolAnchor");
const solLog = document.getElementById("solLog");
const solBadge = document.getElementById("solBadge");
let solConnected = false;

btnSolAnchor.disabled = true;


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

function setSolUI(message, badgeType = "neutral") {
  solLog.textContent = message;
  solBadge.className = `badge ${badgeType}`;
  solBadge.textContent = getBadgeText(badgeType);
}

function updateSolButton() {
  const hash = hashOut.value.trim();
  btnSolAnchor.disabled = !(solConnected && isValidHash(hash));
}


// select file
fileInput.addEventListener("change", async (e) => {
  selectedFile = e.target.files?.[0] || null;
  hashOut.value = "";
  updateEthButton();

  if (!selectedFile) {
    fileMeta.textContent = "";
    return;
  }

  await displayFileHash(selectedFile, fileMeta, hashOut);
  updateEthButton();
  updateSolButton();
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
    const isAnchored = await ethService.isAnchored(hash);
    if (isAnchored) {
      setEthUI(`Document ${selectedFile.name} already anchored`, "warn");
      return;
    }
    setEthUI("Sending transaction…", "ok");
    const tx = await ethService.anchor(hash);

    setEthUI(`Anchored ✅\nTx: ${tx.hash}`, "ok");
  } catch (err) {
    setEthUI(`Anchor error: ${err?.message}`, "warn");
  }
});

btnSolConnect.addEventListener("click", async () => {
  try {
    setSolUI("Connecting Wallet", "warn");
    const pubkey = await solService.connect();
    solConnected = true;

    setSolUI(`Connected: ${pubkey}`, "ok");
  } catch (err) {
    solConnected = false;
    setSolUI(`Connect error: ${err?.message}`, "warn");
  } finally {
    updateSolButton();
  }
});

btnSolAnchor.addEventListener("click", async () => {
  const hash = hashOut.value.trim();

  try {
    const isAnchored = await solService.isAnchored(hash);
    if (isAnchored) {
      setSolUI(`Document ${selectedFile?.name} already anchored`, "warn");
      return;
    }

    setSolUI("Sending transaction…", "ok");

    const sig = await solService.anchor(hash);

    setSolUI(`Anchored ✅\nSig: ${sig}`, "ok");
  } catch (err) {
    setSolUI(`Anchor error: ${err?.message}`, "warn");
  }
});
