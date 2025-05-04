import { HederaProvider } from "../../../providers/client";
import { HederaTransferParams } from "../types.ts";
import { TransferHBARResult } from "hedera-agent-kit";

export class TransferHbarService {
    constructor(private hederaProvider: HederaProvider) {}

    async execute({
        amount,
        accountId,
    }: HederaTransferParams): Promise<TransferHBARResult> {
        if (!amount) {
            throw new Error("Missing amount");
        }

        if (!accountId) {
            throw new Error("Missing recipient accountId");
        }

        const agentKit = this.hederaProvider.getHederaAgentKit();
        const result = await agentKit.transferHbar(accountId, amount);
        if ('status' in result && 'txHash' in result) {
            return result as TransferHBARResult;
        } else {
            throw new Error('Unexpected result from transferHbar: ' + JSON.stringify(result));
        }
    }
}
