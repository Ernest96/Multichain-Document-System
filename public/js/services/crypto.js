// hashValidation
export function isValidHash(hash) {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

//sha256 hash
export async function sha256FileHex(file) {
  const buf = await file.arrayBuffer();
  const hashBuf = await crypto.subtle.digest("SHA-256", buf);
  const hashHex = [...new Uint8Array(hashBuf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `0x${hashHex}`; // bytes32
}