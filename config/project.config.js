import "dotenv/config";

export const CONFIG = {
  ethereum: {
    rpcUrl: "https://sepolia.infura.io/v3/bd24e72571644461944188b92dfb02c5",
    privateKey: process.env.ETH_PRIVATE_KEY,
    contractAddress: "0x01804d20f5376080DF70C05eFd81F1d517645d0c",
    chainIdHex: "0xaa36a7"
  },
  solana: {
    rpcUrl: "https://api.devnet.solana.com",
    programId: "5tjey2DhszrAfN8u6CRxZ4RwyfkV3fXpqyXxVj7prtNo",
    idlSrc: "../blockchain/solana/target/idl/document_registry.json",
    idlDestName: "solana_idl.json",
  },
  polygon: {
    rpcUrl: "https://rpc-amoy.polygon.technology",
    privateKey: process.env.POL_PRIVATE_KEY,
    contractAddress: "0x3960073a8a747555C81975e841da2b5b85c39fdF",
    chainIdHex: "0x13882"
  },
  security: {
    jwtDomain: process.env.JWT_DOMAIN,
    jwtSecret: process.env.JWT_SECRET,
    adminLogin: process.env.ADMIN_LOGIN,
    adminPassword: process.env.ADMIN_PASSWORD,
  },
  swgApi: {
    host: process.env.SWG_API_HOST,
    port: Number(process.env.SWG_API_PORT),
    origin: getSwgApiOrigin(),
    cors: {
      allowOriginsExtra: [],
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["Content-Type"],
      allowCredentials: true,
    },
  },
  swg: {
    host: process.env.SWG_HOST,
    port: Number(process.env.SWG_PORT),
    origin: getSwgOrigin(),
    coop: "same-origin-allow-popups",
    coep: "require-corp",
    corp: "same-origin",
    csp: {
      base: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:"],
          styleSrc: ["'self'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          objectSrc: ["'none'"],
          baseUri: ["'none'"],
          frameAncestors: ["'none'"],
        },
        connectSrc: [],
      },
      // route specific CSP
      routes: {
        "/pages/anchor": {
          connectAdd: [
            "https://sepolia.infura.io",
            "https://api.devnet.solana.com",
            "https://esm.sh",
            "wss://api.devnet.solana.com/",
            "https://sepolia.infura.io/v3/",
          ],
          scriptAdd: ["https://esm.sh"]
        },
        "/pages/verify": {
          connectAdd: [
            "https://sepolia.infura.io",
            "https://api.devnet.solana.com",
            "https://esm.sh",
            "wss://api.devnet.solana.com/",
            "https://rpc-amoy.polygon.technology"
          ],
          scriptAdd: ["https://esm.sh"]
        },
        "/pages/approve/ethereum": {
          connectAdd: [
            "https://sepolia.infura.io",
          ],
          scriptAdd: []
        },
        "/pages/approve/polygon": {
          connectAdd: [
            "https://rpc-amoy.polygon.technology",
          ],
          scriptAdd: []
        },
        "/pages/approve/solana": {
          connectAdd: [
            "https://api.devnet.solana.com",
            "https://esm.sh",
            "wss://api.devnet.solana.com/"
          ],
          scriptAdd: ["https://esm.sh"]
        },
      },
      // role specific CSP
      roles: {
        admin: {
          connectAdd: [],
          scriptAdd: []
        },
      },
      // route + role specific CSP
      routeRoles: {
        "/": {
          admin: {
            connectAdd: [],
            scriptAdd: []
          },
        },
      },
    },
  },
};

function getSwgOrigin() {
  const origin = process.env.SWG_LIVE == 0 ?
    `${process.env.SWG_HOST}:${process.env.SWG_PORT}` :
    process.env.SWG_HOST;

  return origin;
}

function getSwgApiOrigin() {
  const origin = process.env.SWG_LIVE == 0 ?
    `${process.env.SWG_API_HOST}:${process.env.SWG_API_PORT}` :
    process.env.SWG_API_HOST;

  return origin;
}