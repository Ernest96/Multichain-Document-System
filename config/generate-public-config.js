import fs from "fs";
import { CONFIG } from "./project.config.js";

const PUBLIC_DIR = "../public";
const IDL_DEST_DIR = '../public/js/idl';
const IDL_DEST = `${IDL_DEST_DIR}/${CONFIG.solana.idlDestName}`;

// fs.mkdirSync(IDL_DEST_DIR, { recursive: true });
// fs.copyFileSync(CONFIG.solana.idlSrc, IDL_DEST);

const PUBLIC_CONFIG = {
  ethereum: {
    rpcUrl: CONFIG.ethereum.rpcUrl,
    contractAddress: CONFIG.ethereum.contractAddress,
  },
  solana: {
    rpcUrl: CONFIG.solana.rpcUrl,
    programId: CONFIG.solana.programId,
    idlName: CONFIG.solana.idlDestName
  },
  swgApi: {
    origin: `${CONFIG.swgApi.host}:${CONFIG.swgApi.port}`,
  },
};

fs.writeFileSync(
  `${PUBLIC_DIR}/public.config.js`,
  `export const CONFIG_PUBLIC = ${JSON.stringify(PUBLIC_CONFIG, null, 2)};\n`
);

console.log("Public config + Solana IDL generated");
