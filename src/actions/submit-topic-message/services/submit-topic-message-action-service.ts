import { HederaProvider } from "../../../providers/client";
import { SubmitMessageResult } from "hedera-agent-kit";
import { HederaSubmitTopicMessageParams } from "../types.ts";
import { TopicId } from "@hashgraph/sdk";

export class SubmitTopicMessageActionService {
    constructor(private hederaProvider: HederaProvider) {
        this.hederaProvider = hederaProvider;
    }

    async execute(
        params: HederaSubmitTopicMessageParams
    ): Promise<SubmitMessageResult> {
        const agentKit = this.hederaProvider.getHederaAgentKit();

        const result = await agentKit.submitTopicMessage(
            TopicId.fromString(params.topicId),
            params.message
        );
        if ('status' in result && 'txHash' in result && 'topicId' in result) {
            return result as SubmitMessageResult;
        } else {
            throw new Error('Unexpected result from submitTopicMessage: ' + JSON.stringify(result));
        }
    }
}
