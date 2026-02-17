import { CONFIG_PUBLIC } from "../../public.config.js";
import { pickEvmProvider } from "./utils.js";

const ETH_RPC_URL = CONFIG_PUBLIC.ethereum.rpcUrl;
const ETH_CONTRACT_ADDRESS = CONFIG_PUBLIC.ethereum.contractAddress;
const ETH_CHAIN_ID_HEX = CONFIG_PUBLIC.ethereum.chainIdHex;

const ABI = [
  "function anchorDocument(bytes32 docHash) external",
  "function approveDocument(bytes32 docHash) external",
  "function isApproved(bytes32 docHash, address user) view returns (bool)",
  "function isAnchored(bytes32 docHash) view returns (bool)",
  "function owner() view returns (address)"
];

const CHAIN = {
  key: "eth",
  label: "Ethereum ",
  chainIdHex: ETH_CHAIN_ID_HEX,
  rpcUrl: ETH_RPC_URL,
  contract: ETH_CONTRACT_ADDRESS,
  addParams: {
    chainId: ETH_CHAIN_ID_HEX,
    chainName: "Ethereum ",
    rpcUrls: [ETH_RPC_URL],
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 }
  },
};

export class EthereumService {
  constructor() {
    this.evm = null;
    this.provider = null;
    this.signer = null;
    this.contract = null;

    this.rp = new ethers.JsonRpcProvider(ETH_RPC_URL);
    this.readContract = new ethers.Contract(ETH_CONTRACT_ADDRESS, ABI, this.rp);
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
      CONFIG_PUBLIC.ethereum.contractAddress,
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
