import { CreateTopicResult } from "hedera-agent-kit";
import { HederaProvider } from "../../../providers/client";
import { CreateTopicParams } from "../types.ts";

export class CreateTopicService {
    constructor(private hederaProvider: HederaProvider) {}

    async execute(params: CreateTopicParams): Promise<CreateTopicResult> {
        if (!params.memo) {
            throw new Error("Missing memo of new topic");
        }
        if (params.isSubmitKey === null) {
            params.isSubmitKey = false;
        }

        const agentKit = this.hederaProvider.getHederaAgentKit();

        const result = await agentKit.createTopic(params.memo, params.isSubmitKey);
        if ('status' in result && 'txHash' in result && 'topicId' in result) {
            return result as CreateTopicResult;
        } else {
            throw new Error('Unexpected result from createTopic: ' + JSON.stringify(result));
        }
    }
}
