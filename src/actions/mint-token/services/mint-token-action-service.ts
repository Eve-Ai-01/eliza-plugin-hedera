import { HederaProvider } from "../../../providers/client";
import { MintTokenResult } from "hedera-agent-kit";
import { HederaMintTokenParams } from "../types.ts";
import { TokenId } from "@hashgraph/sdk";
import { toBaseUnit } from "hedera-agent-kit";
import { HederaNetworkType } from "hedera-agent-kit";

export class MintTokenActionService {
    constructor(private hederaProvider: HederaProvider) {
        this.hederaProvider = hederaProvider;
    }

    async execute(
        params: HederaMintTokenParams,
        networkType: HederaNetworkType
    ): Promise<MintTokenResult> {
        const agentKit = this.hederaProvider.getHederaAgentKit();

        const baseUnitAmount = await toBaseUnit(
            params.tokenId,
            params.amount,
            networkType
        );

        const result = await agentKit.mintToken(
            TokenId.fromString(params.tokenId),
            baseUnitAmount.toNumber()
        );
        if ('status' in result && 'txHash' in result) {
            return result as MintTokenResult;
        } else {
            throw new Error('Unexpected result from mintToken: ' + JSON.stringify(result));
        }
    }
}
