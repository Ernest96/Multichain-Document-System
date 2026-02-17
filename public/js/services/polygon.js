import { CONFIG_PUBLIC } from "../../public.config.js";
import { pickEvmProvider } from "./utils.js";

const POL_RPC_URL = CONFIG_PUBLIC.polygon.rpcUrl;
const POL_CONTRACT_ADDRESS = CONFIG_PUBLIC.polygon.contractAddress;
const POL_CHAIN_ID_HEX = CONFIG_PUBLIC.polygon.chainIdHex;

const ABI = [
  "function anchorDocument(bytes32 docHash) external",
  "function approveDocument(bytes32 docHash) external",
  "function isApproved(bytes32 docHash, address user) view returns (bool)",
  "function isAnchored(bytes32 docHash) view returns (bool)",
  "function owner() view returns (address)"
];

const CHAIN = {
  key: "pol",
  label: "Polygon",
  chainIdHex: POL_CHAIN_ID_HEX,
  rpcUrl: POL_RPC_URL,
  contract: POL_CONTRACT_ADDRESS,
  addParams: {
    chainId: POL_CHAIN_ID_HEX,
    chainName: "Polygon",
    rpcUrls: [POL_RPC_URL],
    nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 }
  },
};

export class PolygonService {
  constructor() {
    this.evm = null;
    this.provider = null;
    this.signer = null;

    this.rp = new ethers.JsonRpcProvider(POL_RPC_URL);
    this.readContract = new ethers.Contract(POL_CONTRACT_ADDRESS, ABI, this.rp);
  }

  async ensureNetwork() {
    const current = await this.evm.request({ method: "eth_chainId" });
    if (current === CHAIN.chainIdHex) return;

    try {
      await this.evm.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CHAIN.chainIdHex }],
      });
    } catch (err) {
      if (err?.code === 4902) {
        await this.evm.request({
          method: "wallet_addEthereumChain",
          params: [CHAIN.addParams],
        });
      } else {
        throw err;
      }
    }
  }

  async refreshWalletState(pickedEvm) {
    if (!pickedEvm) throw new Error("No EVM provider selected");
    this.evm = pickedEvm;
    this.provider = new ethers.BrowserProvider(this.evm);
    this.signer = await this.provider.getSigner();
  }

  async connect() {
    if (!window.ethereum) {
      throw new Error("EVM Wallet not installed");
    }

    let pickedEvm = await pickEvmProvider();
    if (!pickedEvm) {
      toast("No wallet selected");
      return;
    }

    await this.refreshWalletState(pickedEvm);
    await this.ensureNetwork();
    await this.evm.request({ method: "eth_requestAccounts" });

    this.contract = new ethers.Contract(
      CONFIG_PUBLIC.polygon.contractAddress,
      ABI,
      this.signer
    );

    return this.signer.getAddress();
  }


  async anchor(docHash) {
    if (!this.signer) throw new Error("Not connected");

    await this.ensureNetwork();

    const tx = await this.contract.anchorDocument(docHash);
    return await tx.wait();
  }

  async approve(docHash) {
    if (!this.signer) throw new Error("Not connected");

    await this.ensureNetwork();

    const tx = await this.contract.approveDocument(docHash);
    return await tx.wait();
  }

  async isAnchored(docHash) {
    return await this.readContract.isAnchored(docHash);
  }

  async isApproved(docHash) {
    const addr = await this.signer.getAddress();

    if (!addr) throw new Error("User address required");

    return await this.readContract.isApproved(docHash, addr);
  }
}
