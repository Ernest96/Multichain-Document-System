import fs from "fs";
import { CONFIG } from "./project.config.js";

const PUBLIC_DIR = "../public";
const IDL_DEST_DIR = `${PUBLIC_DIR}/js/idl`;
const IDL_DEST = `${IDL_DEST_DIR}/${CONFIG.solana.idlDestName}`;

fs.mkdirSync(IDL_DEST_DIR, { recursive: true });
fs.copyFileSync(CONFIG.solana.idlSrc, IDL_DEST);

const PUBLIC_CONFIG = {
  ethereum: {
    rpcUrl: CONFIG.ethereum.rpcUrl,
    contractAddress: CONFIG.ethereum.contractAddress,
    chainIdHex: CONFIG.ethereum.chainIdHex
  },
  solana: {
    rpcUrl: CONFIG.solana.rpcUrl,
    programId: CONFIG.solana.programId,
    idlName: CONFIG.solana.idlDestName
  },
  swgApi: {
    origin: CONFIG.swgApi.origin,
  },
};

fs.writeFileSync(
  `${PUBLIC_DIR}/public.config.js`,
  `export const CONFIG_PUBLIC = ${JSON.stringify(PUBLIC_CONFIG, null, 2)};\n`
);

console.log("Public config + Solana IDL generated");
