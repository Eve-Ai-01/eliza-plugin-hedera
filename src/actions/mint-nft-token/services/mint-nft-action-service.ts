import { HederaProvider } from "../../../providers/client";
import { MintTokenResult } from "hedera-agent-kit";
import { HederaMintNFTTokenParams } from "../types.ts";
import { TokenId } from "@hashgraph/sdk";

export class MintNftActionService {
    constructor(private hederaProvider: HederaProvider) {
        this.hederaProvider = hederaProvider;
    }

    async execute(
        params: HederaMintNFTTokenParams,
    ): Promise<MintTokenResult> {
        const agentKit = this.hederaProvider.getHederaAgentKit();

        const result = await agentKit.mintNFTToken(
            TokenId.fromString(params.tokenId),
            new TextEncoder().encode(params.tokenMetadata)
        );
        if ('status' in result && 'txHash' in result) {
            return result as MintTokenResult;
        } else {
            throw new Error('Unexpected result from mintNFTToken: ' + JSON.stringify(result));
        }
    }
}
