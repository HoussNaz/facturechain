
import { ethers } from "ethers";
import { env } from "../config/env.js";

// Minimal ABI for the InvoiceRegistry contract
const ABI = [
    "function certify(bytes32 invoiceHash) external",
    "function verify(bytes32 invoiceHash) external view returns (bool, address, uint256)",
    "event InvoiceCertified(bytes32 indexed invoiceHash, address indexed issuer, uint256 timestamp)"
];

type BlockchainRx = {
    txId: string;
    blockNumber: number;
    network: string;
};

export async function anchorHash(hash: string): Promise<BlockchainRx> {
    // If blockchain is disabled, replicate the mock behavior (or throw error, but let's mock for seamless dev)
    if (!env.blockchain.enabled) {
        console.log(`[MockBlockchain] Anchoring hash ${hash}...`);
        return {
            txId: `0xmock${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
            blockNumber: 12345678,
            network: "polygon-amoy-mock"
        };
    }

    // Real implementation
    if (!env.blockchain.privateKey || !env.blockchain.contractAddress) {
        throw new Error("Blockchain configuration missing (PRIVATE_KEY or CONTRACT_ADDRESS)");
    }

    try {
        const provider = new ethers.JsonRpcProvider(env.blockchain.rpcUrl);
        const wallet = new ethers.Wallet(env.blockchain.privateKey, provider);
        const contract = new ethers.Contract(env.blockchain.contractAddress, ABI, wallet);

        console.log(`[Blockchain] Certifying hash ${hash} on ${env.blockchain.contractAddress}...`);

        // Ensure hash is 0x prefixed and 32 bytes
        if (!hash.startsWith("0x")) hash = "0x" + hash;

        // Send transaction
        const tx = await contract.certify(hash);
        console.log(`[Blockchain] Tx sent: ${tx.hash}. Waiting for confirmation...`);

        // Wait for 1 confirmation
        const receipt = await tx.wait(1);

        return {
            txId: receipt.hash,
            blockNumber: receipt.blockNumber,
            network: "polygon-amoy" // Hardcoded for this MVP, could come from provider
        };
    } catch (error: any) {
        console.error("[Blockchain] Error anchoring hash:", error);
        // Handle "Invoice already certified" specifically?
        if (error.reason && error.reason.includes("already certified")) {
            throw new Error("Cette facture est déja certifiée sur la blockchain.");
        }
        throw new Error(`Erreur blockchain: ${error.message}`);
    }
}

export async function verifyAnchor(hash: string) {
    if (!env.blockchain.enabled) return null; // Can't verify on real chain if disabled

    try {
        const provider = new ethers.JsonRpcProvider(env.blockchain.rpcUrl);
        // Read-only, no wallet needed
        const contract = new ethers.Contract(env.blockchain.contractAddress, ABI, provider);

        if (!hash.startsWith("0x")) hash = "0x" + hash;

        const result = await contract.verify(hash);
        // result is [bool exists, address issuer, uint256 timestamp]

        if (!result[0]) return null;

        return {
            exists: true,
            issuer: result[1],
            timestamp: Number(result[2])
        };
    } catch (error) {
        console.error("Verification failed:", error);
        return null;
    }
}
