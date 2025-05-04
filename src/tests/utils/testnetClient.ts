import {
    AccountCreateTransaction,
    AccountId,
    AccountUpdateTransaction,
    Client,
    Hbar,
    PrivateKey,
    TokenId,
    TopicId,
} from "@hashgraph/sdk";
import { AccountData, hederaPrivateKeyFromString } from "./testnetUtils";
import {
    AirdropResult,
    CreateFTOptions,
    CreateNFTOptions,
    CreateTopicResult,
    HederaAgentKit,
    HederaNetworkType,
} from "hedera-agent-kit";
import { SubmitMessageResult } from "hedera-agent-kit";

// Define a local type for AirdropRecipient since it's not exported from hedera-agent-kit
export interface AirdropRecipient {
    accountId: string;
    amount: number;
}
export class NetworkClientWrapper {
    private readonly accountId: AccountId;
    private readonly privateKey: PrivateKey;
    private readonly client: Client;
    private readonly agentKit: HederaAgentKit;

    constructor(
        accountIdString: string,
        privateKeyString: string,
        keyType: string,
        networkType: HederaNetworkType
    ) {
        this.accountId = AccountId.fromString(accountIdString);
        this.privateKey = hederaPrivateKeyFromString({
            key: privateKeyString,
            keyType,
        }).privateKey;

        this.client = Client.forTestnet();
        this.client.setOperator(this.accountId, this.privateKey);

        this.agentKit = new HederaAgentKit(
            this.accountId.toString(),
            this.privateKey.toString(),
            networkType
        );
    }

    async createAccount(
        initialHBARAmount: number = 0,
        maxAutoAssociation: number = -1 // defaults to setting max auto association to unlimited
    ): Promise<AccountData> {
        const accountPrivateKey = PrivateKey.generateECDSA();
        const accountPublicKey = accountPrivateKey.publicKey;

        const tx = new AccountCreateTransaction()
            .setKey(accountPublicKey)
            .setInitialBalance(new Hbar(initialHBARAmount))
            .setMaxAutomaticTokenAssociations(maxAutoAssociation);
        const txResponse = await tx.execute(this.client);
        const receipt = await txResponse.getReceipt(this.client);
        const txStatus = receipt.status;

        if (!txStatus.toString().includes("SUCCESS"))
            throw new Error("Token Association failed");

        const accountId = receipt.accountId;

        return {
            accountId: accountId!.toString(),
            privateKey: accountPrivateKey.toStringRaw(),
        };
    }

    async setMaxAutoAssociation(maxAutoAssociation: number): Promise<void> {
        const tx = new AccountUpdateTransaction()
            .setAccountId(this.accountId)
            .setMaxAutomaticTokenAssociations(maxAutoAssociation)
            .freezeWith(this.client);
        const txResponse = await tx.execute(this.client);
        await txResponse.getReceipt(this.client);
    }

    async createFT(options: CreateFTOptions): Promise<string> {
        const result = await this.agentKit.createFT(options);
        if ('status' in result && 'txHash' in result && 'tokenId' in result) {
            return result.tokenId.toString();
        } else {
            throw new Error('Unexpected result from createFT: ' + JSON.stringify(result));
        }
    }

    async transferToken(
        receiverId: string,
        tokenId: string,
        amount: number
    ): Promise<void> {
        await this.agentKit.transferToken(
            TokenId.fromString(tokenId),
            receiverId,
            amount
        );
    }

    async airdropToken(
        tokenId: string,
        recipients: AirdropRecipient[]
    ): Promise<AirdropResult> {
        const result = await this.agentKit.airdropToken(
            TokenId.fromString(tokenId),
            recipients
        );
        if ('status' in result && 'txHash' in result) {
            return result as AirdropResult;
        } else {
            throw new Error('Unexpected result from airdropToken: ' + JSON.stringify(result));
        }
    }

    getAccountId(): string {
        return this.accountId.toString();
    }

    createTopic(
        topicMemo: string,
        submitKey: boolean
    ): Promise<CreateTopicResult> {
        return this.agentKit.createTopic(topicMemo, submitKey).then(result => {
            if ('status' in result && 'txHash' in result && 'topicId' in result) {
                return result as CreateTopicResult;
            } else {
                throw new Error('Unexpected result from createTopic: ' + JSON.stringify(result));
            }
        });
    }

    submitTopicMessage(topicId: string, message: string): Promise<SubmitMessageResult> {
        return this.agentKit.submitTopicMessage(
            TopicId.fromString(topicId),
            message
        ).then(result => {
            if ('status' in result && 'txHash' in result && 'topicId' in result) {
                return result as SubmitMessageResult;
            } else {
                throw new Error('Unexpected result from submitTopicMessage: ' + JSON.stringify(result));
            }
        });
    }

    associateToken(tokenId: string) {
        return this.agentKit.associateToken(TokenId.fromString(tokenId));
    }

    async createNFT(options: CreateNFTOptions): Promise<string> {
        const result = await this.agentKit.createNFT(options);
        if ('status' in result && 'txHash' in result && 'tokenId' in result) {
            return result.tokenId.toString();
        } else {
            throw new Error('Unexpected result from createNFT: ' + JSON.stringify(result));
        }
    }
}
