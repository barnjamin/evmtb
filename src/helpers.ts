import {
    ChainAddress,
    ChainContext,
    PlatformName,
    Signer,
    TransferState,
    WormholeTransfer,
    nativeChainAddress,
} from "@wormhole-foundation/connect-sdk";

import { getEvmSigner } from "@wormhole-foundation/connect-sdk-evm";

// read in from `.env`
require("dotenv").config();

function getEnv(key: string): string {
    // If we're in the browser, return empty string
    if (typeof process === undefined) return "";

    // Otherwise, return the env var or error
    const val = process.env[key];
    if (!val)
        throw new Error(
            `Missing env var ${key}, did you forget to set valies in '.env'?`,
        );

    return val;
}

export interface TransferStuff {
    chain: ChainContext<PlatformName>;
    signer: Signer;
    address: ChainAddress;
}

export async function getStuff(
    chain: ChainContext<PlatformName>,
): Promise<TransferStuff> {
    let signer: Signer;
    switch (chain.platform.platform) {
        case "Evm":
            signer = await getEvmSigner(chain, getEnv("ETH_PRIVATE_KEY"));
            break;
        default:
            throw new Error("Unrecognized platform: " + chain.platform.platform);
    }

    return { chain, signer, address: nativeChainAddress(signer) };
}

export async function waitLog(xfer: WormholeTransfer): Promise<void> {
    console.log("Checking for complete status");
    while ((await xfer.getTransferState()) < TransferState.Completed) {
        console.log("Not yet...");
        await new Promise((f) => setTimeout(f, 5000));
    }
}
