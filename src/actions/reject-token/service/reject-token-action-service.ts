import type { HederaHtsBalanceParams } from "../types.ts";
import { HederaProvider } from "../../../providers/client";
import { TokenId } from "@hashgraph/sdk";
import { RejectTokenResult } from "hedera-agent-kit";

export class RejectTokenActionService {
    constructor(private hederaProvider: HederaProvider) {
        this.hederaProvider = hederaProvider;
    }

    async execute(params: HederaHtsBalanceParams): Promise<RejectTokenResult> {
        const agentKit = this.hederaProvider.getHederaAgentKit();

        const result = await agentKit.rejectToken(TokenId.fromString(params.tokenId));
        if ('status' in result && 'txHash' in result) {
            return result as RejectTokenResult;
        } else {
            throw new Error('Unexpected result from rejectToken: ' + JSON.stringify(result));
        }
    }
}
