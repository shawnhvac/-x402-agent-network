/**
 * Polygon Chain Support for AgentPay
 * Chain: Polygon Mainnet (eip155:137)
 * USDC: 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359 (native USDC, not bridged)
 * RPC:  https://polygon-rpc.com (public) or POLYGON_RPC_ENDPOINT env var
 */
export declare const POLYGON_CHAIN_ID = 137;
export declare const POLYGON_NETWORK_ID = "eip155:137";
export declare const POLYGON_RPC: string;
export declare const POLYGON_USDC: `0x${string}`;
export declare const POLYGON_USDC_BRIDGED: `0x${string}`;
export declare function getPolygonPublicClient(): {
    account: {
        address: undefined;
        type: "json-rpc";
    };
    batch?: import("viem").ClientConfig["batch"] | undefined;
    cacheTime: number;
    ccipRead?: import("viem").ClientConfig["ccipRead"] | undefined;
    chain: {
        blockExplorers: {
            readonly default: {
                readonly name: "PolygonScan";
                readonly url: "https://polygonscan.com";
                readonly apiUrl: "https://api.etherscan.io/v2/api";
            };
        };
        blockTime: 2000;
        contracts: {
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 25770160;
            };
        };
        ensTlds?: readonly string[] | undefined;
        id: 137;
        name: "Polygon";
        nativeCurrency: {
            readonly name: "POL";
            readonly symbol: "POL";
            readonly decimals: 18;
        };
        experimental_preconfirmationTime?: number | undefined | undefined;
        rpcUrls: {
            readonly default: {
                readonly http: readonly ["https://polygon.drpc.org"];
            };
        };
        sourceId?: number | undefined | undefined;
        testnet?: boolean | undefined | undefined;
        custom?: Record<string, unknown> | undefined;
        extendSchema?: Record<string, unknown> | undefined;
        fees?: import("viem").ChainFees<undefined> | undefined;
        formatters?: undefined;
        prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
            runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
        }] | undefined;
        serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
        verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
    };
    dataSuffix?: import("viem").DataSuffix | undefined;
    experimental_blockTag?: import("viem").BlockTag | undefined;
    key: string;
    name: string;
    pollingInterval: number;
    request: import("viem").EIP1193RequestFn<[{
        Method: "web3_clientVersion";
        Parameters?: undefined;
        ReturnType: string;
    }, {
        Method: "web3_sha3";
        Parameters: [data: import("viem").Hash];
        ReturnType: string;
    }, {
        Method: "net_listening";
        Parameters?: undefined;
        ReturnType: boolean;
    }, {
        Method: "net_peerCount";
        Parameters?: undefined;
        ReturnType: import("viem").Quantity;
    }, {
        Method: "net_version";
        Parameters?: undefined;
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_blobBaseFee";
        Parameters?: undefined;
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_blockNumber";
        Parameters?: undefined;
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_call";
        Parameters: readonly [transaction: import("viem").ExactPartial<import("viem").RpcTransactionRequest>] | readonly [transaction: import("viem").ExactPartial<import("viem").RpcTransactionRequest>, block: import("viem").RpcBlockNumber | import("viem").BlockTag | import("viem").RpcBlockIdentifier] | readonly [transaction: import("viem").ExactPartial<import("viem").RpcTransactionRequest>, block: import("viem").RpcBlockNumber | import("viem").BlockTag | import("viem").RpcBlockIdentifier, stateOverrideSet: import("viem").RpcStateOverride] | readonly [transaction: import("viem").ExactPartial<import("viem").RpcTransactionRequest>, block: import("viem").RpcBlockNumber | import("viem").BlockTag | import("viem").RpcBlockIdentifier, stateOverrideSet: import("viem").RpcStateOverride, blockOverrides: import("viem").RpcBlockOverrides];
        ReturnType: import("viem").Hex;
    }, {
        Method: "eth_createAccessList";
        Parameters: [transaction: import("viem").ExactPartial<import("viem").RpcTransactionRequest>] | [transaction: import("viem").ExactPartial<import("viem").RpcTransactionRequest>, block: import("viem").RpcBlockNumber | import("viem").BlockTag | import("viem").RpcBlockIdentifier];
        ReturnType: {
            accessList: import("viem").AccessList;
            gasUsed: import("viem").Quantity;
        };
    }, {
        Method: "eth_chainId";
        Parameters?: undefined;
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_coinbase";
        Parameters?: undefined;
        ReturnType: import("viem").Address;
    }, {
        Method: "eth_estimateGas";
        Parameters: [transaction: import("viem").RpcTransactionRequest] | [transaction: import("viem").RpcTransactionRequest, block: import("viem").RpcBlockNumber | import("viem").BlockTag] | [transaction: import("viem").RpcTransactionRequest, block: import("viem").RpcBlockNumber | import("viem").BlockTag, stateOverride: import("viem").RpcStateOverride];
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_fillTransaction";
        Parameters: [transaction: import("viem").RpcTransactionRequest];
        ReturnType: {
            capabilities?: Record<string, unknown> | undefined;
            raw: import("viem").Hex;
            tx: import("viem").RpcTransaction;
        };
    }, {
        Method: "eth_feeHistory";
        Parameters: [blockCount: import("viem").Quantity, newestBlock: import("viem").RpcBlockNumber | import("viem").BlockTag, rewardPercentiles: number[] | undefined];
        ReturnType: import("viem").RpcFeeHistory;
    }, {
        Method: "eth_gasPrice";
        Parameters?: undefined;
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_getBalance";
        Parameters: [address: import("viem").Address, block: import("viem").RpcBlockNumber | import("viem").BlockTag | import("viem").RpcBlockIdentifier];
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_getBlockByHash";
        Parameters: [hash: import("viem").Hash, includeTransactionObjects: boolean];
        ReturnType: import("viem").RpcBlock | null;
    }, {
        Method: "eth_getBlockByNumber";
        Parameters: [block: import("viem").RpcBlockNumber | import("viem").BlockTag, includeTransactionObjects: boolean];
        ReturnType: import("viem").RpcBlock | null;
    }, {
        Method: "eth_getBlockTransactionCountByHash";
        Parameters: [hash: import("viem").Hash];
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_getBlockTransactionCountByNumber";
        Parameters: [block: import("viem").RpcBlockNumber | import("viem").BlockTag];
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_getCode";
        Parameters: [address: import("viem").Address, block: import("viem").RpcBlockNumber | import("viem").BlockTag | import("viem").RpcBlockIdentifier];
        ReturnType: import("viem").Hex;
    }, {
        Method: "eth_getFilterChanges";
        Parameters: [filterId: import("viem").Quantity];
        ReturnType: import("viem").RpcLog[] | import("viem").Hex[];
    }, {
        Method: "eth_getFilterLogs";
        Parameters: [filterId: import("viem").Quantity];
        ReturnType: import("viem").RpcLog[];
    }, {
        Method: "eth_getLogs";
        Parameters: [{
            address?: import("viem").Address | import("viem").Address[] | undefined;
            topics?: import("viem").LogTopic[] | undefined;
        } & ({
            fromBlock?: import("viem").RpcBlockNumber | import("viem").BlockTag | undefined;
            toBlock?: import("viem").RpcBlockNumber | import("viem").BlockTag | undefined;
            blockHash?: undefined;
        } | {
            fromBlock?: undefined;
            toBlock?: undefined;
            blockHash?: import("viem").Hash | undefined;
        })];
        ReturnType: import("viem").RpcLog[];
    }, {
        Method: "eth_getProof";
        Parameters: [address: import("viem").Address, storageKeys: import("viem").Hash[], block: import("viem").RpcBlockNumber | import("viem").BlockTag];
        ReturnType: import("viem").RpcProof;
    }, {
        Method: "eth_getStorageAt";
        Parameters: [address: import("viem").Address, index: import("viem").Quantity, block: import("viem").RpcBlockNumber | import("viem").BlockTag | import("viem").RpcBlockIdentifier];
        ReturnType: import("viem").Hex;
    }, {
        Method: "eth_getTransactionByBlockHashAndIndex";
        Parameters: [hash: import("viem").Hash, index: import("viem").Quantity];
        ReturnType: import("viem").RpcTransaction | null;
    }, {
        Method: "eth_getTransactionByBlockNumberAndIndex";
        Parameters: [block: import("viem").RpcBlockNumber | import("viem").BlockTag, index: import("viem").Quantity];
        ReturnType: import("viem").RpcTransaction | null;
    }, {
        Method: "eth_getTransactionByHash";
        Parameters: [hash: import("viem").Hash];
        ReturnType: import("viem").RpcTransaction | null;
    }, {
        Method: "eth_getTransactionBySenderAndNonce";
        Parameters: [sender: import("viem").Address, nonce: import("viem").Quantity];
        ReturnType: import("viem").RpcTransaction | null;
    }, {
        Method: "eth_getTransactionCount";
        Parameters: [address: import("viem").Address, block: import("viem").RpcBlockNumber | import("viem").BlockTag | import("viem").RpcBlockIdentifier];
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_getTransactionReceipt";
        Parameters: [hash: import("viem").Hash];
        ReturnType: import("viem").RpcTransactionReceipt | null;
    }, {
        Method: "eth_getUncleByBlockHashAndIndex";
        Parameters: [hash: import("viem").Hash, index: import("viem").Quantity];
        ReturnType: import("viem").RpcUncle | null;
    }, {
        Method: "eth_getUncleByBlockNumberAndIndex";
        Parameters: [block: import("viem").RpcBlockNumber | import("viem").BlockTag, index: import("viem").Quantity];
        ReturnType: import("viem").RpcUncle | null;
    }, {
        Method: "eth_getUncleCountByBlockHash";
        Parameters: [hash: import("viem").Hash];
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_getUncleCountByBlockNumber";
        Parameters: [block: import("viem").RpcBlockNumber | import("viem").BlockTag];
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_maxPriorityFeePerGas";
        Parameters?: undefined;
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_newBlockFilter";
        Parameters?: undefined;
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_newFilter";
        Parameters: [filter: {
            fromBlock?: import("viem").RpcBlockNumber | import("viem").BlockTag | undefined;
            toBlock?: import("viem").RpcBlockNumber | import("viem").BlockTag | undefined;
            address?: import("viem").Address | import("viem").Address[] | undefined;
            topics?: import("viem").LogTopic[] | undefined;
        }];
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_newPendingTransactionFilter";
        Parameters?: undefined;
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_protocolVersion";
        Parameters?: undefined;
        ReturnType: string;
    }, {
        Method: "eth_sendRawTransaction";
        Parameters: [signedTransaction: import("viem").Hex];
        ReturnType: import("viem").Hash;
    }, {
        Method: "eth_sendRawTransactionSync";
        Parameters: [signedTransaction: import("viem").Hex] | [signedTransaction: import("viem").Hex, timeout: number];
        ReturnType: import("viem").RpcTransactionReceipt;
    }, {
        Method: "eth_simulateV1";
        Parameters: [{
            blockStateCalls: readonly {
                blockOverrides?: import("viem").RpcBlockOverrides | undefined;
                calls?: readonly import("viem").ExactPartial<import("viem").RpcTransactionRequest>[] | undefined;
                stateOverrides?: import("viem").RpcStateOverride | undefined;
            }[];
            returnFullTransactions?: boolean | undefined;
            traceTransfers?: boolean | undefined;
            validation?: boolean | undefined;
        }, import("viem").RpcBlockNumber | import("viem").BlockTag];
        ReturnType: readonly (import("viem").RpcBlock & {
            calls: readonly {
                error?: {
                    data?: import("viem").Hex | undefined;
                    code: number;
                    message: string;
                } | undefined;
                logs?: readonly import("viem").RpcLog[] | undefined;
                gasUsed: import("viem").Hex;
                returnData: import("viem").Hex;
                status: import("viem").Hex;
            }[];
        })[];
    }, {
        Method: "eth_uninstallFilter";
        Parameters: [filterId: import("viem").Quantity];
        ReturnType: boolean;
    }, ...any[]]>;
    transport: import("viem").TransportConfig<"http", import("viem").EIP1193RequestFn> & {
        fetchOptions?: import("viem").HttpTransportConfig["fetchOptions"] | undefined;
        url?: string | undefined;
    };
    type: string;
    uid: string;
    call: (parameters: import("viem").CallParameters<{
        blockExplorers: {
            readonly default: {
                readonly name: "PolygonScan";
                readonly url: "https://polygonscan.com";
                readonly apiUrl: "https://api.etherscan.io/v2/api";
            };
        };
        blockTime: 2000;
        contracts: {
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 25770160;
            };
        };
        ensTlds?: readonly string[] | undefined;
        id: 137;
        name: "Polygon";
        nativeCurrency: {
            readonly name: "POL";
            readonly symbol: "POL";
            readonly decimals: 18;
        };
        experimental_preconfirmationTime?: number | undefined | undefined;
        rpcUrls: {
            readonly default: {
                readonly http: readonly ["https://polygon.drpc.org"];
            };
        };
        sourceId?: number | undefined | undefined;
        testnet?: boolean | undefined | undefined;
        custom?: Record<string, unknown> | undefined;
        extendSchema?: Record<string, unknown> | undefined;
        fees?: import("viem").ChainFees<undefined> | undefined;
        formatters?: undefined;
        prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
            runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
        }] | undefined;
        serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
        verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
    }>) => Promise<import("viem").CallReturnType>;
    createAccessList: (parameters: import("viem").CreateAccessListParameters<{
        blockExplorers: {
            readonly default: {
                readonly name: "PolygonScan";
                readonly url: "https://polygonscan.com";
                readonly apiUrl: "https://api.etherscan.io/v2/api";
            };
        };
        blockTime: 2000;
        contracts: {
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 25770160;
            };
        };
        ensTlds?: readonly string[] | undefined;
        id: 137;
        name: "Polygon";
        nativeCurrency: {
            readonly name: "POL";
            readonly symbol: "POL";
            readonly decimals: 18;
        };
        experimental_preconfirmationTime?: number | undefined | undefined;
        rpcUrls: {
            readonly default: {
                readonly http: readonly ["https://polygon.drpc.org"];
            };
        };
        sourceId?: number | undefined | undefined;
        testnet?: boolean | undefined | undefined;
        custom?: Record<string, unknown> | undefined;
        extendSchema?: Record<string, unknown> | undefined;
        fees?: import("viem").ChainFees<undefined> | undefined;
        formatters?: undefined;
        prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
            runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
        }] | undefined;
        serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
        verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
    }>) => Promise<{
        accessList: import("viem").AccessList;
        gasUsed: bigint;
    }>;
    createBlockFilter: () => Promise<import("viem").CreateBlockFilterReturnType>;
    createContractEventFilter: <const abi extends import("viem").Abi | readonly unknown[], eventName extends import("viem").ContractEventName<abi> | undefined, args extends import("viem").MaybeExtractEventArgsFromAbi<abi, eventName> | undefined, strict extends boolean | undefined = undefined, fromBlock extends import("viem").BlockNumber | import("viem").BlockTag | undefined = undefined, toBlock extends import("viem").BlockNumber | import("viem").BlockTag | undefined = undefined>(args: import("viem").CreateContractEventFilterParameters<abi, eventName, args, strict, fromBlock, toBlock>) => Promise<import("viem").CreateContractEventFilterReturnType<abi, eventName, args, strict, fromBlock, toBlock>>;
    createEventFilter: <const abiEvent extends import("viem").AbiEvent | undefined = undefined, const abiEvents extends readonly import("viem").AbiEvent[] | readonly unknown[] | undefined = abiEvent extends import("viem").AbiEvent ? [abiEvent] : undefined, strict extends boolean | undefined = undefined, fromBlock extends import("viem").BlockNumber | import("viem").BlockTag | undefined = undefined, toBlock extends import("viem").BlockNumber | import("viem").BlockTag | undefined = undefined, _EventName extends string | undefined = import("viem").MaybeAbiEventName<abiEvent>, _Args extends import("viem").MaybeExtractEventArgsFromAbi<abiEvents, _EventName> | undefined = undefined>(args?: import("viem").CreateEventFilterParameters<abiEvent, abiEvents, strict, fromBlock, toBlock, _EventName, _Args> | undefined) => Promise<import("viem").CreateEventFilterReturnType<abiEvent, abiEvents, strict, fromBlock, toBlock, _EventName, _Args>>;
    createPendingTransactionFilter: () => Promise<import("viem").CreatePendingTransactionFilterReturnType>;
    estimateContractGas: <chain extends import("viem").Chain | undefined, const abi extends import("viem").Abi | readonly unknown[], functionName extends import("viem").ContractFunctionName<abi, "nonpayable" | "payable">, args extends import("viem").ContractFunctionArgs<abi, "nonpayable" | "payable", functionName>>(args: import("viem").EstimateContractGasParameters<abi, functionName, args, chain>) => Promise<import("viem").EstimateContractGasReturnType>;
    estimateGas: (args: import("viem").EstimateGasParameters<{
        blockExplorers: {
            readonly default: {
                readonly name: "PolygonScan";
                readonly url: "https://polygonscan.com";
                readonly apiUrl: "https://api.etherscan.io/v2/api";
            };
        };
        blockTime: 2000;
        contracts: {
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 25770160;
            };
        };
        ensTlds?: readonly string[] | undefined;
        id: 137;
        name: "Polygon";
        nativeCurrency: {
            readonly name: "POL";
            readonly symbol: "POL";
            readonly decimals: 18;
        };
        experimental_preconfirmationTime?: number | undefined | undefined;
        rpcUrls: {
            readonly default: {
                readonly http: readonly ["https://polygon.drpc.org"];
            };
        };
        sourceId?: number | undefined | undefined;
        testnet?: boolean | undefined | undefined;
        custom?: Record<string, unknown> | undefined;
        extendSchema?: Record<string, unknown> | undefined;
        fees?: import("viem").ChainFees<undefined> | undefined;
        formatters?: undefined;
        prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
            runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
        }] | undefined;
        serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
        verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
    }>) => Promise<import("viem").EstimateGasReturnType>;
    fillTransaction: <chainOverride extends import("viem").Chain | undefined = undefined, accountOverride extends import("viem").Account | import("viem").Address | undefined = undefined>(args: import("viem").FillTransactionParameters<{
        blockExplorers: {
            readonly default: {
                readonly name: "PolygonScan";
                readonly url: "https://polygonscan.com";
                readonly apiUrl: "https://api.etherscan.io/v2/api";
            };
        };
        blockTime: 2000;
        contracts: {
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 25770160;
            };
        };
        ensTlds?: readonly string[] | undefined;
        id: 137;
        name: "Polygon";
        nativeCurrency: {
            readonly name: "POL";
            readonly symbol: "POL";
            readonly decimals: 18;
        };
        experimental_preconfirmationTime?: number | undefined | undefined;
        rpcUrls: {
            readonly default: {
                readonly http: readonly ["https://polygon.drpc.org"];
            };
        };
        sourceId?: number | undefined | undefined;
        testnet?: boolean | undefined | undefined;
        custom?: Record<string, unknown> | undefined;
        extendSchema?: Record<string, unknown> | undefined;
        fees?: import("viem").ChainFees<undefined> | undefined;
        formatters?: undefined;
        prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
            runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
        }] | undefined;
        serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
        verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
    }, import("viem").Account, chainOverride, accountOverride>) => Promise<import("viem").FillTransactionReturnType<{
        blockExplorers: {
            readonly default: {
                readonly name: "PolygonScan";
                readonly url: "https://polygonscan.com";
                readonly apiUrl: "https://api.etherscan.io/v2/api";
            };
        };
        blockTime: 2000;
        contracts: {
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 25770160;
            };
        };
        ensTlds?: readonly string[] | undefined;
        id: 137;
        name: "Polygon";
        nativeCurrency: {
            readonly name: "POL";
            readonly symbol: "POL";
            readonly decimals: 18;
        };
        experimental_preconfirmationTime?: number | undefined | undefined;
        rpcUrls: {
            readonly default: {
                readonly http: readonly ["https://polygon.drpc.org"];
            };
        };
        sourceId?: number | undefined | undefined;
        testnet?: boolean | undefined | undefined;
        custom?: Record<string, unknown> | undefined;
        extendSchema?: Record<string, unknown> | undefined;
        fees?: import("viem").ChainFees<undefined> | undefined;
        formatters?: undefined;
        prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
            runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
        }] | undefined;
        serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
        verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
    }, chainOverride>>;
    getBalance: (args: import("viem").GetBalanceParameters) => Promise<import("viem").GetBalanceReturnType>;
    getBlobBaseFee: () => Promise<import("viem").GetBlobBaseFeeReturnType>;
    getBlock: <includeTransactions extends boolean = false, blockTag extends import("viem").BlockTag = "latest">(args?: import("viem").GetBlockParameters<includeTransactions, blockTag>) => Promise<{
        number: blockTag extends "pending" ? null : bigint;
        nonce: blockTag extends "pending" ? null : `0x${string}`;
        timestamp: bigint;
        hash: blockTag extends "pending" ? null : `0x${string}`;
        logsBloom: blockTag extends "pending" ? null : `0x${string}`;
        baseFeePerGas: bigint;
        blobGasUsed: bigint;
        difficulty: bigint;
        excessBlobGas: bigint;
        extraData: import("viem").Hex;
        gasLimit: bigint;
        gasUsed: bigint;
        miner: import("viem").Address;
        mixHash: import("viem").Hash;
        parentBeaconBlockRoot?: import("viem").Hex | undefined;
        parentHash: import("viem").Hash;
        receiptsRoot: import("viem").Hex;
        sealFields: import("viem").Hex[];
        sha3Uncles: import("viem").Hash;
        size: bigint;
        stateRoot: import("viem").Hash;
        totalDifficulty: bigint;
        transactionsRoot: import("viem").Hash;
        uncles: import("viem").Hash[];
        withdrawals?: import("viem").Withdrawal[] | undefined;
        withdrawalsRoot?: import("viem").Hex | undefined;
        transactions: includeTransactions extends true ? ({
            type: "legacy";
            nonce: number;
            from: import("viem").Address;
            chainId?: number;
            to: import("viem").Address | null;
            yParity?: undefined;
            gas: bigint;
            hash: import("viem").Hash;
            input: import("viem").Hex;
            r: import("viem").Hex;
            s: import("viem").Hex;
            typeHex: import("viem").Hex | null;
            v: bigint;
            value: bigint;
            accessList?: undefined;
            authorizationList?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice: bigint;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
            blockHash: (blockTag extends "pending" ? true : false) extends infer T ? T extends (blockTag extends "pending" ? true : false) ? T extends true ? null : `0x${string}` : never : never;
            blockNumber: (blockTag extends "pending" ? true : false) extends infer T_1 ? T_1 extends (blockTag extends "pending" ? true : false) ? T_1 extends true ? null : bigint : never : never;
            transactionIndex: (blockTag extends "pending" ? true : false) extends infer T_2 ? T_2 extends (blockTag extends "pending" ? true : false) ? T_2 extends true ? null : number : never : never;
        } | {
            type: "eip2930";
            nonce: number;
            from: import("viem").Address;
            chainId: number;
            to: import("viem").Address | null;
            yParity: number;
            gas: bigint;
            hash: import("viem").Hash;
            input: import("viem").Hex;
            r: import("viem").Hex;
            s: import("viem").Hex;
            typeHex: import("viem").Hex | null;
            v: bigint;
            value: bigint;
            accessList: import("viem").AccessList;
            authorizationList?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice: bigint;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
            blockHash: (blockTag extends "pending" ? true : false) extends infer T_3 ? T_3 extends (blockTag extends "pending" ? true : false) ? T_3 extends true ? null : `0x${string}` : never : never;
            blockNumber: (blockTag extends "pending" ? true : false) extends infer T_4 ? T_4 extends (blockTag extends "pending" ? true : false) ? T_4 extends true ? null : bigint : never : never;
            transactionIndex: (blockTag extends "pending" ? true : false) extends infer T_5 ? T_5 extends (blockTag extends "pending" ? true : false) ? T_5 extends true ? null : number : never : never;
        } | {
            type: "eip1559";
            nonce: number;
            from: import("viem").Address;
            chainId: number;
            to: import("viem").Address | null;
            yParity: number;
            gas: bigint;
            hash: import("viem").Hash;
            input: import("viem").Hex;
            r: import("viem").Hex;
            s: import("viem").Hex;
            typeHex: import("viem").Hex | null;
            v: bigint;
            value: bigint;
            accessList: import("viem").AccessList;
            authorizationList?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas: bigint;
            maxPriorityFeePerGas: bigint;
            blockHash: (blockTag extends "pending" ? true : false) extends infer T_6 ? T_6 extends (blockTag extends "pending" ? true : false) ? T_6 extends true ? null : `0x${string}` : never : never;
            blockNumber: (blockTag extends "pending" ? true : false) extends infer T_7 ? T_7 extends (blockTag extends "pending" ? true : false) ? T_7 extends true ? null : bigint : never : never;
            transactionIndex: (blockTag extends "pending" ? true : false) extends infer T_8 ? T_8 extends (blockTag extends "pending" ? true : false) ? T_8 extends true ? null : number : never : never;
        } | {
            type: "eip4844";
            nonce: number;
            from: import("viem").Address;
            chainId: number;
            to: import("viem").Address | null;
            yParity: number;
            gas: bigint;
            hash: import("viem").Hash;
            input: import("viem").Hex;
            r: import("viem").Hex;
            s: import("viem").Hex;
            typeHex: import("viem").Hex | null;
            v: bigint;
            value: bigint;
            accessList: import("viem").AccessList;
            authorizationList?: undefined;
            blobVersionedHashes: readonly import("viem").Hex[];
            gasPrice?: undefined;
            maxFeePerBlobGas: bigint;
            maxFeePerGas: bigint;
            maxPriorityFeePerGas: bigint;
            blockHash: (blockTag extends "pending" ? true : false) extends infer T_9 ? T_9 extends (blockTag extends "pending" ? true : false) ? T_9 extends true ? null : `0x${string}` : never : never;
            blockNumber: (blockTag extends "pending" ? true : false) extends infer T_10 ? T_10 extends (blockTag extends "pending" ? true : false) ? T_10 extends true ? null : bigint : never : never;
            transactionIndex: (blockTag extends "pending" ? true : false) extends infer T_11 ? T_11 extends (blockTag extends "pending" ? true : false) ? T_11 extends true ? null : number : never : never;
        } | {
            type: "eip7702";
            nonce: number;
            from: import("viem").Address;
            chainId: number;
            to: import("viem").Address | null;
            yParity: number;
            gas: bigint;
            hash: import("viem").Hash;
            input: import("viem").Hex;
            r: import("viem").Hex;
            s: import("viem").Hex;
            typeHex: import("viem").Hex | null;
            v: bigint;
            value: bigint;
            accessList: import("viem").AccessList;
            authorizationList: import("viem").SignedAuthorizationList;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas: bigint;
            maxPriorityFeePerGas: bigint;
            blockHash: (blockTag extends "pending" ? true : false) extends infer T_12 ? T_12 extends (blockTag extends "pending" ? true : false) ? T_12 extends true ? null : `0x${string}` : never : never;
            blockNumber: (blockTag extends "pending" ? true : false) extends infer T_13 ? T_13 extends (blockTag extends "pending" ? true : false) ? T_13 extends true ? null : bigint : never : never;
            transactionIndex: (blockTag extends "pending" ? true : false) extends infer T_14 ? T_14 extends (blockTag extends "pending" ? true : false) ? T_14 extends true ? null : number : never : never;
        })[] : `0x${string}`[];
    }>;
    getBlockNumber: (args?: import("viem").GetBlockNumberParameters | undefined) => Promise<import("viem").GetBlockNumberReturnType>;
    getBlockTransactionCount: (args?: import("viem").GetBlockTransactionCountParameters | undefined) => Promise<import("viem").GetBlockTransactionCountReturnType>;
    getBytecode: (args: import("viem").GetBytecodeParameters) => Promise<import("viem").GetBytecodeReturnType>;
    getChainId: () => Promise<import("viem").GetChainIdReturnType>;
    getCode: (args: import("viem").GetBytecodeParameters) => Promise<import("viem").GetBytecodeReturnType>;
    getContractEvents: <const abi extends import("viem").Abi | readonly unknown[], eventName extends import("viem").ContractEventName<abi> | undefined = undefined, strict extends boolean | undefined = undefined, fromBlock extends import("viem").BlockNumber | import("viem").BlockTag | undefined = undefined, toBlock extends import("viem").BlockNumber | import("viem").BlockTag | undefined = undefined>(args: import("viem").GetContractEventsParameters<abi, eventName, strict, fromBlock, toBlock>) => Promise<import("viem").GetContractEventsReturnType<abi, eventName, strict, fromBlock, toBlock>>;
    getDelegation: (args: import("viem").GetDelegationParameters) => Promise<import("viem").GetDelegationReturnType>;
    getEip712Domain: (args: import("viem").GetEip712DomainParameters) => Promise<import("viem").GetEip712DomainReturnType>;
    getEnsAddress: (args: import("viem").GetEnsAddressParameters) => Promise<import("viem").GetEnsAddressReturnType>;
    getEnsAvatar: (args: import("viem").GetEnsAvatarParameters) => Promise<import("viem").GetEnsAvatarReturnType>;
    getEnsName: (args: import("viem").GetEnsNameParameters) => Promise<import("viem").GetEnsNameReturnType>;
    getEnsResolver: (args: import("viem").GetEnsResolverParameters) => Promise<import("viem").GetEnsResolverReturnType>;
    getEnsText: (args: import("viem").GetEnsTextParameters) => Promise<import("viem").GetEnsTextReturnType>;
    getFeeHistory: (args: import("viem").GetFeeHistoryParameters) => Promise<import("viem").GetFeeHistoryReturnType>;
    estimateFeesPerGas: <chainOverride extends import("viem").Chain | undefined = undefined, type extends import("viem").FeeValuesType = "eip1559">(args?: import("viem").EstimateFeesPerGasParameters<{
        blockExplorers: {
            readonly default: {
                readonly name: "PolygonScan";
                readonly url: "https://polygonscan.com";
                readonly apiUrl: "https://api.etherscan.io/v2/api";
            };
        };
        blockTime: 2000;
        contracts: {
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 25770160;
            };
        };
        ensTlds?: readonly string[] | undefined;
        id: 137;
        name: "Polygon";
        nativeCurrency: {
            readonly name: "POL";
            readonly symbol: "POL";
            readonly decimals: 18;
        };
        experimental_preconfirmationTime?: number | undefined | undefined;
        rpcUrls: {
            readonly default: {
                readonly http: readonly ["https://polygon.drpc.org"];
            };
        };
        sourceId?: number | undefined | undefined;
        testnet?: boolean | undefined | undefined;
        custom?: Record<string, unknown> | undefined;
        extendSchema?: Record<string, unknown> | undefined;
        fees?: import("viem").ChainFees<undefined> | undefined;
        formatters?: undefined;
        prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
            runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
        }] | undefined;
        serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
        verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
    }, chainOverride, type>) => Promise<import("viem").EstimateFeesPerGasReturnType<type>>;
    getFilterChanges: <filterType extends import("viem").FilterType, const abi extends import("viem").Abi | readonly unknown[] | undefined, eventName extends string | undefined, strict extends boolean | undefined = undefined, fromBlock extends import("viem").BlockNumber | import("viem").BlockTag | undefined = undefined, toBlock extends import("viem").BlockNumber | import("viem").BlockTag | undefined = undefined>(args: import("viem").GetFilterChangesParameters<filterType, abi, eventName, strict, fromBlock, toBlock>) => Promise<import("viem").GetFilterChangesReturnType<filterType, abi, eventName, strict, fromBlock, toBlock>>;
    getFilterLogs: <const abi extends import("viem").Abi | readonly unknown[] | undefined, eventName extends string | undefined, strict extends boolean | undefined = undefined, fromBlock extends import("viem").BlockNumber | import("viem").BlockTag | undefined = undefined, toBlock extends import("viem").BlockNumber | import("viem").BlockTag | undefined = undefined>(args: import("viem").GetFilterLogsParameters<abi, eventName, strict, fromBlock, toBlock>) => Promise<import("viem").GetFilterLogsReturnType<abi, eventName, strict, fromBlock, toBlock>>;
    getGasPrice: () => Promise<import("viem").GetGasPriceReturnType>;
    getLogs: <const abiEvent extends import("viem").AbiEvent | undefined = undefined, const abiEvents extends readonly import("viem").AbiEvent[] | readonly unknown[] | undefined = abiEvent extends import("viem").AbiEvent ? [abiEvent] : undefined, strict extends boolean | undefined = undefined, fromBlock extends import("viem").BlockNumber | import("viem").BlockTag | undefined = undefined, toBlock extends import("viem").BlockNumber | import("viem").BlockTag | undefined = undefined>(args?: import("viem").GetLogsParameters<abiEvent, abiEvents, strict, fromBlock, toBlock> | undefined) => Promise<import("viem").GetLogsReturnType<abiEvent, abiEvents, strict, fromBlock, toBlock>>;
    getProof: (args: import("viem").GetProofParameters) => Promise<import("viem").GetProofReturnType>;
    estimateMaxPriorityFeePerGas: <chainOverride extends import("viem").Chain | undefined = undefined>(args?: {
        chain: chainOverride;
    }) => Promise<import("viem").EstimateMaxPriorityFeePerGasReturnType>;
    getStorageAt: (args: import("viem").GetStorageAtParameters) => Promise<import("viem").GetStorageAtReturnType>;
    getTransaction: <blockTag extends import("viem").BlockTag = "latest">(args: import("viem").GetTransactionParameters<blockTag>) => Promise<{
        type: "legacy";
        nonce: number;
        from: import("viem").Address;
        chainId?: number;
        to: import("viem").Address | null;
        yParity?: undefined;
        gas: bigint;
        hash: import("viem").Hash;
        input: import("viem").Hex;
        r: import("viem").Hex;
        s: import("viem").Hex;
        typeHex: import("viem").Hex | null;
        v: bigint;
        value: bigint;
        accessList?: undefined;
        authorizationList?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice: bigint;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
        blockHash: (blockTag extends "pending" ? true : false) extends infer T ? T extends (blockTag extends "pending" ? true : false) ? T extends true ? null : `0x${string}` : never : never;
        blockNumber: (blockTag extends "pending" ? true : false) extends infer T_1 ? T_1 extends (blockTag extends "pending" ? true : false) ? T_1 extends true ? null : bigint : never : never;
        transactionIndex: (blockTag extends "pending" ? true : false) extends infer T_2 ? T_2 extends (blockTag extends "pending" ? true : false) ? T_2 extends true ? null : number : never : never;
    } | {
        type: "eip2930";
        nonce: number;
        from: import("viem").Address;
        chainId: number;
        to: import("viem").Address | null;
        yParity: number;
        gas: bigint;
        hash: import("viem").Hash;
        input: import("viem").Hex;
        r: import("viem").Hex;
        s: import("viem").Hex;
        typeHex: import("viem").Hex | null;
        v: bigint;
        value: bigint;
        accessList: import("viem").AccessList;
        authorizationList?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice: bigint;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
        blockHash: (blockTag extends "pending" ? true : false) extends infer T_3 ? T_3 extends (blockTag extends "pending" ? true : false) ? T_3 extends true ? null : `0x${string}` : never : never;
        blockNumber: (blockTag extends "pending" ? true : false) extends infer T_4 ? T_4 extends (blockTag extends "pending" ? true : false) ? T_4 extends true ? null : bigint : never : never;
        transactionIndex: (blockTag extends "pending" ? true : false) extends infer T_5 ? T_5 extends (blockTag extends "pending" ? true : false) ? T_5 extends true ? null : number : never : never;
    } | {
        type: "eip1559";
        nonce: number;
        from: import("viem").Address;
        chainId: number;
        to: import("viem").Address | null;
        yParity: number;
        gas: bigint;
        hash: import("viem").Hash;
        input: import("viem").Hex;
        r: import("viem").Hex;
        s: import("viem").Hex;
        typeHex: import("viem").Hex | null;
        v: bigint;
        value: bigint;
        accessList: import("viem").AccessList;
        authorizationList?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas: bigint;
        maxPriorityFeePerGas: bigint;
        blockHash: (blockTag extends "pending" ? true : false) extends infer T_6 ? T_6 extends (blockTag extends "pending" ? true : false) ? T_6 extends true ? null : `0x${string}` : never : never;
        blockNumber: (blockTag extends "pending" ? true : false) extends infer T_7 ? T_7 extends (blockTag extends "pending" ? true : false) ? T_7 extends true ? null : bigint : never : never;
        transactionIndex: (blockTag extends "pending" ? true : false) extends infer T_8 ? T_8 extends (blockTag extends "pending" ? true : false) ? T_8 extends true ? null : number : never : never;
    } | {
        type: "eip4844";
        nonce: number;
        from: import("viem").Address;
        chainId: number;
        to: import("viem").Address | null;
        yParity: number;
        gas: bigint;
        hash: import("viem").Hash;
        input: import("viem").Hex;
        r: import("viem").Hex;
        s: import("viem").Hex;
        typeHex: import("viem").Hex | null;
        v: bigint;
        value: bigint;
        accessList: import("viem").AccessList;
        authorizationList?: undefined;
        blobVersionedHashes: readonly import("viem").Hex[];
        gasPrice?: undefined;
        maxFeePerBlobGas: bigint;
        maxFeePerGas: bigint;
        maxPriorityFeePerGas: bigint;
        blockHash: (blockTag extends "pending" ? true : false) extends infer T_9 ? T_9 extends (blockTag extends "pending" ? true : false) ? T_9 extends true ? null : `0x${string}` : never : never;
        blockNumber: (blockTag extends "pending" ? true : false) extends infer T_10 ? T_10 extends (blockTag extends "pending" ? true : false) ? T_10 extends true ? null : bigint : never : never;
        transactionIndex: (blockTag extends "pending" ? true : false) extends infer T_11 ? T_11 extends (blockTag extends "pending" ? true : false) ? T_11 extends true ? null : number : never : never;
    } | {
        type: "eip7702";
        nonce: number;
        from: import("viem").Address;
        chainId: number;
        to: import("viem").Address | null;
        yParity: number;
        gas: bigint;
        hash: import("viem").Hash;
        input: import("viem").Hex;
        r: import("viem").Hex;
        s: import("viem").Hex;
        typeHex: import("viem").Hex | null;
        v: bigint;
        value: bigint;
        accessList: import("viem").AccessList;
        authorizationList: import("viem").SignedAuthorizationList;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas: bigint;
        maxPriorityFeePerGas: bigint;
        blockHash: (blockTag extends "pending" ? true : false) extends infer T_12 ? T_12 extends (blockTag extends "pending" ? true : false) ? T_12 extends true ? null : `0x${string}` : never : never;
        blockNumber: (blockTag extends "pending" ? true : false) extends infer T_13 ? T_13 extends (blockTag extends "pending" ? true : false) ? T_13 extends true ? null : bigint : never : never;
        transactionIndex: (blockTag extends "pending" ? true : false) extends infer T_14 ? T_14 extends (blockTag extends "pending" ? true : false) ? T_14 extends true ? null : number : never : never;
    }>;
    getTransactionConfirmations: (args: import("viem").GetTransactionConfirmationsParameters<{
        blockExplorers: {
            readonly default: {
                readonly name: "PolygonScan";
                readonly url: "https://polygonscan.com";
                readonly apiUrl: "https://api.etherscan.io/v2/api";
            };
        };
        blockTime: 2000;
        contracts: {
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 25770160;
            };
        };
        ensTlds?: readonly string[] | undefined;
        id: 137;
        name: "Polygon";
        nativeCurrency: {
            readonly name: "POL";
            readonly symbol: "POL";
            readonly decimals: 18;
        };
        experimental_preconfirmationTime?: number | undefined | undefined;
        rpcUrls: {
            readonly default: {
                readonly http: readonly ["https://polygon.drpc.org"];
            };
        };
        sourceId?: number | undefined | undefined;
        testnet?: boolean | undefined | undefined;
        custom?: Record<string, unknown> | undefined;
        extendSchema?: Record<string, unknown> | undefined;
        fees?: import("viem").ChainFees<undefined> | undefined;
        formatters?: undefined;
        prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
            runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
        }] | undefined;
        serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
        verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
    }>) => Promise<import("viem").GetTransactionConfirmationsReturnType>;
    getTransactionCount: (args: import("viem").GetTransactionCountParameters) => Promise<import("viem").GetTransactionCountReturnType>;
    getTransactionReceipt: (args: import("viem").GetTransactionReceiptParameters) => Promise<import("viem").TransactionReceipt>;
    multicall: <const contracts extends readonly unknown[], allowFailure extends boolean = true>(args: import("viem").MulticallParameters<contracts, allowFailure>) => Promise<import("viem").MulticallReturnType<contracts, allowFailure>>;
    prepareTransactionRequest: <const request extends import("viem").PrepareTransactionRequestRequest<{
        blockExplorers: {
            readonly default: {
                readonly name: "PolygonScan";
                readonly url: "https://polygonscan.com";
                readonly apiUrl: "https://api.etherscan.io/v2/api";
            };
        };
        blockTime: 2000;
        contracts: {
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 25770160;
            };
        };
        ensTlds?: readonly string[] | undefined;
        id: 137;
        name: "Polygon";
        nativeCurrency: {
            readonly name: "POL";
            readonly symbol: "POL";
            readonly decimals: 18;
        };
        experimental_preconfirmationTime?: number | undefined | undefined;
        rpcUrls: {
            readonly default: {
                readonly http: readonly ["https://polygon.drpc.org"];
            };
        };
        sourceId?: number | undefined | undefined;
        testnet?: boolean | undefined | undefined;
        custom?: Record<string, unknown> | undefined;
        extendSchema?: Record<string, unknown> | undefined;
        fees?: import("viem").ChainFees<undefined> | undefined;
        formatters?: undefined;
        prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
            runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
        }] | undefined;
        serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
        verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
    }, chainOverride>, chainOverride extends import("viem").Chain | undefined = undefined, accountOverride extends import("viem").Account | import("viem").Address | undefined = undefined>(args: import("viem").PrepareTransactionRequestParameters<{
        blockExplorers: {
            readonly default: {
                readonly name: "PolygonScan";
                readonly url: "https://polygonscan.com";
                readonly apiUrl: "https://api.etherscan.io/v2/api";
            };
        };
        blockTime: 2000;
        contracts: {
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 25770160;
            };
        };
        ensTlds?: readonly string[] | undefined;
        id: 137;
        name: "Polygon";
        nativeCurrency: {
            readonly name: "POL";
            readonly symbol: "POL";
            readonly decimals: 18;
        };
        experimental_preconfirmationTime?: number | undefined | undefined;
        rpcUrls: {
            readonly default: {
                readonly http: readonly ["https://polygon.drpc.org"];
            };
        };
        sourceId?: number | undefined | undefined;
        testnet?: boolean | undefined | undefined;
        custom?: Record<string, unknown> | undefined;
        extendSchema?: Record<string, unknown> | undefined;
        fees?: import("viem").ChainFees<undefined> | undefined;
        formatters?: undefined;
        prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
            runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
        }] | undefined;
        serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
        verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
    }, import("viem").Account, chainOverride, accountOverride, request>) => Promise<import("viem").UnionRequiredBy<Extract<import("viem").UnionOmit<import("viem").ExtractChainFormatterParameters<import("viem").DeriveChain<{
        blockExplorers: {
            readonly default: {
                readonly name: "PolygonScan";
                readonly url: "https://polygonscan.com";
                readonly apiUrl: "https://api.etherscan.io/v2/api";
            };
        };
        blockTime: 2000;
        contracts: {
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 25770160;
            };
        };
        ensTlds?: readonly string[] | undefined;
        id: 137;
        name: "Polygon";
        nativeCurrency: {
            readonly name: "POL";
            readonly symbol: "POL";
            readonly decimals: 18;
        };
        experimental_preconfirmationTime?: number | undefined | undefined;
        rpcUrls: {
            readonly default: {
                readonly http: readonly ["https://polygon.drpc.org"];
            };
        };
        sourceId?: number | undefined | undefined;
        testnet?: boolean | undefined | undefined;
        custom?: Record<string, unknown> | undefined;
        extendSchema?: Record<string, unknown> | undefined;
        fees?: import("viem").ChainFees<undefined> | undefined;
        formatters?: undefined;
        prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
            runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
        }] | undefined;
        serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
        verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
    }, chainOverride>, "transactionRequest", import("viem").TransactionRequest>, "from"> & (import("viem").DeriveChain<{
        blockExplorers: {
            readonly default: {
                readonly name: "PolygonScan";
                readonly url: "https://polygonscan.com";
                readonly apiUrl: "https://api.etherscan.io/v2/api";
            };
        };
        blockTime: 2000;
        contracts: {
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 25770160;
            };
        };
        ensTlds?: readonly string[] | undefined;
        id: 137;
        name: "Polygon";
        nativeCurrency: {
            readonly name: "POL";
            readonly symbol: "POL";
            readonly decimals: 18;
        };
        experimental_preconfirmationTime?: number | undefined | undefined;
        rpcUrls: {
            readonly default: {
                readonly http: readonly ["https://polygon.drpc.org"];
            };
        };
        sourceId?: number | undefined | undefined;
        testnet?: boolean | undefined | undefined;
        custom?: Record<string, unknown> | undefined;
        extendSchema?: Record<string, unknown> | undefined;
        fees?: import("viem").ChainFees<undefined> | undefined;
        formatters?: undefined;
        prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
            runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
        }] | undefined;
        serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
        verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
    }, chainOverride> extends infer T_1 ? T_1 extends import("viem").DeriveChain<{
        blockExplorers: {
            readonly default: {
                readonly name: "PolygonScan";
                readonly url: "https://polygonscan.com";
                readonly apiUrl: "https://api.etherscan.io/v2/api";
            };
        };
        blockTime: 2000;
        contracts: {
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 25770160;
            };
        };
        ensTlds?: readonly string[] | undefined;
        id: 137;
        name: "Polygon";
        nativeCurrency: {
            readonly name: "POL";
            readonly symbol: "POL";
            readonly decimals: 18;
        };
        experimental_preconfirmationTime?: number | undefined | undefined;
        rpcUrls: {
            readonly default: {
                readonly http: readonly ["https://polygon.drpc.org"];
            };
        };
        sourceId?: number | undefined | undefined;
        testnet?: boolean | undefined | undefined;
        custom?: Record<string, unknown> | undefined;
        extendSchema?: Record<string, unknown> | undefined;
        fees?: import("viem").ChainFees<undefined> | undefined;
        formatters?: undefined;
        prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
            runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
        }] | undefined;
        serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
        verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
    }, chainOverride> ? T_1 extends import("viem").Chain ? {
        chain: T_1;
    } : {
        chain?: undefined;
    } : never : never) & (import("viem").DeriveAccount<import("viem").Account, accountOverride> extends infer T_2 ? T_2 extends import("viem").DeriveAccount<import("viem").Account, accountOverride> ? T_2 extends import("viem").Account ? {
        account: T_2;
        from: import("viem").Address;
    } : {
        account?: undefined;
        from?: undefined;
    } : never : never), import("viem").IsNever<((request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) extends infer T_3 ? T_3 extends (request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) ? T_3 extends "legacy" ? import("viem").TransactionRequestLegacy : never : never : never) | ((request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) extends infer T_4 ? T_4 extends (request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) ? T_4 extends "eip1559" ? import("viem").TransactionRequestEIP1559 : never : never : never) | ((request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) extends infer T_5 ? T_5 extends (request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) ? T_5 extends "eip2930" ? import("viem").TransactionRequestEIP2930 : never : never : never) | ((request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) extends infer T_6 ? T_6 extends (request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) ? T_6 extends "eip4844" ? import("viem").TransactionRequestEIP4844 : never : never : never) | ((request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) extends infer T_7 ? T_7 extends (request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) ? T_7 extends "eip7702" ? import("viem").TransactionRequestEIP7702 : never : never : never)> extends true ? unknown : import("viem").ExactPartial<((request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) extends infer T_8 ? T_8 extends (request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) ? T_8 extends "legacy" ? import("viem").TransactionRequestLegacy : never : never : never) | ((request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) extends infer T_9 ? T_9 extends (request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) ? T_9 extends "eip1559" ? import("viem").TransactionRequestEIP1559 : never : never : never) | ((request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) extends infer T_10 ? T_10 extends (request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) ? T_10 extends "eip2930" ? import("viem").TransactionRequestEIP2930 : never : never : never) | ((request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) extends infer T_11 ? T_11 extends (request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) ? T_11 extends "eip4844" ? import("viem").TransactionRequestEIP4844 : never : never : never) | ((request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) extends infer T_12 ? T_12 extends (request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
        accessList?: undefined;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
    } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } & (import("viem").OneOf<{
        maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
    } | {
        maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
    }, import("viem").FeeValuesEIP1559> & {
        accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
    }) ? "eip1559" : never) | (request extends {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: bigint;
        sidecars?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: undefined;
        maxPriorityFeePerGas?: undefined;
    } & {
        accessList: import("viem").TransactionSerializableEIP2930["accessList"];
    } ? "eip2930" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: undefined;
        blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
        blobVersionedHashes?: readonly `0x${string}`[];
        maxFeePerBlobGas?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
    }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
        blobs: import("viem").TransactionSerializableEIP4844["blobs"];
    } | {
        blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
    } | {
        sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
    }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    } | {
        accessList?: import("viem").AccessList;
        authorizationList?: import("viem").SignedAuthorizationList;
        blobs?: undefined;
        blobVersionedHashes?: undefined;
        gasPrice?: undefined;
        maxFeePerBlobGas?: undefined;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        sidecars?: undefined;
    }) & {
        authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
    } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) ? T_12 extends "eip7702" ? import("viem").TransactionRequestEIP7702 : never : never : never)>> & {
        chainId?: number | undefined;
    }, (request["parameters"] extends readonly import("viem").PrepareTransactionRequestParameterType[] ? request["parameters"][number] : "type" | "nonce" | "chainId" | "fees" | "gas" | "blobVersionedHashes") extends infer T_13 ? T_13 extends (request["parameters"] extends readonly import("viem").PrepareTransactionRequestParameterType[] ? request["parameters"][number] : "type" | "nonce" | "chainId" | "fees" | "gas" | "blobVersionedHashes") ? T_13 extends "fees" ? "gasPrice" | "maxFeePerGas" | "maxPriorityFeePerGas" : T_13 : never : never> & (unknown extends request["kzg"] ? {} : Pick<request, "kzg">) & {
        _capabilities?: {
            [x: string]: any;
        };
    } extends infer T ? { [K in keyof T]: T[K]; } : never>;
    readContract: <const abi extends import("viem").Abi | readonly unknown[], functionName extends import("viem").ContractFunctionName<abi, "pure" | "view">, const args extends import("viem").ContractFunctionArgs<abi, "pure" | "view", functionName>>(args: import("viem").ReadContractParameters<abi, functionName, args>) => Promise<import("viem").ReadContractReturnType<abi, functionName, args>>;
    sendRawTransaction: (args: import("viem").SendRawTransactionParameters) => Promise<import("viem").SendRawTransactionReturnType>;
    sendRawTransactionSync: (args: import("viem").SendRawTransactionSyncParameters) => Promise<import("viem").TransactionReceipt>;
    simulate: <const calls extends readonly unknown[]>(args: import("viem").SimulateBlocksParameters<calls>) => Promise<import("viem").SimulateBlocksReturnType<calls>>;
    simulateBlocks: <const calls extends readonly unknown[]>(args: import("viem").SimulateBlocksParameters<calls>) => Promise<import("viem").SimulateBlocksReturnType<calls>>;
    simulateCalls: <const calls extends readonly unknown[]>(args: import("viem").SimulateCallsParameters<calls>) => Promise<import("viem").SimulateCallsReturnType<calls>>;
    simulateContract: <const abi extends import("viem").Abi | readonly unknown[], functionName extends import("viem").ContractFunctionName<abi, "nonpayable" | "payable">, const args_1 extends import("viem").ContractFunctionArgs<abi, "nonpayable" | "payable", functionName>, chainOverride extends import("viem").Chain | undefined, accountOverride extends import("viem").Account | import("viem").Address | undefined = undefined>(args: import("viem").SimulateContractParameters<abi, functionName, args_1, {
        blockExplorers: {
            readonly default: {
                readonly name: "PolygonScan";
                readonly url: "https://polygonscan.com";
                readonly apiUrl: "https://api.etherscan.io/v2/api";
            };
        };
        blockTime: 2000;
        contracts: {
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 25770160;
            };
        };
        ensTlds?: readonly string[] | undefined;
        id: 137;
        name: "Polygon";
        nativeCurrency: {
            readonly name: "POL";
            readonly symbol: "POL";
            readonly decimals: 18;
        };
        experimental_preconfirmationTime?: number | undefined | undefined;
        rpcUrls: {
            readonly default: {
                readonly http: readonly ["https://polygon.drpc.org"];
            };
        };
        sourceId?: number | undefined | undefined;
        testnet?: boolean | undefined | undefined;
        custom?: Record<string, unknown> | undefined;
        extendSchema?: Record<string, unknown> | undefined;
        fees?: import("viem").ChainFees<undefined> | undefined;
        formatters?: undefined;
        prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
            runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
        }] | undefined;
        serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
        verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
    }, chainOverride, accountOverride>) => Promise<import("viem").SimulateContractReturnType<abi, functionName, args_1, {
        blockExplorers: {
            readonly default: {
                readonly name: "PolygonScan";
                readonly url: "https://polygonscan.com";
                readonly apiUrl: "https://api.etherscan.io/v2/api";
            };
        };
        blockTime: 2000;
        contracts: {
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 25770160;
            };
        };
        ensTlds?: readonly string[] | undefined;
        id: 137;
        name: "Polygon";
        nativeCurrency: {
            readonly name: "POL";
            readonly symbol: "POL";
            readonly decimals: 18;
        };
        experimental_preconfirmationTime?: number | undefined | undefined;
        rpcUrls: {
            readonly default: {
                readonly http: readonly ["https://polygon.drpc.org"];
            };
        };
        sourceId?: number | undefined | undefined;
        testnet?: boolean | undefined | undefined;
        custom?: Record<string, unknown> | undefined;
        extendSchema?: Record<string, unknown> | undefined;
        fees?: import("viem").ChainFees<undefined> | undefined;
        formatters?: undefined;
        prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
            runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
        }] | undefined;
        serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
        verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
    }, import("viem").Account, chainOverride, accountOverride>>;
    verifyHash: (args: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>;
    verifyMessage: (args: import("viem").VerifyMessageActionParameters) => Promise<import("viem").VerifyMessageActionReturnType>;
    verifySiweMessage: (args: {
        blockNumber?: bigint | undefined;
        blockTag?: import("viem").BlockTag;
        nonce?: string | undefined;
        time?: Date | undefined;
        address?: import("viem").Address | undefined;
        domain?: string | undefined;
        scheme?: string | undefined;
        message: string;
        signature: import("viem").Hex;
    }) => Promise<boolean>;
    verifyTypedData: (args: import("viem").VerifyTypedDataActionParameters) => Promise<import("viem").VerifyTypedDataActionReturnType>;
    uninstallFilter: (args: import("viem").UninstallFilterParameters) => Promise<import("viem").UninstallFilterReturnType>;
    waitForTransactionReceipt: (args: import("viem").WaitForTransactionReceiptParameters<{
        blockExplorers: {
            readonly default: {
                readonly name: "PolygonScan";
                readonly url: "https://polygonscan.com";
                readonly apiUrl: "https://api.etherscan.io/v2/api";
            };
        };
        blockTime: 2000;
        contracts: {
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 25770160;
            };
        };
        ensTlds?: readonly string[] | undefined;
        id: 137;
        name: "Polygon";
        nativeCurrency: {
            readonly name: "POL";
            readonly symbol: "POL";
            readonly decimals: 18;
        };
        experimental_preconfirmationTime?: number | undefined | undefined;
        rpcUrls: {
            readonly default: {
                readonly http: readonly ["https://polygon.drpc.org"];
            };
        };
        sourceId?: number | undefined | undefined;
        testnet?: boolean | undefined | undefined;
        custom?: Record<string, unknown> | undefined;
        extendSchema?: Record<string, unknown> | undefined;
        fees?: import("viem").ChainFees<undefined> | undefined;
        formatters?: undefined;
        prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
            runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
        }] | undefined;
        serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
        verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
    }>) => Promise<import("viem").TransactionReceipt>;
    watchBlockNumber: (args: import("viem").WatchBlockNumberParameters) => import("viem").WatchBlockNumberReturnType;
    watchBlocks: <includeTransactions extends boolean = false, blockTag extends import("viem").BlockTag = "latest">(args: import("viem").WatchBlocksParameters<import("viem").HttpTransport<undefined, false>, {
        blockExplorers: {
            readonly default: {
                readonly name: "PolygonScan";
                readonly url: "https://polygonscan.com";
                readonly apiUrl: "https://api.etherscan.io/v2/api";
            };
        };
        blockTime: 2000;
        contracts: {
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 25770160;
            };
        };
        ensTlds?: readonly string[] | undefined;
        id: 137;
        name: "Polygon";
        nativeCurrency: {
            readonly name: "POL";
            readonly symbol: "POL";
            readonly decimals: 18;
        };
        experimental_preconfirmationTime?: number | undefined | undefined;
        rpcUrls: {
            readonly default: {
                readonly http: readonly ["https://polygon.drpc.org"];
            };
        };
        sourceId?: number | undefined | undefined;
        testnet?: boolean | undefined | undefined;
        custom?: Record<string, unknown> | undefined;
        extendSchema?: Record<string, unknown> | undefined;
        fees?: import("viem").ChainFees<undefined> | undefined;
        formatters?: undefined;
        prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
            runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
        }] | undefined;
        serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
        verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
    }, includeTransactions, blockTag>) => import("viem").WatchBlocksReturnType;
    watchContractEvent: <const abi extends import("viem").Abi | readonly unknown[], eventName extends import("viem").ContractEventName<abi>, strict extends boolean | undefined = undefined>(args: import("viem").WatchContractEventParameters<abi, eventName, strict, import("viem").HttpTransport<undefined, false>>) => import("viem").WatchContractEventReturnType;
    watchEvent: <const abiEvent extends import("viem").AbiEvent | undefined = undefined, const abiEvents extends readonly import("viem").AbiEvent[] | readonly unknown[] | undefined = abiEvent extends import("viem").AbiEvent ? [abiEvent] : undefined, strict extends boolean | undefined = undefined>(args: import("viem").WatchEventParameters<abiEvent, abiEvents, strict, import("viem").HttpTransport<undefined, false>>) => import("viem").WatchEventReturnType;
    watchPendingTransactions: (args: import("viem").WatchPendingTransactionsParameters<import("viem").HttpTransport<undefined, false>>) => import("viem").WatchPendingTransactionsReturnType;
    extend: <const client extends {
        [x: string]: unknown;
        account?: undefined;
        batch?: undefined;
        cacheTime?: undefined;
        ccipRead?: undefined;
        chain?: undefined;
        dataSuffix?: undefined;
        experimental_blockTag?: undefined;
        key?: undefined;
        name?: undefined;
        pollingInterval?: undefined;
        request?: undefined;
        transport?: undefined;
        type?: undefined;
        uid?: undefined;
    } & import("viem").ExactPartial<Pick<import("viem").PublicActions<import("viem").HttpTransport<undefined, false>, {
        blockExplorers: {
            readonly default: {
                readonly name: "PolygonScan";
                readonly url: "https://polygonscan.com";
                readonly apiUrl: "https://api.etherscan.io/v2/api";
            };
        };
        blockTime: 2000;
        contracts: {
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 25770160;
            };
        };
        ensTlds?: readonly string[] | undefined;
        id: 137;
        name: "Polygon";
        nativeCurrency: {
            readonly name: "POL";
            readonly symbol: "POL";
            readonly decimals: 18;
        };
        experimental_preconfirmationTime?: number | undefined | undefined;
        rpcUrls: {
            readonly default: {
                readonly http: readonly ["https://polygon.drpc.org"];
            };
        };
        sourceId?: number | undefined | undefined;
        testnet?: boolean | undefined | undefined;
        custom?: Record<string, unknown> | undefined;
        extendSchema?: Record<string, unknown> | undefined;
        fees?: import("viem").ChainFees<undefined> | undefined;
        formatters?: undefined;
        prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
            runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
        }] | undefined;
        serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
        verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
    }, {
        address: undefined;
        type: "json-rpc";
    }>, "prepareTransactionRequest" | "call" | "createContractEventFilter" | "createEventFilter" | "estimateContractGas" | "estimateGas" | "getBlock" | "getBlockNumber" | "getChainId" | "getContractEvents" | "getEnsText" | "getFilterChanges" | "getGasPrice" | "getLogs" | "getTransaction" | "getTransactionCount" | "getTransactionReceipt" | "readContract" | "sendRawTransaction" | "simulateContract" | "uninstallFilter" | "watchBlockNumber" | "watchContractEvent"> & Pick<import("viem").WalletActions<{
        blockExplorers: {
            readonly default: {
                readonly name: "PolygonScan";
                readonly url: "https://polygonscan.com";
                readonly apiUrl: "https://api.etherscan.io/v2/api";
            };
        };
        blockTime: 2000;
        contracts: {
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 25770160;
            };
        };
        ensTlds?: readonly string[] | undefined;
        id: 137;
        name: "Polygon";
        nativeCurrency: {
            readonly name: "POL";
            readonly symbol: "POL";
            readonly decimals: 18;
        };
        experimental_preconfirmationTime?: number | undefined | undefined;
        rpcUrls: {
            readonly default: {
                readonly http: readonly ["https://polygon.drpc.org"];
            };
        };
        sourceId?: number | undefined | undefined;
        testnet?: boolean | undefined | undefined;
        custom?: Record<string, unknown> | undefined;
        extendSchema?: Record<string, unknown> | undefined;
        fees?: import("viem").ChainFees<undefined> | undefined;
        formatters?: undefined;
        prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
            runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
        }] | undefined;
        serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
        verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
    }, {
        address: undefined;
        type: "json-rpc";
    }>, "sendTransaction" | "writeContract">>>(fn: (client: import("viem").Client<import("viem").HttpTransport<undefined, false>, {
        blockExplorers: {
            readonly default: {
                readonly name: "PolygonScan";
                readonly url: "https://polygonscan.com";
                readonly apiUrl: "https://api.etherscan.io/v2/api";
            };
        };
        blockTime: 2000;
        contracts: {
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 25770160;
            };
        };
        ensTlds?: readonly string[] | undefined;
        id: 137;
        name: "Polygon";
        nativeCurrency: {
            readonly name: "POL";
            readonly symbol: "POL";
            readonly decimals: 18;
        };
        experimental_preconfirmationTime?: number | undefined | undefined;
        rpcUrls: {
            readonly default: {
                readonly http: readonly ["https://polygon.drpc.org"];
            };
        };
        sourceId?: number | undefined | undefined;
        testnet?: boolean | undefined | undefined;
        custom?: Record<string, unknown> | undefined;
        extendSchema?: Record<string, unknown> | undefined;
        fees?: import("viem").ChainFees<undefined> | undefined;
        formatters?: undefined;
        prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
            runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
        }] | undefined;
        serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
        verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
    }, {
        address: undefined;
        type: "json-rpc";
    }, [{
        Method: "web3_clientVersion";
        Parameters?: undefined;
        ReturnType: string;
    }, {
        Method: "web3_sha3";
        Parameters: [data: import("viem").Hash];
        ReturnType: string;
    }, {
        Method: "net_listening";
        Parameters?: undefined;
        ReturnType: boolean;
    }, {
        Method: "net_peerCount";
        Parameters?: undefined;
        ReturnType: import("viem").Quantity;
    }, {
        Method: "net_version";
        Parameters?: undefined;
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_blobBaseFee";
        Parameters?: undefined;
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_blockNumber";
        Parameters?: undefined;
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_call";
        Parameters: readonly [transaction: import("viem").ExactPartial<import("viem").RpcTransactionRequest>] | readonly [transaction: import("viem").ExactPartial<import("viem").RpcTransactionRequest>, block: import("viem").RpcBlockNumber | import("viem").BlockTag | import("viem").RpcBlockIdentifier] | readonly [transaction: import("viem").ExactPartial<import("viem").RpcTransactionRequest>, block: import("viem").RpcBlockNumber | import("viem").BlockTag | import("viem").RpcBlockIdentifier, stateOverrideSet: import("viem").RpcStateOverride] | readonly [transaction: import("viem").ExactPartial<import("viem").RpcTransactionRequest>, block: import("viem").RpcBlockNumber | import("viem").BlockTag | import("viem").RpcBlockIdentifier, stateOverrideSet: import("viem").RpcStateOverride, blockOverrides: import("viem").RpcBlockOverrides];
        ReturnType: import("viem").Hex;
    }, {
        Method: "eth_createAccessList";
        Parameters: [transaction: import("viem").ExactPartial<import("viem").RpcTransactionRequest>] | [transaction: import("viem").ExactPartial<import("viem").RpcTransactionRequest>, block: import("viem").RpcBlockNumber | import("viem").BlockTag | import("viem").RpcBlockIdentifier];
        ReturnType: {
            accessList: import("viem").AccessList;
            gasUsed: import("viem").Quantity;
        };
    }, {
        Method: "eth_chainId";
        Parameters?: undefined;
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_coinbase";
        Parameters?: undefined;
        ReturnType: import("viem").Address;
    }, {
        Method: "eth_estimateGas";
        Parameters: [transaction: import("viem").RpcTransactionRequest] | [transaction: import("viem").RpcTransactionRequest, block: import("viem").RpcBlockNumber | import("viem").BlockTag] | [transaction: import("viem").RpcTransactionRequest, block: import("viem").RpcBlockNumber | import("viem").BlockTag, stateOverride: import("viem").RpcStateOverride];
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_fillTransaction";
        Parameters: [transaction: import("viem").RpcTransactionRequest];
        ReturnType: {
            capabilities?: Record<string, unknown> | undefined;
            raw: import("viem").Hex;
            tx: import("viem").RpcTransaction;
        };
    }, {
        Method: "eth_feeHistory";
        Parameters: [blockCount: import("viem").Quantity, newestBlock: import("viem").RpcBlockNumber | import("viem").BlockTag, rewardPercentiles: number[] | undefined];
        ReturnType: import("viem").RpcFeeHistory;
    }, {
        Method: "eth_gasPrice";
        Parameters?: undefined;
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_getBalance";
        Parameters: [address: import("viem").Address, block: import("viem").RpcBlockNumber | import("viem").BlockTag | import("viem").RpcBlockIdentifier];
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_getBlockByHash";
        Parameters: [hash: import("viem").Hash, includeTransactionObjects: boolean];
        ReturnType: import("viem").RpcBlock | null;
    }, {
        Method: "eth_getBlockByNumber";
        Parameters: [block: import("viem").RpcBlockNumber | import("viem").BlockTag, includeTransactionObjects: boolean];
        ReturnType: import("viem").RpcBlock | null;
    }, {
        Method: "eth_getBlockTransactionCountByHash";
        Parameters: [hash: import("viem").Hash];
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_getBlockTransactionCountByNumber";
        Parameters: [block: import("viem").RpcBlockNumber | import("viem").BlockTag];
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_getCode";
        Parameters: [address: import("viem").Address, block: import("viem").RpcBlockNumber | import("viem").BlockTag | import("viem").RpcBlockIdentifier];
        ReturnType: import("viem").Hex;
    }, {
        Method: "eth_getFilterChanges";
        Parameters: [filterId: import("viem").Quantity];
        ReturnType: import("viem").RpcLog[] | import("viem").Hex[];
    }, {
        Method: "eth_getFilterLogs";
        Parameters: [filterId: import("viem").Quantity];
        ReturnType: import("viem").RpcLog[];
    }, {
        Method: "eth_getLogs";
        Parameters: [{
            address?: import("viem").Address | import("viem").Address[] | undefined;
            topics?: import("viem").LogTopic[] | undefined;
        } & ({
            fromBlock?: import("viem").RpcBlockNumber | import("viem").BlockTag | undefined;
            toBlock?: import("viem").RpcBlockNumber | import("viem").BlockTag | undefined;
            blockHash?: undefined;
        } | {
            fromBlock?: undefined;
            toBlock?: undefined;
            blockHash?: import("viem").Hash | undefined;
        })];
        ReturnType: import("viem").RpcLog[];
    }, {
        Method: "eth_getProof";
        Parameters: [address: import("viem").Address, storageKeys: import("viem").Hash[], block: import("viem").RpcBlockNumber | import("viem").BlockTag];
        ReturnType: import("viem").RpcProof;
    }, {
        Method: "eth_getStorageAt";
        Parameters: [address: import("viem").Address, index: import("viem").Quantity, block: import("viem").RpcBlockNumber | import("viem").BlockTag | import("viem").RpcBlockIdentifier];
        ReturnType: import("viem").Hex;
    }, {
        Method: "eth_getTransactionByBlockHashAndIndex";
        Parameters: [hash: import("viem").Hash, index: import("viem").Quantity];
        ReturnType: import("viem").RpcTransaction | null;
    }, {
        Method: "eth_getTransactionByBlockNumberAndIndex";
        Parameters: [block: import("viem").RpcBlockNumber | import("viem").BlockTag, index: import("viem").Quantity];
        ReturnType: import("viem").RpcTransaction | null;
    }, {
        Method: "eth_getTransactionByHash";
        Parameters: [hash: import("viem").Hash];
        ReturnType: import("viem").RpcTransaction | null;
    }, {
        Method: "eth_getTransactionBySenderAndNonce";
        Parameters: [sender: import("viem").Address, nonce: import("viem").Quantity];
        ReturnType: import("viem").RpcTransaction | null;
    }, {
        Method: "eth_getTransactionCount";
        Parameters: [address: import("viem").Address, block: import("viem").RpcBlockNumber | import("viem").BlockTag | import("viem").RpcBlockIdentifier];
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_getTransactionReceipt";
        Parameters: [hash: import("viem").Hash];
        ReturnType: import("viem").RpcTransactionReceipt | null;
    }, {
        Method: "eth_getUncleByBlockHashAndIndex";
        Parameters: [hash: import("viem").Hash, index: import("viem").Quantity];
        ReturnType: import("viem").RpcUncle | null;
    }, {
        Method: "eth_getUncleByBlockNumberAndIndex";
        Parameters: [block: import("viem").RpcBlockNumber | import("viem").BlockTag, index: import("viem").Quantity];
        ReturnType: import("viem").RpcUncle | null;
    }, {
        Method: "eth_getUncleCountByBlockHash";
        Parameters: [hash: import("viem").Hash];
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_getUncleCountByBlockNumber";
        Parameters: [block: import("viem").RpcBlockNumber | import("viem").BlockTag];
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_maxPriorityFeePerGas";
        Parameters?: undefined;
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_newBlockFilter";
        Parameters?: undefined;
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_newFilter";
        Parameters: [filter: {
            fromBlock?: import("viem").RpcBlockNumber | import("viem").BlockTag | undefined;
            toBlock?: import("viem").RpcBlockNumber | import("viem").BlockTag | undefined;
            address?: import("viem").Address | import("viem").Address[] | undefined;
            topics?: import("viem").LogTopic[] | undefined;
        }];
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_newPendingTransactionFilter";
        Parameters?: undefined;
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_protocolVersion";
        Parameters?: undefined;
        ReturnType: string;
    }, {
        Method: "eth_sendRawTransaction";
        Parameters: [signedTransaction: import("viem").Hex];
        ReturnType: import("viem").Hash;
    }, {
        Method: "eth_sendRawTransactionSync";
        Parameters: [signedTransaction: import("viem").Hex] | [signedTransaction: import("viem").Hex, timeout: number];
        ReturnType: import("viem").RpcTransactionReceipt;
    }, {
        Method: "eth_simulateV1";
        Parameters: [{
            blockStateCalls: readonly {
                blockOverrides?: import("viem").RpcBlockOverrides | undefined;
                calls?: readonly import("viem").ExactPartial<import("viem").RpcTransactionRequest>[] | undefined;
                stateOverrides?: import("viem").RpcStateOverride | undefined;
            }[];
            returnFullTransactions?: boolean | undefined;
            traceTransfers?: boolean | undefined;
            validation?: boolean | undefined;
        }, import("viem").RpcBlockNumber | import("viem").BlockTag];
        ReturnType: readonly (import("viem").RpcBlock & {
            calls: readonly {
                error?: {
                    data?: import("viem").Hex | undefined;
                    code: number;
                    message: string;
                } | undefined;
                logs?: readonly import("viem").RpcLog[] | undefined;
                gasUsed: import("viem").Hex;
                returnData: import("viem").Hex;
                status: import("viem").Hex;
            }[];
        })[];
    }, {
        Method: "eth_uninstallFilter";
        Parameters: [filterId: import("viem").Quantity];
        ReturnType: boolean;
    }, ...any[]], import("viem").PublicActions<import("viem").HttpTransport<undefined, false>, {
        blockExplorers: {
            readonly default: {
                readonly name: "PolygonScan";
                readonly url: "https://polygonscan.com";
                readonly apiUrl: "https://api.etherscan.io/v2/api";
            };
        };
        blockTime: 2000;
        contracts: {
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 25770160;
            };
        };
        ensTlds?: readonly string[] | undefined;
        id: 137;
        name: "Polygon";
        nativeCurrency: {
            readonly name: "POL";
            readonly symbol: "POL";
            readonly decimals: 18;
        };
        experimental_preconfirmationTime?: number | undefined | undefined;
        rpcUrls: {
            readonly default: {
                readonly http: readonly ["https://polygon.drpc.org"];
            };
        };
        sourceId?: number | undefined | undefined;
        testnet?: boolean | undefined | undefined;
        custom?: Record<string, unknown> | undefined;
        extendSchema?: Record<string, unknown> | undefined;
        fees?: import("viem").ChainFees<undefined> | undefined;
        formatters?: undefined;
        prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
            runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
        }] | undefined;
        serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
        verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
    }>>) => client) => import("viem").Client<import("viem").HttpTransport<undefined, false>, {
        blockExplorers: {
            readonly default: {
                readonly name: "PolygonScan";
                readonly url: "https://polygonscan.com";
                readonly apiUrl: "https://api.etherscan.io/v2/api";
            };
        };
        blockTime: 2000;
        contracts: {
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 25770160;
            };
        };
        ensTlds?: readonly string[] | undefined;
        id: 137;
        name: "Polygon";
        nativeCurrency: {
            readonly name: "POL";
            readonly symbol: "POL";
            readonly decimals: 18;
        };
        experimental_preconfirmationTime?: number | undefined | undefined;
        rpcUrls: {
            readonly default: {
                readonly http: readonly ["https://polygon.drpc.org"];
            };
        };
        sourceId?: number | undefined | undefined;
        testnet?: boolean | undefined | undefined;
        custom?: Record<string, unknown> | undefined;
        extendSchema?: Record<string, unknown> | undefined;
        fees?: import("viem").ChainFees<undefined> | undefined;
        formatters?: undefined;
        prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
            runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
        }] | undefined;
        serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
        verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
    }, {
        address: undefined;
        type: "json-rpc";
    }, [{
        Method: "web3_clientVersion";
        Parameters?: undefined;
        ReturnType: string;
    }, {
        Method: "web3_sha3";
        Parameters: [data: import("viem").Hash];
        ReturnType: string;
    }, {
        Method: "net_listening";
        Parameters?: undefined;
        ReturnType: boolean;
    }, {
        Method: "net_peerCount";
        Parameters?: undefined;
        ReturnType: import("viem").Quantity;
    }, {
        Method: "net_version";
        Parameters?: undefined;
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_blobBaseFee";
        Parameters?: undefined;
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_blockNumber";
        Parameters?: undefined;
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_call";
        Parameters: readonly [transaction: import("viem").ExactPartial<import("viem").RpcTransactionRequest>] | readonly [transaction: import("viem").ExactPartial<import("viem").RpcTransactionRequest>, block: import("viem").RpcBlockNumber | import("viem").BlockTag | import("viem").RpcBlockIdentifier] | readonly [transaction: import("viem").ExactPartial<import("viem").RpcTransactionRequest>, block: import("viem").RpcBlockNumber | import("viem").BlockTag | import("viem").RpcBlockIdentifier, stateOverrideSet: import("viem").RpcStateOverride] | readonly [transaction: import("viem").ExactPartial<import("viem").RpcTransactionRequest>, block: import("viem").RpcBlockNumber | import("viem").BlockTag | import("viem").RpcBlockIdentifier, stateOverrideSet: import("viem").RpcStateOverride, blockOverrides: import("viem").RpcBlockOverrides];
        ReturnType: import("viem").Hex;
    }, {
        Method: "eth_createAccessList";
        Parameters: [transaction: import("viem").ExactPartial<import("viem").RpcTransactionRequest>] | [transaction: import("viem").ExactPartial<import("viem").RpcTransactionRequest>, block: import("viem").RpcBlockNumber | import("viem").BlockTag | import("viem").RpcBlockIdentifier];
        ReturnType: {
            accessList: import("viem").AccessList;
            gasUsed: import("viem").Quantity;
        };
    }, {
        Method: "eth_chainId";
        Parameters?: undefined;
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_coinbase";
        Parameters?: undefined;
        ReturnType: import("viem").Address;
    }, {
        Method: "eth_estimateGas";
        Parameters: [transaction: import("viem").RpcTransactionRequest] | [transaction: import("viem").RpcTransactionRequest, block: import("viem").RpcBlockNumber | import("viem").BlockTag] | [transaction: import("viem").RpcTransactionRequest, block: import("viem").RpcBlockNumber | import("viem").BlockTag, stateOverride: import("viem").RpcStateOverride];
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_fillTransaction";
        Parameters: [transaction: import("viem").RpcTransactionRequest];
        ReturnType: {
            capabilities?: Record<string, unknown> | undefined;
            raw: import("viem").Hex;
            tx: import("viem").RpcTransaction;
        };
    }, {
        Method: "eth_feeHistory";
        Parameters: [blockCount: import("viem").Quantity, newestBlock: import("viem").RpcBlockNumber | import("viem").BlockTag, rewardPercentiles: number[] | undefined];
        ReturnType: import("viem").RpcFeeHistory;
    }, {
        Method: "eth_gasPrice";
        Parameters?: undefined;
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_getBalance";
        Parameters: [address: import("viem").Address, block: import("viem").RpcBlockNumber | import("viem").BlockTag | import("viem").RpcBlockIdentifier];
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_getBlockByHash";
        Parameters: [hash: import("viem").Hash, includeTransactionObjects: boolean];
        ReturnType: import("viem").RpcBlock | null;
    }, {
        Method: "eth_getBlockByNumber";
        Parameters: [block: import("viem").RpcBlockNumber | import("viem").BlockTag, includeTransactionObjects: boolean];
        ReturnType: import("viem").RpcBlock | null;
    }, {
        Method: "eth_getBlockTransactionCountByHash";
        Parameters: [hash: import("viem").Hash];
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_getBlockTransactionCountByNumber";
        Parameters: [block: import("viem").RpcBlockNumber | import("viem").BlockTag];
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_getCode";
        Parameters: [address: import("viem").Address, block: import("viem").RpcBlockNumber | import("viem").BlockTag | import("viem").RpcBlockIdentifier];
        ReturnType: import("viem").Hex;
    }, {
        Method: "eth_getFilterChanges";
        Parameters: [filterId: import("viem").Quantity];
        ReturnType: import("viem").RpcLog[] | import("viem").Hex[];
    }, {
        Method: "eth_getFilterLogs";
        Parameters: [filterId: import("viem").Quantity];
        ReturnType: import("viem").RpcLog[];
    }, {
        Method: "eth_getLogs";
        Parameters: [{
            address?: import("viem").Address | import("viem").Address[] | undefined;
            topics?: import("viem").LogTopic[] | undefined;
        } & ({
            fromBlock?: import("viem").RpcBlockNumber | import("viem").BlockTag | undefined;
            toBlock?: import("viem").RpcBlockNumber | import("viem").BlockTag | undefined;
            blockHash?: undefined;
        } | {
            fromBlock?: undefined;
            toBlock?: undefined;
            blockHash?: import("viem").Hash | undefined;
        })];
        ReturnType: import("viem").RpcLog[];
    }, {
        Method: "eth_getProof";
        Parameters: [address: import("viem").Address, storageKeys: import("viem").Hash[], block: import("viem").RpcBlockNumber | import("viem").BlockTag];
        ReturnType: import("viem").RpcProof;
    }, {
        Method: "eth_getStorageAt";
        Parameters: [address: import("viem").Address, index: import("viem").Quantity, block: import("viem").RpcBlockNumber | import("viem").BlockTag | import("viem").RpcBlockIdentifier];
        ReturnType: import("viem").Hex;
    }, {
        Method: "eth_getTransactionByBlockHashAndIndex";
        Parameters: [hash: import("viem").Hash, index: import("viem").Quantity];
        ReturnType: import("viem").RpcTransaction | null;
    }, {
        Method: "eth_getTransactionByBlockNumberAndIndex";
        Parameters: [block: import("viem").RpcBlockNumber | import("viem").BlockTag, index: import("viem").Quantity];
        ReturnType: import("viem").RpcTransaction | null;
    }, {
        Method: "eth_getTransactionByHash";
        Parameters: [hash: import("viem").Hash];
        ReturnType: import("viem").RpcTransaction | null;
    }, {
        Method: "eth_getTransactionBySenderAndNonce";
        Parameters: [sender: import("viem").Address, nonce: import("viem").Quantity];
        ReturnType: import("viem").RpcTransaction | null;
    }, {
        Method: "eth_getTransactionCount";
        Parameters: [address: import("viem").Address, block: import("viem").RpcBlockNumber | import("viem").BlockTag | import("viem").RpcBlockIdentifier];
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_getTransactionReceipt";
        Parameters: [hash: import("viem").Hash];
        ReturnType: import("viem").RpcTransactionReceipt | null;
    }, {
        Method: "eth_getUncleByBlockHashAndIndex";
        Parameters: [hash: import("viem").Hash, index: import("viem").Quantity];
        ReturnType: import("viem").RpcUncle | null;
    }, {
        Method: "eth_getUncleByBlockNumberAndIndex";
        Parameters: [block: import("viem").RpcBlockNumber | import("viem").BlockTag, index: import("viem").Quantity];
        ReturnType: import("viem").RpcUncle | null;
    }, {
        Method: "eth_getUncleCountByBlockHash";
        Parameters: [hash: import("viem").Hash];
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_getUncleCountByBlockNumber";
        Parameters: [block: import("viem").RpcBlockNumber | import("viem").BlockTag];
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_maxPriorityFeePerGas";
        Parameters?: undefined;
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_newBlockFilter";
        Parameters?: undefined;
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_newFilter";
        Parameters: [filter: {
            fromBlock?: import("viem").RpcBlockNumber | import("viem").BlockTag | undefined;
            toBlock?: import("viem").RpcBlockNumber | import("viem").BlockTag | undefined;
            address?: import("viem").Address | import("viem").Address[] | undefined;
            topics?: import("viem").LogTopic[] | undefined;
        }];
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_newPendingTransactionFilter";
        Parameters?: undefined;
        ReturnType: import("viem").Quantity;
    }, {
        Method: "eth_protocolVersion";
        Parameters?: undefined;
        ReturnType: string;
    }, {
        Method: "eth_sendRawTransaction";
        Parameters: [signedTransaction: import("viem").Hex];
        ReturnType: import("viem").Hash;
    }, {
        Method: "eth_sendRawTransactionSync";
        Parameters: [signedTransaction: import("viem").Hex] | [signedTransaction: import("viem").Hex, timeout: number];
        ReturnType: import("viem").RpcTransactionReceipt;
    }, {
        Method: "eth_simulateV1";
        Parameters: [{
            blockStateCalls: readonly {
                blockOverrides?: import("viem").RpcBlockOverrides | undefined;
                calls?: readonly import("viem").ExactPartial<import("viem").RpcTransactionRequest>[] | undefined;
                stateOverrides?: import("viem").RpcStateOverride | undefined;
            }[];
            returnFullTransactions?: boolean | undefined;
            traceTransfers?: boolean | undefined;
            validation?: boolean | undefined;
        }, import("viem").RpcBlockNumber | import("viem").BlockTag];
        ReturnType: readonly (import("viem").RpcBlock & {
            calls: readonly {
                error?: {
                    data?: import("viem").Hex | undefined;
                    code: number;
                    message: string;
                } | undefined;
                logs?: readonly import("viem").RpcLog[] | undefined;
                gasUsed: import("viem").Hex;
                returnData: import("viem").Hex;
                status: import("viem").Hex;
            }[];
        })[];
    }, {
        Method: "eth_uninstallFilter";
        Parameters: [filterId: import("viem").Quantity];
        ReturnType: boolean;
    }, ...any[]], { [K in keyof client]: client[K]; } & import("viem").PublicActions<import("viem").HttpTransport<undefined, false>, {
        blockExplorers: {
            readonly default: {
                readonly name: "PolygonScan";
                readonly url: "https://polygonscan.com";
                readonly apiUrl: "https://api.etherscan.io/v2/api";
            };
        };
        blockTime: 2000;
        contracts: {
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 25770160;
            };
        };
        ensTlds?: readonly string[] | undefined;
        id: 137;
        name: "Polygon";
        nativeCurrency: {
            readonly name: "POL";
            readonly symbol: "POL";
            readonly decimals: 18;
        };
        experimental_preconfirmationTime?: number | undefined | undefined;
        rpcUrls: {
            readonly default: {
                readonly http: readonly ["https://polygon.drpc.org"];
            };
        };
        sourceId?: number | undefined | undefined;
        testnet?: boolean | undefined | undefined;
        custom?: Record<string, unknown> | undefined;
        extendSchema?: Record<string, unknown> | undefined;
        fees?: import("viem").ChainFees<undefined> | undefined;
        formatters?: undefined;
        prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
            phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
        }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
            runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
        }] | undefined;
        serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
        verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
    }>>;
};
export declare function getPolygonWalletClient(privateKey: `0x${string}`): {
    client: {
        account: {
            address: import("viem").Address;
            nonceManager?: import("viem").NonceManager | undefined;
            sign: ((parameters: {
                hash: import("viem").Hash;
            }) => Promise<import("viem").Hex>) | undefined;
            signAuthorization: ((parameters: import("viem").AuthorizationRequest) => Promise<import("viem/accounts").SignAuthorizationReturnType>) | undefined;
            signMessage: ({ message }: {
                message: import("viem").SignableMessage;
            }) => Promise<import("viem").Hex>;
            signTransaction: <serializer extends import("viem").SerializeTransactionFn<import("viem").TransactionSerializable> = import("viem").SerializeTransactionFn<import("viem").TransactionSerializable>, transaction extends Parameters<serializer>[0] = Parameters<serializer>[0]>(transaction: transaction, options?: {
                serializer?: serializer | undefined;
            } | undefined) => Promise<import("viem").Hex>;
            signTypedData: <const typedData extends import("viem").TypedData | Record<string, unknown>, primaryType extends keyof typedData | "EIP712Domain" = keyof typedData>(parameters: import("viem").TypedDataDefinition<typedData, primaryType>) => Promise<import("viem").Hex>;
            publicKey: import("viem").Hex;
            source: "privateKey";
            type: "local";
        };
        batch?: import("viem").ClientConfig["batch"] | undefined;
        cacheTime: number;
        ccipRead?: import("viem").ClientConfig["ccipRead"] | undefined;
        chain: {
            blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                    readonly apiUrl: "https://api.etherscan.io/v2/api";
                };
            };
            blockTime: 2000;
            contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 137;
            name: "Polygon";
            nativeCurrency: {
                readonly name: "POL";
                readonly symbol: "POL";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://polygon.drpc.org"];
                };
            };
            sourceId?: number | undefined | undefined;
            testnet?: boolean | undefined | undefined;
            custom?: Record<string, unknown> | undefined;
            extendSchema?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters?: undefined;
            prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
                runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
            }] | undefined;
            serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
            verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
        };
        dataSuffix?: import("viem").DataSuffix | undefined;
        experimental_blockTag?: import("viem").BlockTag | undefined;
        key: string;
        name: string;
        pollingInterval: number;
        request: import("viem").EIP1193RequestFn<[{
            Method: "eth_accounts";
            Parameters?: undefined;
            ReturnType: import("viem").Address[];
        }, {
            Method: "eth_chainId";
            Parameters?: undefined;
            ReturnType: import("viem").Quantity;
        }, {
            Method: "eth_estimateGas";
            Parameters: [transaction: import("viem").RpcTransactionRequest] | [transaction: import("viem").RpcTransactionRequest, block: import("viem").RpcBlockNumber | import("viem").BlockTag] | [transaction: import("viem").RpcTransactionRequest, block: import("viem").RpcBlockNumber | import("viem").BlockTag, stateOverride: import("viem").RpcStateOverride];
            ReturnType: import("viem").Quantity;
        }, {
            Method: "eth_fillTransaction";
            Parameters: [transaction: import("viem").RpcTransactionRequest];
            ReturnType: {
                capabilities?: Record<string, unknown> | undefined;
                raw: import("viem").Hex;
                tx: import("viem").RpcTransaction;
            };
        }, {
            Method: "eth_requestAccounts";
            Parameters?: undefined;
            ReturnType: import("viem").Address[];
        }, {
            Method: "eth_sendTransaction";
            Parameters: [transaction: import("viem").RpcTransactionRequest];
            ReturnType: import("viem").Hash;
        }, {
            Method: "eth_sendRawTransaction";
            Parameters: [signedTransaction: import("viem").Hex];
            ReturnType: import("viem").Hash;
        }, {
            Method: "eth_sendRawTransactionSync";
            Parameters: [signedTransaction: import("viem").Hex] | [signedTransaction: import("viem").Hex, timeout: number];
            ReturnType: import("viem").RpcTransactionReceipt;
        }, {
            Method: "eth_sign";
            Parameters: [address: import("viem").Address, data: import("viem").Hex];
            ReturnType: import("viem").Hex;
        }, {
            Method: "eth_signTransaction";
            Parameters: [request: import("viem").RpcTransactionRequest];
            ReturnType: import("viem").Hex;
        }, {
            Method: "eth_signTypedData_v4";
            Parameters: [address: import("viem").Address, message: string];
            ReturnType: import("viem").Hex;
        }, {
            Method: "eth_syncing";
            Parameters?: undefined;
            ReturnType: import("viem").NetworkSync | false;
        }, {
            Method: "personal_sign";
            Parameters: [data: import("viem").Hex, address: import("viem").Address];
            ReturnType: import("viem").Hex;
        }, {
            Method: "wallet_addEthereumChain";
            Parameters: [chain: import("viem").AddEthereumChainParameter];
            ReturnType: null;
        }, {
            Method: "wallet_addSubAccount";
            Parameters: [{
                account: import("viem").OneOf<{
                    keys: readonly {
                        publicKey: import("viem").Hex;
                        type: "address" | "p256" | "webcrypto-p256" | "webauthn-p256";
                    }[];
                    type: "create";
                } | {
                    address: import("viem").Address;
                    chainId?: number | undefined;
                    type: "deployed";
                } | {
                    address: import("viem").Address;
                    chainId?: number | undefined;
                    factory: import("viem").Address;
                    factoryData: import("viem").Hex;
                    type: "undeployed";
                }>;
                version: string;
            }];
            ReturnType: {
                address: import("viem").Address;
                factory?: import("viem").Address | undefined;
                factoryData?: import("viem").Hex | undefined;
            };
        }, {
            Method: "wallet_connect";
            Parameters: [{
                capabilities?: import("viem").Capabilities | undefined;
                version: string;
            }];
            ReturnType: {
                accounts: readonly {
                    address: import("viem").Address;
                    capabilities?: import("viem").Capabilities | undefined;
                }[];
            };
        }, {
            Method: "wallet_disconnect";
            Parameters?: undefined;
            ReturnType: void;
        }, {
            Method: "wallet_getAssets";
            Parameters?: [import("viem").WalletGetAssetsParameters];
            ReturnType: import("viem").WalletGetAssetsReturnType;
        }, {
            Method: "wallet_getCallsStatus";
            Parameters?: [string];
            ReturnType: import("viem").WalletGetCallsStatusReturnType;
        }, {
            Method: "wallet_getCapabilities";
            Parameters?: readonly [] | readonly [import("viem").Address | undefined] | readonly [import("viem").Address | undefined, readonly import("viem").Hex[] | undefined] | undefined;
            ReturnType: import("viem").Prettify<import("viem").WalletCapabilitiesRecord>;
        }, {
            Method: "wallet_getPermissions";
            Parameters?: undefined;
            ReturnType: import("viem").WalletPermission[];
        }, {
            Method: "wallet_grantPermissions";
            Parameters?: [import("viem").WalletGrantPermissionsParameters];
            ReturnType: import("viem").Prettify<import("viem").WalletGrantPermissionsReturnType>;
        }, {
            Method: "wallet_requestPermissions";
            Parameters: [permissions: {
                eth_accounts: Record<string, any>;
            }];
            ReturnType: import("viem").WalletPermission[];
        }, {
            Method: "wallet_revokePermissions";
            Parameters: [permissions: {
                eth_accounts: Record<string, any>;
            }];
            ReturnType: null;
        }, {
            Method: "wallet_sendCalls";
            Parameters?: import("viem").WalletSendCallsParameters;
            ReturnType: import("viem").WalletSendCallsReturnType;
        }, {
            Method: "wallet_sendTransaction";
            Parameters: [transaction: import("viem").RpcTransactionRequest];
            ReturnType: import("viem").Hash;
        }, {
            Method: "wallet_showCallsStatus";
            Parameters?: [string];
            ReturnType: void;
        }, {
            Method: "wallet_switchEthereumChain";
            Parameters: [chain: {
                chainId: string;
            }];
            ReturnType: null;
        }, {
            Method: "wallet_watchAsset";
            Parameters: import("viem").WatchAssetParams;
            ReturnType: boolean;
        }, ...any[]]>;
        transport: import("viem").TransportConfig<"http", import("viem").EIP1193RequestFn> & {
            fetchOptions?: import("viem").HttpTransportConfig["fetchOptions"] | undefined;
            url?: string | undefined;
        };
        type: string;
        uid: string;
        addChain: (args: import("viem").AddChainParameters) => Promise<void>;
        deployContract: <const abi extends import("viem").Abi | readonly unknown[], chainOverride extends import("viem").Chain | undefined>(args: import("viem").DeployContractParameters<abi, {
            blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                    readonly apiUrl: "https://api.etherscan.io/v2/api";
                };
            };
            blockTime: 2000;
            contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 137;
            name: "Polygon";
            nativeCurrency: {
                readonly name: "POL";
                readonly symbol: "POL";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://polygon.drpc.org"];
                };
            };
            sourceId?: number | undefined | undefined;
            testnet?: boolean | undefined | undefined;
            custom?: Record<string, unknown> | undefined;
            extendSchema?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters?: undefined;
            prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
                runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
            }] | undefined;
            serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
            verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
        }, {
            address: import("viem").Address;
            nonceManager?: import("viem").NonceManager | undefined;
            sign: ((parameters: {
                hash: import("viem").Hash;
            }) => Promise<import("viem").Hex>) | undefined;
            signAuthorization: ((parameters: import("viem").AuthorizationRequest) => Promise<import("viem/accounts").SignAuthorizationReturnType>) | undefined;
            signMessage: ({ message }: {
                message: import("viem").SignableMessage;
            }) => Promise<import("viem").Hex>;
            signTransaction: <serializer extends import("viem").SerializeTransactionFn<import("viem").TransactionSerializable> = import("viem").SerializeTransactionFn<import("viem").TransactionSerializable>, transaction extends Parameters<serializer>[0] = Parameters<serializer>[0]>(transaction: transaction, options?: {
                serializer?: serializer | undefined;
            } | undefined) => Promise<import("viem").Hex>;
            signTypedData: <const typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } | Record<string, unknown>, primaryType extends keyof typedData | "EIP712Domain" = keyof typedData>(parameters: import("viem").TypedDataDefinition<typedData, primaryType, typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } ? keyof typedData : string>) => Promise<import("viem").Hex>;
            publicKey: import("viem").Hex;
            source: "privateKey";
            type: "local";
        }, chainOverride>) => Promise<import("viem").DeployContractReturnType>;
        fillTransaction: <chainOverride extends import("viem").Chain | undefined = undefined, accountOverride extends import("viem").Account | import("viem").Address | undefined = undefined>(args: import("viem").FillTransactionParameters<{
            blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                    readonly apiUrl: "https://api.etherscan.io/v2/api";
                };
            };
            blockTime: 2000;
            contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 137;
            name: "Polygon";
            nativeCurrency: {
                readonly name: "POL";
                readonly symbol: "POL";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://polygon.drpc.org"];
                };
            };
            sourceId?: number | undefined | undefined;
            testnet?: boolean | undefined | undefined;
            custom?: Record<string, unknown> | undefined;
            extendSchema?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters?: undefined;
            prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
                runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
            }] | undefined;
            serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
            verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
        }, {
            address: import("viem").Address;
            nonceManager?: import("viem").NonceManager | undefined;
            sign: ((parameters: {
                hash: import("viem").Hash;
            }) => Promise<import("viem").Hex>) | undefined;
            signAuthorization: ((parameters: import("viem").AuthorizationRequest) => Promise<import("viem/accounts").SignAuthorizationReturnType>) | undefined;
            signMessage: ({ message }: {
                message: import("viem").SignableMessage;
            }) => Promise<import("viem").Hex>;
            signTransaction: <serializer extends import("viem").SerializeTransactionFn<import("viem").TransactionSerializable> = import("viem").SerializeTransactionFn<import("viem").TransactionSerializable>, transaction extends Parameters<serializer>[0] = Parameters<serializer>[0]>(transaction: transaction, options?: {
                serializer?: serializer | undefined;
            } | undefined) => Promise<import("viem").Hex>;
            signTypedData: <const typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } | Record<string, unknown>, primaryType extends keyof typedData | "EIP712Domain" = keyof typedData>(parameters: import("viem").TypedDataDefinition<typedData, primaryType, typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } ? keyof typedData : string>) => Promise<import("viem").Hex>;
            publicKey: import("viem").Hex;
            source: "privateKey";
            type: "local";
        }, chainOverride, accountOverride>) => Promise<import("viem").FillTransactionReturnType<{
            blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                    readonly apiUrl: "https://api.etherscan.io/v2/api";
                };
            };
            blockTime: 2000;
            contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 137;
            name: "Polygon";
            nativeCurrency: {
                readonly name: "POL";
                readonly symbol: "POL";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://polygon.drpc.org"];
                };
            };
            sourceId?: number | undefined | undefined;
            testnet?: boolean | undefined | undefined;
            custom?: Record<string, unknown> | undefined;
            extendSchema?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters?: undefined;
            prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
                runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
            }] | undefined;
            serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
            verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
        }, chainOverride>>;
        getAddresses: () => Promise<import("viem").GetAddressesReturnType>;
        getCallsStatus: (parameters: import("viem").GetCallsStatusParameters) => Promise<import("viem").GetCallsStatusReturnType>;
        getCapabilities: <chainId extends number | undefined>(parameters?: import("viem").GetCapabilitiesParameters<chainId>) => Promise<import("viem").GetCapabilitiesReturnType<chainId>>;
        getChainId: () => Promise<import("viem").GetChainIdReturnType>;
        getPermissions: () => Promise<import("viem").GetPermissionsReturnType>;
        prepareAuthorization: (parameters: import("viem").PrepareAuthorizationParameters<{
            address: import("viem").Address;
            nonceManager?: import("viem").NonceManager | undefined;
            sign: ((parameters: {
                hash: import("viem").Hash;
            }) => Promise<import("viem").Hex>) | undefined;
            signAuthorization: ((parameters: import("viem").AuthorizationRequest) => Promise<import("viem/accounts").SignAuthorizationReturnType>) | undefined;
            signMessage: ({ message }: {
                message: import("viem").SignableMessage;
            }) => Promise<import("viem").Hex>;
            signTransaction: <serializer extends import("viem").SerializeTransactionFn<import("viem").TransactionSerializable> = import("viem").SerializeTransactionFn<import("viem").TransactionSerializable>, transaction extends Parameters<serializer>[0] = Parameters<serializer>[0]>(transaction: transaction, options?: {
                serializer?: serializer | undefined;
            } | undefined) => Promise<import("viem").Hex>;
            signTypedData: <const typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } | Record<string, unknown>, primaryType extends keyof typedData | "EIP712Domain" = keyof typedData>(parameters: import("viem").TypedDataDefinition<typedData, primaryType, typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } ? keyof typedData : string>) => Promise<import("viem").Hex>;
            publicKey: import("viem").Hex;
            source: "privateKey";
            type: "local";
        }>) => Promise<import("viem").PrepareAuthorizationReturnType>;
        prepareTransactionRequest: <const request extends import("viem").PrepareTransactionRequestRequest<{
            blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                    readonly apiUrl: "https://api.etherscan.io/v2/api";
                };
            };
            blockTime: 2000;
            contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 137;
            name: "Polygon";
            nativeCurrency: {
                readonly name: "POL";
                readonly symbol: "POL";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://polygon.drpc.org"];
                };
            };
            sourceId?: number | undefined | undefined;
            testnet?: boolean | undefined | undefined;
            custom?: Record<string, unknown> | undefined;
            extendSchema?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters?: undefined;
            prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
                runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
            }] | undefined;
            serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
            verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
        }, chainOverride>, chainOverride extends import("viem").Chain | undefined = undefined, accountOverride extends import("viem").Account | import("viem").Address | undefined = undefined>(args: import("viem").PrepareTransactionRequestParameters<{
            blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                    readonly apiUrl: "https://api.etherscan.io/v2/api";
                };
            };
            blockTime: 2000;
            contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 137;
            name: "Polygon";
            nativeCurrency: {
                readonly name: "POL";
                readonly symbol: "POL";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://polygon.drpc.org"];
                };
            };
            sourceId?: number | undefined | undefined;
            testnet?: boolean | undefined | undefined;
            custom?: Record<string, unknown> | undefined;
            extendSchema?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters?: undefined;
            prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
                runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
            }] | undefined;
            serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
            verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
        }, {
            address: import("viem").Address;
            nonceManager?: import("viem").NonceManager | undefined;
            sign: ((parameters: {
                hash: import("viem").Hash;
            }) => Promise<import("viem").Hex>) | undefined;
            signAuthorization: ((parameters: import("viem").AuthorizationRequest) => Promise<import("viem/accounts").SignAuthorizationReturnType>) | undefined;
            signMessage: ({ message }: {
                message: import("viem").SignableMessage;
            }) => Promise<import("viem").Hex>;
            signTransaction: <serializer extends import("viem").SerializeTransactionFn<import("viem").TransactionSerializable> = import("viem").SerializeTransactionFn<import("viem").TransactionSerializable>, transaction extends Parameters<serializer>[0] = Parameters<serializer>[0]>(transaction: transaction, options?: {
                serializer?: serializer | undefined;
            } | undefined) => Promise<import("viem").Hex>;
            signTypedData: <const typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } | Record<string, unknown>, primaryType extends keyof typedData | "EIP712Domain" = keyof typedData>(parameters: import("viem").TypedDataDefinition<typedData, primaryType, typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } ? keyof typedData : string>) => Promise<import("viem").Hex>;
            publicKey: import("viem").Hex;
            source: "privateKey";
            type: "local";
        }, chainOverride, accountOverride, request>) => Promise<import("viem").UnionRequiredBy<Extract<import("viem").UnionOmit<import("viem").ExtractChainFormatterParameters<import("viem").DeriveChain<{
            blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                    readonly apiUrl: "https://api.etherscan.io/v2/api";
                };
            };
            blockTime: 2000;
            contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 137;
            name: "Polygon";
            nativeCurrency: {
                readonly name: "POL";
                readonly symbol: "POL";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://polygon.drpc.org"];
                };
            };
            sourceId?: number | undefined | undefined;
            testnet?: boolean | undefined | undefined;
            custom?: Record<string, unknown> | undefined;
            extendSchema?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters?: undefined;
            prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
                runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
            }] | undefined;
            serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
            verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
        }, chainOverride>, "transactionRequest", import("viem").TransactionRequest>, "from"> & (import("viem").DeriveChain<{
            blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                    readonly apiUrl: "https://api.etherscan.io/v2/api";
                };
            };
            blockTime: 2000;
            contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 137;
            name: "Polygon";
            nativeCurrency: {
                readonly name: "POL";
                readonly symbol: "POL";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://polygon.drpc.org"];
                };
            };
            sourceId?: number | undefined | undefined;
            testnet?: boolean | undefined | undefined;
            custom?: Record<string, unknown> | undefined;
            extendSchema?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters?: undefined;
            prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
                runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
            }] | undefined;
            serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
            verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
        }, chainOverride> extends infer T_1 ? T_1 extends import("viem").DeriveChain<{
            blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                    readonly apiUrl: "https://api.etherscan.io/v2/api";
                };
            };
            blockTime: 2000;
            contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 137;
            name: "Polygon";
            nativeCurrency: {
                readonly name: "POL";
                readonly symbol: "POL";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://polygon.drpc.org"];
                };
            };
            sourceId?: number | undefined | undefined;
            testnet?: boolean | undefined | undefined;
            custom?: Record<string, unknown> | undefined;
            extendSchema?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters?: undefined;
            prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
                runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
            }] | undefined;
            serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
            verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
        }, chainOverride> ? T_1 extends import("viem").Chain ? {
            chain: T_1;
        } : {
            chain?: undefined;
        } : never : never) & (import("viem").DeriveAccount<{
            address: import("viem").Address;
            nonceManager?: import("viem").NonceManager | undefined;
            sign: ((parameters: {
                hash: import("viem").Hash;
            }) => Promise<import("viem").Hex>) | undefined;
            signAuthorization: ((parameters: import("viem").AuthorizationRequest) => Promise<import("viem/accounts").SignAuthorizationReturnType>) | undefined;
            signMessage: ({ message }: {
                message: import("viem").SignableMessage;
            }) => Promise<import("viem").Hex>;
            signTransaction: <serializer extends import("viem").SerializeTransactionFn<import("viem").TransactionSerializable> = import("viem").SerializeTransactionFn<import("viem").TransactionSerializable>, transaction extends Parameters<serializer>[0] = Parameters<serializer>[0]>(transaction: transaction, options?: {
                serializer?: serializer | undefined;
            } | undefined) => Promise<import("viem").Hex>;
            signTypedData: <const typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } | Record<string, unknown>, primaryType extends keyof typedData | "EIP712Domain" = keyof typedData>(parameters: import("viem").TypedDataDefinition<typedData, primaryType, typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } ? keyof typedData : string>) => Promise<import("viem").Hex>;
            publicKey: import("viem").Hex;
            source: "privateKey";
            type: "local";
        }, accountOverride> extends infer T_2 ? T_2 extends import("viem").DeriveAccount<{
            address: import("viem").Address;
            nonceManager?: import("viem").NonceManager | undefined;
            sign: ((parameters: {
                hash: import("viem").Hash;
            }) => Promise<import("viem").Hex>) | undefined;
            signAuthorization: ((parameters: import("viem").AuthorizationRequest) => Promise<import("viem/accounts").SignAuthorizationReturnType>) | undefined;
            signMessage: ({ message }: {
                message: import("viem").SignableMessage;
            }) => Promise<import("viem").Hex>;
            signTransaction: <serializer extends import("viem").SerializeTransactionFn<import("viem").TransactionSerializable> = import("viem").SerializeTransactionFn<import("viem").TransactionSerializable>, transaction extends Parameters<serializer>[0] = Parameters<serializer>[0]>(transaction: transaction, options?: {
                serializer?: serializer | undefined;
            } | undefined) => Promise<import("viem").Hex>;
            signTypedData: <const typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } | Record<string, unknown>, primaryType extends keyof typedData | "EIP712Domain" = keyof typedData>(parameters: import("viem").TypedDataDefinition<typedData, primaryType, typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } ? keyof typedData : string>) => Promise<import("viem").Hex>;
            publicKey: import("viem").Hex;
            source: "privateKey";
            type: "local";
        }, accountOverride> ? T_2 extends import("viem").Account ? {
            account: T_2;
            from: import("viem").Address;
        } : {
            account?: undefined;
            from?: undefined;
        } : never : never), import("viem").IsNever<((request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) extends infer T_3 ? T_3 extends (request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) ? T_3 extends "legacy" ? import("viem").TransactionRequestLegacy : never : never : never) | ((request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) extends infer T_4 ? T_4 extends (request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) ? T_4 extends "eip1559" ? import("viem").TransactionRequestEIP1559 : never : never : never) | ((request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) extends infer T_5 ? T_5 extends (request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) ? T_5 extends "eip2930" ? import("viem").TransactionRequestEIP2930 : never : never : never) | ((request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) extends infer T_6 ? T_6 extends (request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) ? T_6 extends "eip4844" ? import("viem").TransactionRequestEIP4844 : never : never : never) | ((request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) extends infer T_7 ? T_7 extends (request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) ? T_7 extends "eip7702" ? import("viem").TransactionRequestEIP7702 : never : never : never)> extends true ? unknown : import("viem").ExactPartial<((request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) extends infer T_8 ? T_8 extends (request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) ? T_8 extends "legacy" ? import("viem").TransactionRequestLegacy : never : never : never) | ((request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) extends infer T_9 ? T_9 extends (request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) ? T_9 extends "eip1559" ? import("viem").TransactionRequestEIP1559 : never : never : never) | ((request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) extends infer T_10 ? T_10 extends (request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) ? T_10 extends "eip2930" ? import("viem").TransactionRequestEIP2930 : never : never : never) | ((request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) extends infer T_11 ? T_11 extends (request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) ? T_11 extends "eip4844" ? import("viem").TransactionRequestEIP4844 : never : never : never) | ((request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) extends infer T_12 ? T_12 extends (request["type"] extends string ? request["type"] : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends "legacy" ? unknown : import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>) ? T_12 extends "eip7702" ? import("viem").TransactionRequestEIP7702 : never : never : never)>> & {
            chainId?: number | undefined;
        }, (request["parameters"] extends readonly import("viem").PrepareTransactionRequestParameterType[] ? request["parameters"][number] : "type" | "nonce" | "chainId" | "fees" | "gas" | "blobVersionedHashes") extends infer T_13 ? T_13 extends (request["parameters"] extends readonly import("viem").PrepareTransactionRequestParameterType[] ? request["parameters"][number] : "type" | "nonce" | "chainId" | "fees" | "gas" | "blobVersionedHashes") ? T_13 extends "fees" ? "gasPrice" | "maxFeePerGas" | "maxPriorityFeePerGas" : T_13 : never : never> & (unknown extends request["kzg"] ? {} : Pick<request, "kzg">) & {
            _capabilities?: {
                [x: string]: any;
            };
        } extends infer T ? { [K in keyof T]: T[K]; } : never>;
        requestAddresses: () => Promise<import("viem").RequestAddressesReturnType>;
        requestPermissions: (args: import("viem").RequestPermissionsParameters) => Promise<import("viem").RequestPermissionsReturnType>;
        sendCalls: <const calls extends readonly unknown[], chainOverride extends import("viem").Chain | undefined = undefined>(parameters: import("viem").SendCallsParameters<{
            blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                    readonly apiUrl: "https://api.etherscan.io/v2/api";
                };
            };
            blockTime: 2000;
            contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 137;
            name: "Polygon";
            nativeCurrency: {
                readonly name: "POL";
                readonly symbol: "POL";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://polygon.drpc.org"];
                };
            };
            sourceId?: number | undefined | undefined;
            testnet?: boolean | undefined | undefined;
            custom?: Record<string, unknown> | undefined;
            extendSchema?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters?: undefined;
            prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
                runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
            }] | undefined;
            serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
            verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
        }, {
            address: import("viem").Address;
            nonceManager?: import("viem").NonceManager | undefined;
            sign: ((parameters: {
                hash: import("viem").Hash;
            }) => Promise<import("viem").Hex>) | undefined;
            signAuthorization: ((parameters: import("viem").AuthorizationRequest) => Promise<import("viem/accounts").SignAuthorizationReturnType>) | undefined;
            signMessage: ({ message }: {
                message: import("viem").SignableMessage;
            }) => Promise<import("viem").Hex>;
            signTransaction: <serializer extends import("viem").SerializeTransactionFn<import("viem").TransactionSerializable> = import("viem").SerializeTransactionFn<import("viem").TransactionSerializable>, transaction extends Parameters<serializer>[0] = Parameters<serializer>[0]>(transaction: transaction, options?: {
                serializer?: serializer | undefined;
            } | undefined) => Promise<import("viem").Hex>;
            signTypedData: <const typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } | Record<string, unknown>, primaryType extends keyof typedData | "EIP712Domain" = keyof typedData>(parameters: import("viem").TypedDataDefinition<typedData, primaryType, typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } ? keyof typedData : string>) => Promise<import("viem").Hex>;
            publicKey: import("viem").Hex;
            source: "privateKey";
            type: "local";
        }, chainOverride, calls>) => Promise<{
            capabilities?: {
                [x: string]: any;
            };
            id: string;
        }>;
        sendCallsSync: <const calls extends readonly unknown[], chainOverride extends import("viem").Chain | undefined = undefined>(parameters: import("viem").SendCallsSyncParameters<{
            blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                    readonly apiUrl: "https://api.etherscan.io/v2/api";
                };
            };
            blockTime: 2000;
            contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 137;
            name: "Polygon";
            nativeCurrency: {
                readonly name: "POL";
                readonly symbol: "POL";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://polygon.drpc.org"];
                };
            };
            sourceId?: number | undefined | undefined;
            testnet?: boolean | undefined | undefined;
            custom?: Record<string, unknown> | undefined;
            extendSchema?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters?: undefined;
            prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
                runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
            }] | undefined;
            serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
            verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
        }, {
            address: import("viem").Address;
            nonceManager?: import("viem").NonceManager | undefined;
            sign: ((parameters: {
                hash: import("viem").Hash;
            }) => Promise<import("viem").Hex>) | undefined;
            signAuthorization: ((parameters: import("viem").AuthorizationRequest) => Promise<import("viem/accounts").SignAuthorizationReturnType>) | undefined;
            signMessage: ({ message }: {
                message: import("viem").SignableMessage;
            }) => Promise<import("viem").Hex>;
            signTransaction: <serializer extends import("viem").SerializeTransactionFn<import("viem").TransactionSerializable> = import("viem").SerializeTransactionFn<import("viem").TransactionSerializable>, transaction extends Parameters<serializer>[0] = Parameters<serializer>[0]>(transaction: transaction, options?: {
                serializer?: serializer | undefined;
            } | undefined) => Promise<import("viem").Hex>;
            signTypedData: <const typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } | Record<string, unknown>, primaryType extends keyof typedData | "EIP712Domain" = keyof typedData>(parameters: import("viem").TypedDataDefinition<typedData, primaryType, typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } ? keyof typedData : string>) => Promise<import("viem").Hex>;
            publicKey: import("viem").Hex;
            source: "privateKey";
            type: "local";
        }, chainOverride, calls>) => Promise<{
            version: string;
            id: string;
            chainId: number;
            atomic: boolean;
            capabilities?: {
                [key: string]: any;
            } | {
                [x: string]: any;
            };
            receipts?: import("viem").WalletCallReceipt<bigint, "success" | "reverted">[];
            statusCode: number;
            status: "pending" | "success" | "failure" | undefined;
        }>;
        sendRawTransaction: (args: import("viem").SendRawTransactionParameters) => Promise<import("viem").SendRawTransactionReturnType>;
        sendRawTransactionSync: (args: import("viem").SendRawTransactionSyncParameters) => Promise<import("viem").TransactionReceipt>;
        sendTransaction: <const request extends import("viem").SendTransactionRequest<{
            blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                    readonly apiUrl: "https://api.etherscan.io/v2/api";
                };
            };
            blockTime: 2000;
            contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 137;
            name: "Polygon";
            nativeCurrency: {
                readonly name: "POL";
                readonly symbol: "POL";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://polygon.drpc.org"];
                };
            };
            sourceId?: number | undefined | undefined;
            testnet?: boolean | undefined | undefined;
            custom?: Record<string, unknown> | undefined;
            extendSchema?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters?: undefined;
            prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
                runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
            }] | undefined;
            serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
            verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
        }, chainOverride>, chainOverride extends import("viem").Chain | undefined = undefined>(args: import("viem").SendTransactionParameters<{
            blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                    readonly apiUrl: "https://api.etherscan.io/v2/api";
                };
            };
            blockTime: 2000;
            contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 137;
            name: "Polygon";
            nativeCurrency: {
                readonly name: "POL";
                readonly symbol: "POL";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://polygon.drpc.org"];
                };
            };
            sourceId?: number | undefined | undefined;
            testnet?: boolean | undefined | undefined;
            custom?: Record<string, unknown> | undefined;
            extendSchema?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters?: undefined;
            prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
                runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
            }] | undefined;
            serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
            verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
        }, {
            address: import("viem").Address;
            nonceManager?: import("viem").NonceManager | undefined;
            sign: ((parameters: {
                hash: import("viem").Hash;
            }) => Promise<import("viem").Hex>) | undefined;
            signAuthorization: ((parameters: import("viem").AuthorizationRequest) => Promise<import("viem/accounts").SignAuthorizationReturnType>) | undefined;
            signMessage: ({ message }: {
                message: import("viem").SignableMessage;
            }) => Promise<import("viem").Hex>;
            signTransaction: <serializer extends import("viem").SerializeTransactionFn<import("viem").TransactionSerializable> = import("viem").SerializeTransactionFn<import("viem").TransactionSerializable>, transaction extends Parameters<serializer>[0] = Parameters<serializer>[0]>(transaction: transaction, options?: {
                serializer?: serializer | undefined;
            } | undefined) => Promise<import("viem").Hex>;
            signTypedData: <const typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } | Record<string, unknown>, primaryType extends keyof typedData | "EIP712Domain" = keyof typedData>(parameters: import("viem").TypedDataDefinition<typedData, primaryType, typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } ? keyof typedData : string>) => Promise<import("viem").Hex>;
            publicKey: import("viem").Hex;
            source: "privateKey";
            type: "local";
        }, chainOverride, request>) => Promise<import("viem").SendTransactionReturnType>;
        sendTransactionSync: <const request extends import("viem").SendTransactionSyncRequest<{
            blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                    readonly apiUrl: "https://api.etherscan.io/v2/api";
                };
            };
            blockTime: 2000;
            contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 137;
            name: "Polygon";
            nativeCurrency: {
                readonly name: "POL";
                readonly symbol: "POL";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://polygon.drpc.org"];
                };
            };
            sourceId?: number | undefined | undefined;
            testnet?: boolean | undefined | undefined;
            custom?: Record<string, unknown> | undefined;
            extendSchema?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters?: undefined;
            prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
                runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
            }] | undefined;
            serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
            verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
        }, chainOverride>, chainOverride extends import("viem").Chain | undefined = undefined>(args: import("viem").SendTransactionSyncParameters<{
            blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                    readonly apiUrl: "https://api.etherscan.io/v2/api";
                };
            };
            blockTime: 2000;
            contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 137;
            name: "Polygon";
            nativeCurrency: {
                readonly name: "POL";
                readonly symbol: "POL";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://polygon.drpc.org"];
                };
            };
            sourceId?: number | undefined | undefined;
            testnet?: boolean | undefined | undefined;
            custom?: Record<string, unknown> | undefined;
            extendSchema?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters?: undefined;
            prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
                runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
            }] | undefined;
            serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
            verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
        }, {
            address: import("viem").Address;
            nonceManager?: import("viem").NonceManager | undefined;
            sign: ((parameters: {
                hash: import("viem").Hash;
            }) => Promise<import("viem").Hex>) | undefined;
            signAuthorization: ((parameters: import("viem").AuthorizationRequest) => Promise<import("viem/accounts").SignAuthorizationReturnType>) | undefined;
            signMessage: ({ message }: {
                message: import("viem").SignableMessage;
            }) => Promise<import("viem").Hex>;
            signTransaction: <serializer extends import("viem").SerializeTransactionFn<import("viem").TransactionSerializable> = import("viem").SerializeTransactionFn<import("viem").TransactionSerializable>, transaction extends Parameters<serializer>[0] = Parameters<serializer>[0]>(transaction: transaction, options?: {
                serializer?: serializer | undefined;
            } | undefined) => Promise<import("viem").Hex>;
            signTypedData: <const typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } | Record<string, unknown>, primaryType extends keyof typedData | "EIP712Domain" = keyof typedData>(parameters: import("viem").TypedDataDefinition<typedData, primaryType, typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } ? keyof typedData : string>) => Promise<import("viem").Hex>;
            publicKey: import("viem").Hex;
            source: "privateKey";
            type: "local";
        }, chainOverride, request>) => Promise<import("viem").TransactionReceipt>;
        showCallsStatus: (parameters: import("viem").ShowCallsStatusParameters) => Promise<import("viem").ShowCallsStatusReturnType>;
        signAuthorization: (parameters: import("viem").SignAuthorizationParameters<{
            address: import("viem").Address;
            nonceManager?: import("viem").NonceManager | undefined;
            sign: ((parameters: {
                hash: import("viem").Hash;
            }) => Promise<import("viem").Hex>) | undefined;
            signAuthorization: ((parameters: import("viem").AuthorizationRequest) => Promise<import("viem/accounts").SignAuthorizationReturnType>) | undefined;
            signMessage: ({ message }: {
                message: import("viem").SignableMessage;
            }) => Promise<import("viem").Hex>;
            signTransaction: <serializer extends import("viem").SerializeTransactionFn<import("viem").TransactionSerializable> = import("viem").SerializeTransactionFn<import("viem").TransactionSerializable>, transaction extends Parameters<serializer>[0] = Parameters<serializer>[0]>(transaction: transaction, options?: {
                serializer?: serializer | undefined;
            } | undefined) => Promise<import("viem").Hex>;
            signTypedData: <const typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } | Record<string, unknown>, primaryType extends keyof typedData | "EIP712Domain" = keyof typedData>(parameters: import("viem").TypedDataDefinition<typedData, primaryType, typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } ? keyof typedData : string>) => Promise<import("viem").Hex>;
            publicKey: import("viem").Hex;
            source: "privateKey";
            type: "local";
        }>) => Promise<import("viem").SignAuthorizationReturnType>;
        signMessage: (args: import("viem").SignMessageParameters<{
            address: import("viem").Address;
            nonceManager?: import("viem").NonceManager | undefined;
            sign: ((parameters: {
                hash: import("viem").Hash;
            }) => Promise<import("viem").Hex>) | undefined;
            signAuthorization: ((parameters: import("viem").AuthorizationRequest) => Promise<import("viem/accounts").SignAuthorizationReturnType>) | undefined;
            signMessage: ({ message }: {
                message: import("viem").SignableMessage;
            }) => Promise<import("viem").Hex>;
            signTransaction: <serializer extends import("viem").SerializeTransactionFn<import("viem").TransactionSerializable> = import("viem").SerializeTransactionFn<import("viem").TransactionSerializable>, transaction extends Parameters<serializer>[0] = Parameters<serializer>[0]>(transaction: transaction, options?: {
                serializer?: serializer | undefined;
            } | undefined) => Promise<import("viem").Hex>;
            signTypedData: <const typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } | Record<string, unknown>, primaryType extends keyof typedData | "EIP712Domain" = keyof typedData>(parameters: import("viem").TypedDataDefinition<typedData, primaryType, typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } ? keyof typedData : string>) => Promise<import("viem").Hex>;
            publicKey: import("viem").Hex;
            source: "privateKey";
            type: "local";
        }>) => Promise<import("viem").SignMessageReturnType>;
        signTransaction: <chainOverride extends import("viem").Chain | undefined, const request extends import("viem").UnionOmit<import("viem").ExtractChainFormatterParameters<import("viem").DeriveChain<{
            blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                    readonly apiUrl: "https://api.etherscan.io/v2/api";
                };
            };
            blockTime: 2000;
            contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 137;
            name: "Polygon";
            nativeCurrency: {
                readonly name: "POL";
                readonly symbol: "POL";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://polygon.drpc.org"];
                };
            };
            sourceId?: number | undefined | undefined;
            testnet?: boolean | undefined | undefined;
            custom?: Record<string, unknown> | undefined;
            extendSchema?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters?: undefined;
            prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
                runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
            }] | undefined;
            serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
            verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
        }, chainOverride>, "transactionRequest", import("viem").TransactionRequest>, "from"> = import("viem").UnionOmit<import("viem").ExtractChainFormatterParameters<import("viem").DeriveChain<{
            blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                    readonly apiUrl: "https://api.etherscan.io/v2/api";
                };
            };
            blockTime: 2000;
            contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 137;
            name: "Polygon";
            nativeCurrency: {
                readonly name: "POL";
                readonly symbol: "POL";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://polygon.drpc.org"];
                };
            };
            sourceId?: number | undefined | undefined;
            testnet?: boolean | undefined | undefined;
            custom?: Record<string, unknown> | undefined;
            extendSchema?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters?: undefined;
            prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
                runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
            }] | undefined;
            serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
            verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
        }, chainOverride>, "transactionRequest", import("viem").TransactionRequest>, "from">>(args: import("viem").SignTransactionParameters<{
            blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                    readonly apiUrl: "https://api.etherscan.io/v2/api";
                };
            };
            blockTime: 2000;
            contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 137;
            name: "Polygon";
            nativeCurrency: {
                readonly name: "POL";
                readonly symbol: "POL";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://polygon.drpc.org"];
                };
            };
            sourceId?: number | undefined | undefined;
            testnet?: boolean | undefined | undefined;
            custom?: Record<string, unknown> | undefined;
            extendSchema?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters?: undefined;
            prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
                runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
            }] | undefined;
            serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
            verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
        }, {
            address: import("viem").Address;
            nonceManager?: import("viem").NonceManager | undefined;
            sign: ((parameters: {
                hash: import("viem").Hash;
            }) => Promise<import("viem").Hex>) | undefined;
            signAuthorization: ((parameters: import("viem").AuthorizationRequest) => Promise<import("viem/accounts").SignAuthorizationReturnType>) | undefined;
            signMessage: ({ message }: {
                message: import("viem").SignableMessage;
            }) => Promise<import("viem").Hex>;
            signTransaction: <serializer extends import("viem").SerializeTransactionFn<import("viem").TransactionSerializable> = import("viem").SerializeTransactionFn<import("viem").TransactionSerializable>, transaction extends Parameters<serializer>[0] = Parameters<serializer>[0]>(transaction: transaction, options?: {
                serializer?: serializer | undefined;
            } | undefined) => Promise<import("viem").Hex>;
            signTypedData: <const typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } | Record<string, unknown>, primaryType extends keyof typedData | "EIP712Domain" = keyof typedData>(parameters: import("viem").TypedDataDefinition<typedData, primaryType, typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } ? keyof typedData : string>) => Promise<import("viem").Hex>;
            publicKey: import("viem").Hex;
            source: "privateKey";
            type: "local";
        }, chainOverride, request>) => Promise<import("viem").TransactionSerialized<import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)>, (import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends infer T ? T extends import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> ? T extends "eip1559" ? `0x02${string}` : never : never : never) | (import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends infer T_1 ? T_1 extends import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> ? T_1 extends "eip2930" ? `0x01${string}` : never : never : never) | (import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends infer T_2 ? T_2 extends import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> ? T_2 extends "eip4844" ? `0x03${string}` : never : never : never) | (import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends infer T_3 ? T_3 extends import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> ? T_3 extends "eip7702" ? `0x04${string}` : never : never : never) | (import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> extends infer T_4 ? T_4 extends import("viem").GetTransactionType<request, (request extends {
            accessList?: undefined;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
        } & import("viem").FeeValuesLegacy ? "legacy" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } & (import("viem").OneOf<{
            maxFeePerGas: import("viem").FeeValuesEIP1559["maxFeePerGas"];
        } | {
            maxPriorityFeePerGas: import("viem").FeeValuesEIP1559["maxPriorityFeePerGas"];
        }, import("viem").FeeValuesEIP1559> & {
            accessList?: import("viem").TransactionSerializableEIP2930["accessList"] | undefined;
        }) ? "eip1559" : never) | (request extends {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: bigint;
            sidecars?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: undefined;
            maxPriorityFeePerGas?: undefined;
        } & {
            accessList: import("viem").TransactionSerializableEIP2930["accessList"];
        } ? "eip2930" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: undefined;
            blobs?: readonly `0x${string}`[] | readonly import("viem").ByteArray[];
            blobVersionedHashes?: readonly `0x${string}`[];
            maxFeePerBlobGas?: bigint;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: false | readonly import("viem").BlobSidecar<`0x${string}`>[];
        }) & (import("viem").ExactPartial<import("viem").FeeValuesEIP4844> & import("viem").OneOf<{
            blobs: import("viem").TransactionSerializableEIP4844["blobs"];
        } | {
            blobVersionedHashes: import("viem").TransactionSerializableEIP4844["blobVersionedHashes"];
        } | {
            sidecars: import("viem").TransactionSerializableEIP4844["sidecars"];
        }, import("viem").TransactionSerializableEIP4844>) ? "eip4844" : never) | (request extends ({
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        } | {
            accessList?: import("viem").AccessList;
            authorizationList?: import("viem").SignedAuthorizationList;
            blobs?: undefined;
            blobVersionedHashes?: undefined;
            gasPrice?: undefined;
            maxFeePerBlobGas?: undefined;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            sidecars?: undefined;
        }) & {
            authorizationList: import("viem").TransactionSerializableEIP7702["authorizationList"];
        } ? "eip7702" : never) | (request["type"] extends string ? Extract<request["type"], string> : never)> ? T_4 extends "legacy" ? import("viem").TransactionSerializedLegacy : never : never : never)>>;
        signTypedData: <const typedData extends {
            [x: string]: readonly import("viem").TypedDataParameter[];
            [x: `string[${string}]`]: never;
            [x: `function[${string}]`]: never;
            [x: `address[${string}]`]: never;
            [x: `uint256[${string}]`]: never;
            [x: `bool[${string}]`]: never;
            [x: `bytes[${string}]`]: never;
            [x: `bytes2[${string}]`]: never;
            [x: `bytes18[${string}]`]: never;
            [x: `bytes1[${string}]`]: never;
            [x: `bytes30[${string}]`]: never;
            [x: `bytes3[${string}]`]: never;
            [x: `bytes10[${string}]`]: never;
            [x: `bytes9[${string}]`]: never;
            [x: `bytes4[${string}]`]: never;
            [x: `bytes5[${string}]`]: never;
            [x: `bytes6[${string}]`]: never;
            [x: `bytes7[${string}]`]: never;
            [x: `bytes8[${string}]`]: never;
            [x: `bytes16[${string}]`]: never;
            [x: `bytes28[${string}]`]: never;
            [x: `bytes20[${string}]`]: never;
            [x: `bytes11[${string}]`]: never;
            [x: `bytes12[${string}]`]: never;
            [x: `bytes13[${string}]`]: never;
            [x: `bytes14[${string}]`]: never;
            [x: `bytes15[${string}]`]: never;
            [x: `bytes17[${string}]`]: never;
            [x: `bytes19[${string}]`]: never;
            [x: `bytes21[${string}]`]: never;
            [x: `bytes22[${string}]`]: never;
            [x: `bytes23[${string}]`]: never;
            [x: `bytes24[${string}]`]: never;
            [x: `bytes25[${string}]`]: never;
            [x: `bytes26[${string}]`]: never;
            [x: `bytes27[${string}]`]: never;
            [x: `bytes29[${string}]`]: never;
            [x: `bytes31[${string}]`]: never;
            [x: `bytes32[${string}]`]: never;
            [x: `int[${string}]`]: never;
            [x: `int120[${string}]`]: never;
            [x: `int8[${string}]`]: never;
            [x: `int200[${string}]`]: never;
            [x: `int16[${string}]`]: never;
            [x: `int64[${string}]`]: never;
            [x: `int56[${string}]`]: never;
            [x: `int24[${string}]`]: never;
            [x: `int32[${string}]`]: never;
            [x: `int40[${string}]`]: never;
            [x: `int48[${string}]`]: never;
            [x: `int72[${string}]`]: never;
            [x: `int80[${string}]`]: never;
            [x: `int88[${string}]`]: never;
            [x: `int96[${string}]`]: never;
            [x: `int104[${string}]`]: never;
            [x: `int112[${string}]`]: never;
            [x: `int128[${string}]`]: never;
            [x: `int136[${string}]`]: never;
            [x: `int144[${string}]`]: never;
            [x: `int152[${string}]`]: never;
            [x: `int160[${string}]`]: never;
            [x: `int168[${string}]`]: never;
            [x: `int176[${string}]`]: never;
            [x: `int184[${string}]`]: never;
            [x: `int192[${string}]`]: never;
            [x: `int208[${string}]`]: never;
            [x: `int216[${string}]`]: never;
            [x: `int224[${string}]`]: never;
            [x: `int232[${string}]`]: never;
            [x: `int240[${string}]`]: never;
            [x: `int248[${string}]`]: never;
            [x: `int256[${string}]`]: never;
            [x: `uint[${string}]`]: never;
            [x: `uint120[${string}]`]: never;
            [x: `uint8[${string}]`]: never;
            [x: `uint200[${string}]`]: never;
            [x: `uint16[${string}]`]: never;
            [x: `uint64[${string}]`]: never;
            [x: `uint56[${string}]`]: never;
            [x: `uint24[${string}]`]: never;
            [x: `uint32[${string}]`]: never;
            [x: `uint40[${string}]`]: never;
            [x: `uint48[${string}]`]: never;
            [x: `uint72[${string}]`]: never;
            [x: `uint80[${string}]`]: never;
            [x: `uint88[${string}]`]: never;
            [x: `uint96[${string}]`]: never;
            [x: `uint104[${string}]`]: never;
            [x: `uint112[${string}]`]: never;
            [x: `uint128[${string}]`]: never;
            [x: `uint136[${string}]`]: never;
            [x: `uint144[${string}]`]: never;
            [x: `uint152[${string}]`]: never;
            [x: `uint160[${string}]`]: never;
            [x: `uint168[${string}]`]: never;
            [x: `uint176[${string}]`]: never;
            [x: `uint184[${string}]`]: never;
            [x: `uint192[${string}]`]: never;
            [x: `uint208[${string}]`]: never;
            [x: `uint216[${string}]`]: never;
            [x: `uint224[${string}]`]: never;
            [x: `uint232[${string}]`]: never;
            [x: `uint240[${string}]`]: never;
            [x: `uint248[${string}]`]: never;
            string?: never;
            address?: never;
            uint256?: never;
            bool?: never;
            bytes?: never;
            bytes2?: never;
            bytes18?: never;
            bytes1?: never;
            bytes30?: never;
            bytes3?: never;
            bytes10?: never;
            bytes9?: never;
            bytes4?: never;
            bytes5?: never;
            bytes6?: never;
            bytes7?: never;
            bytes8?: never;
            bytes16?: never;
            bytes28?: never;
            bytes20?: never;
            bytes11?: never;
            bytes12?: never;
            bytes13?: never;
            bytes14?: never;
            bytes15?: never;
            bytes17?: never;
            bytes19?: never;
            bytes21?: never;
            bytes22?: never;
            bytes23?: never;
            bytes24?: never;
            bytes25?: never;
            bytes26?: never;
            bytes27?: never;
            bytes29?: never;
            bytes31?: never;
            bytes32?: never;
            int120?: never;
            int8?: never;
            int200?: never;
            int16?: never;
            int64?: never;
            int56?: never;
            int24?: never;
            int32?: never;
            int40?: never;
            int48?: never;
            int72?: never;
            int80?: never;
            int88?: never;
            int96?: never;
            int104?: never;
            int112?: never;
            int128?: never;
            int136?: never;
            int144?: never;
            int152?: never;
            int160?: never;
            int168?: never;
            int176?: never;
            int184?: never;
            int192?: never;
            int208?: never;
            int216?: never;
            int224?: never;
            int232?: never;
            int240?: never;
            int248?: never;
            int256?: never;
            uint120?: never;
            uint8?: never;
            uint200?: never;
            uint16?: never;
            uint64?: never;
            uint56?: never;
            uint24?: never;
            uint32?: never;
            uint40?: never;
            uint48?: never;
            uint72?: never;
            uint80?: never;
            uint88?: never;
            uint96?: never;
            uint104?: never;
            uint112?: never;
            uint128?: never;
            uint136?: never;
            uint144?: never;
            uint152?: never;
            uint160?: never;
            uint168?: never;
            uint176?: never;
            uint184?: never;
            uint192?: never;
            uint208?: never;
            uint216?: never;
            uint224?: never;
            uint232?: never;
            uint240?: never;
            uint248?: never;
        } | {
            [key: string]: unknown;
        }, primaryType extends string>(args: import("viem").SignTypedDataParameters<typedData, primaryType, {
            address: import("viem").Address;
            nonceManager?: import("viem").NonceManager | undefined;
            sign: ((parameters: {
                hash: import("viem").Hash;
            }) => Promise<import("viem").Hex>) | undefined;
            signAuthorization: ((parameters: import("viem").AuthorizationRequest) => Promise<import("viem/accounts").SignAuthorizationReturnType>) | undefined;
            signMessage: ({ message }: {
                message: import("viem").SignableMessage;
            }) => Promise<import("viem").Hex>;
            signTransaction: <serializer extends import("viem").SerializeTransactionFn<import("viem").TransactionSerializable> = import("viem").SerializeTransactionFn<import("viem").TransactionSerializable>, transaction extends Parameters<serializer>[0] = Parameters<serializer>[0]>(transaction: transaction, options?: {
                serializer?: serializer | undefined;
            } | undefined) => Promise<import("viem").Hex>;
            signTypedData: <const typedData_1 extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } | Record<string, unknown>, primaryType_1 extends keyof typedData_1 | "EIP712Domain" = keyof typedData_1>(parameters: import("viem").TypedDataDefinition<typedData_1, primaryType_1, typedData_1 extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } ? keyof typedData_1 : string>) => Promise<import("viem").Hex>;
            publicKey: import("viem").Hex;
            source: "privateKey";
            type: "local";
        }>) => Promise<import("viem").SignTypedDataReturnType>;
        switchChain: (args: import("viem").SwitchChainParameters) => Promise<void>;
        waitForCallsStatus: (parameters: import("viem").WaitForCallsStatusParameters) => Promise<import("viem").WaitForCallsStatusReturnType>;
        watchAsset: (args: import("viem").WatchAssetParameters) => Promise<import("viem").WatchAssetReturnType>;
        writeContract: <const abi extends import("viem").Abi | readonly unknown[], functionName extends import("viem").ContractFunctionName<abi, "nonpayable" | "payable">, args_1 extends import("viem").ContractFunctionArgs<abi, "nonpayable" | "payable", functionName>, chainOverride extends import("viem").Chain | undefined = undefined>(args: import("viem").WriteContractParameters<abi, functionName, args_1, {
            blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                    readonly apiUrl: "https://api.etherscan.io/v2/api";
                };
            };
            blockTime: 2000;
            contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 137;
            name: "Polygon";
            nativeCurrency: {
                readonly name: "POL";
                readonly symbol: "POL";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://polygon.drpc.org"];
                };
            };
            sourceId?: number | undefined | undefined;
            testnet?: boolean | undefined | undefined;
            custom?: Record<string, unknown> | undefined;
            extendSchema?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters?: undefined;
            prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
                runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
            }] | undefined;
            serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
            verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
        }, {
            address: import("viem").Address;
            nonceManager?: import("viem").NonceManager | undefined;
            sign: ((parameters: {
                hash: import("viem").Hash;
            }) => Promise<import("viem").Hex>) | undefined;
            signAuthorization: ((parameters: import("viem").AuthorizationRequest) => Promise<import("viem/accounts").SignAuthorizationReturnType>) | undefined;
            signMessage: ({ message }: {
                message: import("viem").SignableMessage;
            }) => Promise<import("viem").Hex>;
            signTransaction: <serializer extends import("viem").SerializeTransactionFn<import("viem").TransactionSerializable> = import("viem").SerializeTransactionFn<import("viem").TransactionSerializable>, transaction extends Parameters<serializer>[0] = Parameters<serializer>[0]>(transaction: transaction, options?: {
                serializer?: serializer | undefined;
            } | undefined) => Promise<import("viem").Hex>;
            signTypedData: <const typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } | Record<string, unknown>, primaryType extends keyof typedData | "EIP712Domain" = keyof typedData>(parameters: import("viem").TypedDataDefinition<typedData, primaryType, typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } ? keyof typedData : string>) => Promise<import("viem").Hex>;
            publicKey: import("viem").Hex;
            source: "privateKey";
            type: "local";
        }, chainOverride>) => Promise<import("viem").WriteContractReturnType>;
        writeContractSync: <const abi extends import("viem").Abi | readonly unknown[], functionName extends import("viem").ContractFunctionName<abi, "nonpayable" | "payable">, args_1 extends import("viem").ContractFunctionArgs<abi, "nonpayable" | "payable", functionName>, chainOverride extends import("viem").Chain | undefined = undefined>(args: import("viem").WriteContractSyncParameters<abi, functionName, args_1, {
            blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                    readonly apiUrl: "https://api.etherscan.io/v2/api";
                };
            };
            blockTime: 2000;
            contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 137;
            name: "Polygon";
            nativeCurrency: {
                readonly name: "POL";
                readonly symbol: "POL";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://polygon.drpc.org"];
                };
            };
            sourceId?: number | undefined | undefined;
            testnet?: boolean | undefined | undefined;
            custom?: Record<string, unknown> | undefined;
            extendSchema?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters?: undefined;
            prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
                runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
            }] | undefined;
            serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
            verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
        }, {
            address: import("viem").Address;
            nonceManager?: import("viem").NonceManager | undefined;
            sign: ((parameters: {
                hash: import("viem").Hash;
            }) => Promise<import("viem").Hex>) | undefined;
            signAuthorization: ((parameters: import("viem").AuthorizationRequest) => Promise<import("viem/accounts").SignAuthorizationReturnType>) | undefined;
            signMessage: ({ message }: {
                message: import("viem").SignableMessage;
            }) => Promise<import("viem").Hex>;
            signTransaction: <serializer extends import("viem").SerializeTransactionFn<import("viem").TransactionSerializable> = import("viem").SerializeTransactionFn<import("viem").TransactionSerializable>, transaction extends Parameters<serializer>[0] = Parameters<serializer>[0]>(transaction: transaction, options?: {
                serializer?: serializer | undefined;
            } | undefined) => Promise<import("viem").Hex>;
            signTypedData: <const typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } | Record<string, unknown>, primaryType extends keyof typedData | "EIP712Domain" = keyof typedData>(parameters: import("viem").TypedDataDefinition<typedData, primaryType, typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } ? keyof typedData : string>) => Promise<import("viem").Hex>;
            publicKey: import("viem").Hex;
            source: "privateKey";
            type: "local";
        }, chainOverride>) => Promise<import("viem").WriteContractSyncReturnType>;
        extend: <const client extends {
            [x: string]: unknown;
            account?: undefined;
            batch?: undefined;
            cacheTime?: undefined;
            ccipRead?: undefined;
            chain?: undefined;
            dataSuffix?: undefined;
            experimental_blockTag?: undefined;
            key?: undefined;
            name?: undefined;
            pollingInterval?: undefined;
            request?: undefined;
            transport?: undefined;
            type?: undefined;
            uid?: undefined;
        } & import("viem").ExactPartial<Pick<import("viem").PublicActions<import("viem").HttpTransport<undefined, false>, {
            blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                    readonly apiUrl: "https://api.etherscan.io/v2/api";
                };
            };
            blockTime: 2000;
            contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 137;
            name: "Polygon";
            nativeCurrency: {
                readonly name: "POL";
                readonly symbol: "POL";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://polygon.drpc.org"];
                };
            };
            sourceId?: number | undefined | undefined;
            testnet?: boolean | undefined | undefined;
            custom?: Record<string, unknown> | undefined;
            extendSchema?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters?: undefined;
            prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
                runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
            }] | undefined;
            serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
            verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
        }, {
            address: import("viem").Address;
            nonceManager?: import("viem").NonceManager | undefined;
            sign: ((parameters: {
                hash: import("viem").Hash;
            }) => Promise<import("viem").Hex>) | undefined;
            signAuthorization: ((parameters: import("viem").AuthorizationRequest) => Promise<import("viem/accounts").SignAuthorizationReturnType>) | undefined;
            signMessage: ({ message }: {
                message: import("viem").SignableMessage;
            }) => Promise<import("viem").Hex>;
            signTransaction: <serializer extends import("viem").SerializeTransactionFn<import("viem").TransactionSerializable> = import("viem").SerializeTransactionFn<import("viem").TransactionSerializable>, transaction extends Parameters<serializer>[0] = Parameters<serializer>[0]>(transaction: transaction, options?: {
                serializer?: serializer | undefined;
            } | undefined) => Promise<import("viem").Hex>;
            signTypedData: <const typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } | Record<string, unknown>, primaryType extends keyof typedData | "EIP712Domain" = keyof typedData>(parameters: import("viem").TypedDataDefinition<typedData, primaryType, typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } ? keyof typedData : string>) => Promise<import("viem").Hex>;
            publicKey: import("viem").Hex;
            source: "privateKey";
            type: "local";
        }>, "prepareTransactionRequest" | "call" | "createContractEventFilter" | "createEventFilter" | "estimateContractGas" | "estimateGas" | "getBlock" | "getBlockNumber" | "getChainId" | "getContractEvents" | "getEnsText" | "getFilterChanges" | "getGasPrice" | "getLogs" | "getTransaction" | "getTransactionCount" | "getTransactionReceipt" | "readContract" | "sendRawTransaction" | "simulateContract" | "uninstallFilter" | "watchBlockNumber" | "watchContractEvent"> & Pick<import("viem").WalletActions<{
            blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                    readonly apiUrl: "https://api.etherscan.io/v2/api";
                };
            };
            blockTime: 2000;
            contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 137;
            name: "Polygon";
            nativeCurrency: {
                readonly name: "POL";
                readonly symbol: "POL";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://polygon.drpc.org"];
                };
            };
            sourceId?: number | undefined | undefined;
            testnet?: boolean | undefined | undefined;
            custom?: Record<string, unknown> | undefined;
            extendSchema?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters?: undefined;
            prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
                runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
            }] | undefined;
            serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
            verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
        }, {
            address: import("viem").Address;
            nonceManager?: import("viem").NonceManager | undefined;
            sign: ((parameters: {
                hash: import("viem").Hash;
            }) => Promise<import("viem").Hex>) | undefined;
            signAuthorization: ((parameters: import("viem").AuthorizationRequest) => Promise<import("viem/accounts").SignAuthorizationReturnType>) | undefined;
            signMessage: ({ message }: {
                message: import("viem").SignableMessage;
            }) => Promise<import("viem").Hex>;
            signTransaction: <serializer extends import("viem").SerializeTransactionFn<import("viem").TransactionSerializable> = import("viem").SerializeTransactionFn<import("viem").TransactionSerializable>, transaction extends Parameters<serializer>[0] = Parameters<serializer>[0]>(transaction: transaction, options?: {
                serializer?: serializer | undefined;
            } | undefined) => Promise<import("viem").Hex>;
            signTypedData: <const typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } | Record<string, unknown>, primaryType extends keyof typedData | "EIP712Domain" = keyof typedData>(parameters: import("viem").TypedDataDefinition<typedData, primaryType, typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } ? keyof typedData : string>) => Promise<import("viem").Hex>;
            publicKey: import("viem").Hex;
            source: "privateKey";
            type: "local";
        }>, "sendTransaction" | "writeContract">>>(fn: (client: import("viem").Client<import("viem").HttpTransport<undefined, false>, {
            blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                    readonly apiUrl: "https://api.etherscan.io/v2/api";
                };
            };
            blockTime: 2000;
            contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 137;
            name: "Polygon";
            nativeCurrency: {
                readonly name: "POL";
                readonly symbol: "POL";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://polygon.drpc.org"];
                };
            };
            sourceId?: number | undefined | undefined;
            testnet?: boolean | undefined | undefined;
            custom?: Record<string, unknown> | undefined;
            extendSchema?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters?: undefined;
            prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
                runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
            }] | undefined;
            serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
            verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
        }, {
            address: import("viem").Address;
            nonceManager?: import("viem").NonceManager | undefined;
            sign: ((parameters: {
                hash: import("viem").Hash;
            }) => Promise<import("viem").Hex>) | undefined;
            signAuthorization: ((parameters: import("viem").AuthorizationRequest) => Promise<import("viem/accounts").SignAuthorizationReturnType>) | undefined;
            signMessage: ({ message }: {
                message: import("viem").SignableMessage;
            }) => Promise<import("viem").Hex>;
            signTransaction: <serializer extends import("viem").SerializeTransactionFn<import("viem").TransactionSerializable> = import("viem").SerializeTransactionFn<import("viem").TransactionSerializable>, transaction extends Parameters<serializer>[0] = Parameters<serializer>[0]>(transaction: transaction, options?: {
                serializer?: serializer | undefined;
            } | undefined) => Promise<import("viem").Hex>;
            signTypedData: <const typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } | Record<string, unknown>, primaryType extends keyof typedData | "EIP712Domain" = keyof typedData>(parameters: import("viem").TypedDataDefinition<typedData, primaryType, typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } ? keyof typedData : string>) => Promise<import("viem").Hex>;
            publicKey: import("viem").Hex;
            source: "privateKey";
            type: "local";
        }, [{
            Method: "eth_accounts";
            Parameters?: undefined;
            ReturnType: import("viem").Address[];
        }, {
            Method: "eth_chainId";
            Parameters?: undefined;
            ReturnType: import("viem").Quantity;
        }, {
            Method: "eth_estimateGas";
            Parameters: [transaction: import("viem").RpcTransactionRequest] | [transaction: import("viem").RpcTransactionRequest, block: import("viem").RpcBlockNumber | import("viem").BlockTag] | [transaction: import("viem").RpcTransactionRequest, block: import("viem").RpcBlockNumber | import("viem").BlockTag, stateOverride: import("viem").RpcStateOverride];
            ReturnType: import("viem").Quantity;
        }, {
            Method: "eth_fillTransaction";
            Parameters: [transaction: import("viem").RpcTransactionRequest];
            ReturnType: {
                capabilities?: Record<string, unknown> | undefined;
                raw: import("viem").Hex;
                tx: import("viem").RpcTransaction;
            };
        }, {
            Method: "eth_requestAccounts";
            Parameters?: undefined;
            ReturnType: import("viem").Address[];
        }, {
            Method: "eth_sendTransaction";
            Parameters: [transaction: import("viem").RpcTransactionRequest];
            ReturnType: import("viem").Hash;
        }, {
            Method: "eth_sendRawTransaction";
            Parameters: [signedTransaction: import("viem").Hex];
            ReturnType: import("viem").Hash;
        }, {
            Method: "eth_sendRawTransactionSync";
            Parameters: [signedTransaction: import("viem").Hex] | [signedTransaction: import("viem").Hex, timeout: number];
            ReturnType: import("viem").RpcTransactionReceipt;
        }, {
            Method: "eth_sign";
            Parameters: [address: import("viem").Address, data: import("viem").Hex];
            ReturnType: import("viem").Hex;
        }, {
            Method: "eth_signTransaction";
            Parameters: [request: import("viem").RpcTransactionRequest];
            ReturnType: import("viem").Hex;
        }, {
            Method: "eth_signTypedData_v4";
            Parameters: [address: import("viem").Address, message: string];
            ReturnType: import("viem").Hex;
        }, {
            Method: "eth_syncing";
            Parameters?: undefined;
            ReturnType: import("viem").NetworkSync | false;
        }, {
            Method: "personal_sign";
            Parameters: [data: import("viem").Hex, address: import("viem").Address];
            ReturnType: import("viem").Hex;
        }, {
            Method: "wallet_addEthereumChain";
            Parameters: [chain: import("viem").AddEthereumChainParameter];
            ReturnType: null;
        }, {
            Method: "wallet_addSubAccount";
            Parameters: [{
                account: import("viem").OneOf<{
                    keys: readonly {
                        publicKey: import("viem").Hex;
                        type: "address" | "p256" | "webcrypto-p256" | "webauthn-p256";
                    }[];
                    type: "create";
                } | {
                    address: import("viem").Address;
                    chainId?: number | undefined;
                    type: "deployed";
                } | {
                    address: import("viem").Address;
                    chainId?: number | undefined;
                    factory: import("viem").Address;
                    factoryData: import("viem").Hex;
                    type: "undeployed";
                }>;
                version: string;
            }];
            ReturnType: {
                address: import("viem").Address;
                factory?: import("viem").Address | undefined;
                factoryData?: import("viem").Hex | undefined;
            };
        }, {
            Method: "wallet_connect";
            Parameters: [{
                capabilities?: import("viem").Capabilities | undefined;
                version: string;
            }];
            ReturnType: {
                accounts: readonly {
                    address: import("viem").Address;
                    capabilities?: import("viem").Capabilities | undefined;
                }[];
            };
        }, {
            Method: "wallet_disconnect";
            Parameters?: undefined;
            ReturnType: void;
        }, {
            Method: "wallet_getAssets";
            Parameters?: [import("viem").WalletGetAssetsParameters];
            ReturnType: import("viem").WalletGetAssetsReturnType;
        }, {
            Method: "wallet_getCallsStatus";
            Parameters?: [string];
            ReturnType: import("viem").WalletGetCallsStatusReturnType;
        }, {
            Method: "wallet_getCapabilities";
            Parameters?: readonly [] | readonly [import("viem").Address | undefined] | readonly [import("viem").Address | undefined, readonly import("viem").Hex[] | undefined] | undefined;
            ReturnType: {
                [x: `0x${string}`]: {
                    [key: string]: any;
                };
            };
        }, {
            Method: "wallet_getPermissions";
            Parameters?: undefined;
            ReturnType: import("viem").WalletPermission[];
        }, {
            Method: "wallet_grantPermissions";
            Parameters?: [import("viem").WalletGrantPermissionsParameters];
            ReturnType: import("viem").Prettify<import("viem").WalletGrantPermissionsReturnType>;
        }, {
            Method: "wallet_requestPermissions";
            Parameters: [permissions: {
                eth_accounts: Record<string, any>;
            }];
            ReturnType: import("viem").WalletPermission[];
        }, {
            Method: "wallet_revokePermissions";
            Parameters: [permissions: {
                eth_accounts: Record<string, any>;
            }];
            ReturnType: null;
        }, {
            Method: "wallet_sendCalls";
            Parameters?: import("viem").WalletSendCallsParameters;
            ReturnType: import("viem").WalletSendCallsReturnType;
        }, {
            Method: "wallet_sendTransaction";
            Parameters: [transaction: import("viem").RpcTransactionRequest];
            ReturnType: import("viem").Hash;
        }, {
            Method: "wallet_showCallsStatus";
            Parameters?: [string];
            ReturnType: void;
        }, {
            Method: "wallet_switchEthereumChain";
            Parameters: [chain: {
                chainId: string;
            }];
            ReturnType: null;
        }, {
            Method: "wallet_watchAsset";
            Parameters: import("viem").WatchAssetParams;
            ReturnType: boolean;
        }, ...any[]], import("viem").WalletActions<{
            blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                    readonly apiUrl: "https://api.etherscan.io/v2/api";
                };
            };
            blockTime: 2000;
            contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 137;
            name: "Polygon";
            nativeCurrency: {
                readonly name: "POL";
                readonly symbol: "POL";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://polygon.drpc.org"];
                };
            };
            sourceId?: number | undefined | undefined;
            testnet?: boolean | undefined | undefined;
            custom?: Record<string, unknown> | undefined;
            extendSchema?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters?: undefined;
            prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
                runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
            }] | undefined;
            serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
            verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
        }, {
            address: import("viem").Address;
            nonceManager?: import("viem").NonceManager | undefined;
            sign: ((parameters: {
                hash: import("viem").Hash;
            }) => Promise<import("viem").Hex>) | undefined;
            signAuthorization: ((parameters: import("viem").AuthorizationRequest) => Promise<import("viem/accounts").SignAuthorizationReturnType>) | undefined;
            signMessage: ({ message }: {
                message: import("viem").SignableMessage;
            }) => Promise<import("viem").Hex>;
            signTransaction: <serializer extends import("viem").SerializeTransactionFn<import("viem").TransactionSerializable> = import("viem").SerializeTransactionFn<import("viem").TransactionSerializable>, transaction extends Parameters<serializer>[0] = Parameters<serializer>[0]>(transaction: transaction, options?: {
                serializer?: serializer | undefined;
            } | undefined) => Promise<import("viem").Hex>;
            signTypedData: <const typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } | Record<string, unknown>, primaryType extends keyof typedData | "EIP712Domain" = keyof typedData>(parameters: import("viem").TypedDataDefinition<typedData, primaryType, typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } ? keyof typedData : string>) => Promise<import("viem").Hex>;
            publicKey: import("viem").Hex;
            source: "privateKey";
            type: "local";
        }>>) => client) => import("viem").Client<import("viem").HttpTransport<undefined, false>, {
            blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                    readonly apiUrl: "https://api.etherscan.io/v2/api";
                };
            };
            blockTime: 2000;
            contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 137;
            name: "Polygon";
            nativeCurrency: {
                readonly name: "POL";
                readonly symbol: "POL";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://polygon.drpc.org"];
                };
            };
            sourceId?: number | undefined | undefined;
            testnet?: boolean | undefined | undefined;
            custom?: Record<string, unknown> | undefined;
            extendSchema?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters?: undefined;
            prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
                runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
            }] | undefined;
            serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
            verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
        }, {
            address: import("viem").Address;
            nonceManager?: import("viem").NonceManager | undefined;
            sign: ((parameters: {
                hash: import("viem").Hash;
            }) => Promise<import("viem").Hex>) | undefined;
            signAuthorization: ((parameters: import("viem").AuthorizationRequest) => Promise<import("viem/accounts").SignAuthorizationReturnType>) | undefined;
            signMessage: ({ message }: {
                message: import("viem").SignableMessage;
            }) => Promise<import("viem").Hex>;
            signTransaction: <serializer extends import("viem").SerializeTransactionFn<import("viem").TransactionSerializable> = import("viem").SerializeTransactionFn<import("viem").TransactionSerializable>, transaction extends Parameters<serializer>[0] = Parameters<serializer>[0]>(transaction: transaction, options?: {
                serializer?: serializer | undefined;
            } | undefined) => Promise<import("viem").Hex>;
            signTypedData: <const typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } | Record<string, unknown>, primaryType extends keyof typedData | "EIP712Domain" = keyof typedData>(parameters: import("viem").TypedDataDefinition<typedData, primaryType, typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } ? keyof typedData : string>) => Promise<import("viem").Hex>;
            publicKey: import("viem").Hex;
            source: "privateKey";
            type: "local";
        }, [{
            Method: "eth_accounts";
            Parameters?: undefined;
            ReturnType: import("viem").Address[];
        }, {
            Method: "eth_chainId";
            Parameters?: undefined;
            ReturnType: import("viem").Quantity;
        }, {
            Method: "eth_estimateGas";
            Parameters: [transaction: import("viem").RpcTransactionRequest] | [transaction: import("viem").RpcTransactionRequest, block: import("viem").RpcBlockNumber | import("viem").BlockTag] | [transaction: import("viem").RpcTransactionRequest, block: import("viem").RpcBlockNumber | import("viem").BlockTag, stateOverride: import("viem").RpcStateOverride];
            ReturnType: import("viem").Quantity;
        }, {
            Method: "eth_fillTransaction";
            Parameters: [transaction: import("viem").RpcTransactionRequest];
            ReturnType: {
                capabilities?: Record<string, unknown> | undefined;
                raw: import("viem").Hex;
                tx: import("viem").RpcTransaction;
            };
        }, {
            Method: "eth_requestAccounts";
            Parameters?: undefined;
            ReturnType: import("viem").Address[];
        }, {
            Method: "eth_sendTransaction";
            Parameters: [transaction: import("viem").RpcTransactionRequest];
            ReturnType: import("viem").Hash;
        }, {
            Method: "eth_sendRawTransaction";
            Parameters: [signedTransaction: import("viem").Hex];
            ReturnType: import("viem").Hash;
        }, {
            Method: "eth_sendRawTransactionSync";
            Parameters: [signedTransaction: import("viem").Hex] | [signedTransaction: import("viem").Hex, timeout: number];
            ReturnType: import("viem").RpcTransactionReceipt;
        }, {
            Method: "eth_sign";
            Parameters: [address: import("viem").Address, data: import("viem").Hex];
            ReturnType: import("viem").Hex;
        }, {
            Method: "eth_signTransaction";
            Parameters: [request: import("viem").RpcTransactionRequest];
            ReturnType: import("viem").Hex;
        }, {
            Method: "eth_signTypedData_v4";
            Parameters: [address: import("viem").Address, message: string];
            ReturnType: import("viem").Hex;
        }, {
            Method: "eth_syncing";
            Parameters?: undefined;
            ReturnType: import("viem").NetworkSync | false;
        }, {
            Method: "personal_sign";
            Parameters: [data: import("viem").Hex, address: import("viem").Address];
            ReturnType: import("viem").Hex;
        }, {
            Method: "wallet_addEthereumChain";
            Parameters: [chain: import("viem").AddEthereumChainParameter];
            ReturnType: null;
        }, {
            Method: "wallet_addSubAccount";
            Parameters: [{
                account: import("viem").OneOf<{
                    keys: readonly {
                        publicKey: import("viem").Hex;
                        type: "address" | "p256" | "webcrypto-p256" | "webauthn-p256";
                    }[];
                    type: "create";
                } | {
                    address: import("viem").Address;
                    chainId?: number | undefined;
                    type: "deployed";
                } | {
                    address: import("viem").Address;
                    chainId?: number | undefined;
                    factory: import("viem").Address;
                    factoryData: import("viem").Hex;
                    type: "undeployed";
                }>;
                version: string;
            }];
            ReturnType: {
                address: import("viem").Address;
                factory?: import("viem").Address | undefined;
                factoryData?: import("viem").Hex | undefined;
            };
        }, {
            Method: "wallet_connect";
            Parameters: [{
                capabilities?: import("viem").Capabilities | undefined;
                version: string;
            }];
            ReturnType: {
                accounts: readonly {
                    address: import("viem").Address;
                    capabilities?: import("viem").Capabilities | undefined;
                }[];
            };
        }, {
            Method: "wallet_disconnect";
            Parameters?: undefined;
            ReturnType: void;
        }, {
            Method: "wallet_getAssets";
            Parameters?: [import("viem").WalletGetAssetsParameters];
            ReturnType: import("viem").WalletGetAssetsReturnType;
        }, {
            Method: "wallet_getCallsStatus";
            Parameters?: [string];
            ReturnType: import("viem").WalletGetCallsStatusReturnType;
        }, {
            Method: "wallet_getCapabilities";
            Parameters?: readonly [] | readonly [import("viem").Address | undefined] | readonly [import("viem").Address | undefined, readonly import("viem").Hex[] | undefined] | undefined;
            ReturnType: {
                [x: `0x${string}`]: {
                    [key: string]: any;
                };
            };
        }, {
            Method: "wallet_getPermissions";
            Parameters?: undefined;
            ReturnType: import("viem").WalletPermission[];
        }, {
            Method: "wallet_grantPermissions";
            Parameters?: [import("viem").WalletGrantPermissionsParameters];
            ReturnType: import("viem").Prettify<import("viem").WalletGrantPermissionsReturnType>;
        }, {
            Method: "wallet_requestPermissions";
            Parameters: [permissions: {
                eth_accounts: Record<string, any>;
            }];
            ReturnType: import("viem").WalletPermission[];
        }, {
            Method: "wallet_revokePermissions";
            Parameters: [permissions: {
                eth_accounts: Record<string, any>;
            }];
            ReturnType: null;
        }, {
            Method: "wallet_sendCalls";
            Parameters?: import("viem").WalletSendCallsParameters;
            ReturnType: import("viem").WalletSendCallsReturnType;
        }, {
            Method: "wallet_sendTransaction";
            Parameters: [transaction: import("viem").RpcTransactionRequest];
            ReturnType: import("viem").Hash;
        }, {
            Method: "wallet_showCallsStatus";
            Parameters?: [string];
            ReturnType: void;
        }, {
            Method: "wallet_switchEthereumChain";
            Parameters: [chain: {
                chainId: string;
            }];
            ReturnType: null;
        }, {
            Method: "wallet_watchAsset";
            Parameters: import("viem").WatchAssetParams;
            ReturnType: boolean;
        }, ...any[]], { [K in keyof client]: client[K]; } & import("viem").WalletActions<{
            blockExplorers: {
                readonly default: {
                    readonly name: "PolygonScan";
                    readonly url: "https://polygonscan.com";
                    readonly apiUrl: "https://api.etherscan.io/v2/api";
                };
            };
            blockTime: 2000;
            contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 25770160;
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 137;
            name: "Polygon";
            nativeCurrency: {
                readonly name: "POL";
                readonly symbol: "POL";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://polygon.drpc.org"];
                };
            };
            sourceId?: number | undefined | undefined;
            testnet?: boolean | undefined | undefined;
            custom?: Record<string, unknown> | undefined;
            extendSchema?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters?: undefined;
            prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
                phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
            }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
                runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
            }] | undefined;
            serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
            verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
        }, {
            address: import("viem").Address;
            nonceManager?: import("viem").NonceManager | undefined;
            sign: ((parameters: {
                hash: import("viem").Hash;
            }) => Promise<import("viem").Hex>) | undefined;
            signAuthorization: ((parameters: import("viem").AuthorizationRequest) => Promise<import("viem/accounts").SignAuthorizationReturnType>) | undefined;
            signMessage: ({ message }: {
                message: import("viem").SignableMessage;
            }) => Promise<import("viem").Hex>;
            signTransaction: <serializer extends import("viem").SerializeTransactionFn<import("viem").TransactionSerializable> = import("viem").SerializeTransactionFn<import("viem").TransactionSerializable>, transaction extends Parameters<serializer>[0] = Parameters<serializer>[0]>(transaction: transaction, options?: {
                serializer?: serializer | undefined;
            } | undefined) => Promise<import("viem").Hex>;
            signTypedData: <const typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } | Record<string, unknown>, primaryType extends keyof typedData | "EIP712Domain" = keyof typedData>(parameters: import("viem").TypedDataDefinition<typedData, primaryType, typedData extends {
                [x: string]: readonly import("viem").TypedDataParameter[];
                [x: `string[${string}]`]: never;
                [x: `function[${string}]`]: never;
                [x: `address[${string}]`]: never;
                [x: `uint256[${string}]`]: never;
                [x: `bool[${string}]`]: never;
                [x: `bytes[${string}]`]: never;
                [x: `bytes2[${string}]`]: never;
                [x: `bytes18[${string}]`]: never;
                [x: `bytes1[${string}]`]: never;
                [x: `bytes30[${string}]`]: never;
                [x: `bytes3[${string}]`]: never;
                [x: `bytes10[${string}]`]: never;
                [x: `bytes9[${string}]`]: never;
                [x: `bytes4[${string}]`]: never;
                [x: `bytes5[${string}]`]: never;
                [x: `bytes6[${string}]`]: never;
                [x: `bytes7[${string}]`]: never;
                [x: `bytes8[${string}]`]: never;
                [x: `bytes16[${string}]`]: never;
                [x: `bytes28[${string}]`]: never;
                [x: `bytes20[${string}]`]: never;
                [x: `bytes11[${string}]`]: never;
                [x: `bytes12[${string}]`]: never;
                [x: `bytes13[${string}]`]: never;
                [x: `bytes14[${string}]`]: never;
                [x: `bytes15[${string}]`]: never;
                [x: `bytes17[${string}]`]: never;
                [x: `bytes19[${string}]`]: never;
                [x: `bytes21[${string}]`]: never;
                [x: `bytes22[${string}]`]: never;
                [x: `bytes23[${string}]`]: never;
                [x: `bytes24[${string}]`]: never;
                [x: `bytes25[${string}]`]: never;
                [x: `bytes26[${string}]`]: never;
                [x: `bytes27[${string}]`]: never;
                [x: `bytes29[${string}]`]: never;
                [x: `bytes31[${string}]`]: never;
                [x: `bytes32[${string}]`]: never;
                [x: `int[${string}]`]: never;
                [x: `int120[${string}]`]: never;
                [x: `int8[${string}]`]: never;
                [x: `int200[${string}]`]: never;
                [x: `int16[${string}]`]: never;
                [x: `int64[${string}]`]: never;
                [x: `int56[${string}]`]: never;
                [x: `int24[${string}]`]: never;
                [x: `int32[${string}]`]: never;
                [x: `int40[${string}]`]: never;
                [x: `int48[${string}]`]: never;
                [x: `int72[${string}]`]: never;
                [x: `int80[${string}]`]: never;
                [x: `int88[${string}]`]: never;
                [x: `int96[${string}]`]: never;
                [x: `int104[${string}]`]: never;
                [x: `int112[${string}]`]: never;
                [x: `int128[${string}]`]: never;
                [x: `int136[${string}]`]: never;
                [x: `int144[${string}]`]: never;
                [x: `int152[${string}]`]: never;
                [x: `int160[${string}]`]: never;
                [x: `int168[${string}]`]: never;
                [x: `int176[${string}]`]: never;
                [x: `int184[${string}]`]: never;
                [x: `int192[${string}]`]: never;
                [x: `int208[${string}]`]: never;
                [x: `int216[${string}]`]: never;
                [x: `int224[${string}]`]: never;
                [x: `int232[${string}]`]: never;
                [x: `int240[${string}]`]: never;
                [x: `int248[${string}]`]: never;
                [x: `int256[${string}]`]: never;
                [x: `uint[${string}]`]: never;
                [x: `uint120[${string}]`]: never;
                [x: `uint8[${string}]`]: never;
                [x: `uint200[${string}]`]: never;
                [x: `uint16[${string}]`]: never;
                [x: `uint64[${string}]`]: never;
                [x: `uint56[${string}]`]: never;
                [x: `uint24[${string}]`]: never;
                [x: `uint32[${string}]`]: never;
                [x: `uint40[${string}]`]: never;
                [x: `uint48[${string}]`]: never;
                [x: `uint72[${string}]`]: never;
                [x: `uint80[${string}]`]: never;
                [x: `uint88[${string}]`]: never;
                [x: `uint96[${string}]`]: never;
                [x: `uint104[${string}]`]: never;
                [x: `uint112[${string}]`]: never;
                [x: `uint128[${string}]`]: never;
                [x: `uint136[${string}]`]: never;
                [x: `uint144[${string}]`]: never;
                [x: `uint152[${string}]`]: never;
                [x: `uint160[${string}]`]: never;
                [x: `uint168[${string}]`]: never;
                [x: `uint176[${string}]`]: never;
                [x: `uint184[${string}]`]: never;
                [x: `uint192[${string}]`]: never;
                [x: `uint208[${string}]`]: never;
                [x: `uint216[${string}]`]: never;
                [x: `uint224[${string}]`]: never;
                [x: `uint232[${string}]`]: never;
                [x: `uint240[${string}]`]: never;
                [x: `uint248[${string}]`]: never;
                string?: never;
                address?: never;
                uint256?: never;
                bool?: never;
                bytes?: never;
                bytes2?: never;
                bytes18?: never;
                bytes1?: never;
                bytes30?: never;
                bytes3?: never;
                bytes10?: never;
                bytes9?: never;
                bytes4?: never;
                bytes5?: never;
                bytes6?: never;
                bytes7?: never;
                bytes8?: never;
                bytes16?: never;
                bytes28?: never;
                bytes20?: never;
                bytes11?: never;
                bytes12?: never;
                bytes13?: never;
                bytes14?: never;
                bytes15?: never;
                bytes17?: never;
                bytes19?: never;
                bytes21?: never;
                bytes22?: never;
                bytes23?: never;
                bytes24?: never;
                bytes25?: never;
                bytes26?: never;
                bytes27?: never;
                bytes29?: never;
                bytes31?: never;
                bytes32?: never;
                int120?: never;
                int8?: never;
                int200?: never;
                int16?: never;
                int64?: never;
                int56?: never;
                int24?: never;
                int32?: never;
                int40?: never;
                int48?: never;
                int72?: never;
                int80?: never;
                int88?: never;
                int96?: never;
                int104?: never;
                int112?: never;
                int128?: never;
                int136?: never;
                int144?: never;
                int152?: never;
                int160?: never;
                int168?: never;
                int176?: never;
                int184?: never;
                int192?: never;
                int208?: never;
                int216?: never;
                int224?: never;
                int232?: never;
                int240?: never;
                int248?: never;
                int256?: never;
                uint120?: never;
                uint8?: never;
                uint200?: never;
                uint16?: never;
                uint64?: never;
                uint56?: never;
                uint24?: never;
                uint32?: never;
                uint40?: never;
                uint48?: never;
                uint72?: never;
                uint80?: never;
                uint88?: never;
                uint96?: never;
                uint104?: never;
                uint112?: never;
                uint128?: never;
                uint136?: never;
                uint144?: never;
                uint152?: never;
                uint160?: never;
                uint168?: never;
                uint176?: never;
                uint184?: never;
                uint192?: never;
                uint208?: never;
                uint216?: never;
                uint224?: never;
                uint232?: never;
                uint240?: never;
                uint248?: never;
            } ? keyof typedData : string>) => Promise<import("viem").Hex>;
            publicKey: import("viem").Hex;
            source: "privateKey";
            type: "local";
        }>>;
    };
    account: {
        address: import("viem").Address;
        nonceManager?: import("viem").NonceManager | undefined;
        sign: ((parameters: {
            hash: import("viem").Hash;
        }) => Promise<import("viem").Hex>) | undefined;
        signAuthorization: ((parameters: import("viem").AuthorizationRequest) => Promise<import("viem/accounts").SignAuthorizationReturnType>) | undefined;
        signMessage: ({ message }: {
            message: import("viem").SignableMessage;
        }) => Promise<import("viem").Hex>;
        signTransaction: <serializer extends import("viem").SerializeTransactionFn<import("viem").TransactionSerializable> = import("viem").SerializeTransactionFn<import("viem").TransactionSerializable>, transaction extends Parameters<serializer>[0] = Parameters<serializer>[0]>(transaction: transaction, options?: {
            serializer?: serializer | undefined;
        } | undefined) => Promise<import("viem").Hex>;
        signTypedData: <const typedData extends import("viem").TypedData | Record<string, unknown>, primaryType extends keyof typedData | "EIP712Domain" = keyof typedData>(parameters: import("viem").TypedDataDefinition<typedData, primaryType>) => Promise<import("viem").Hex>;
        publicKey: import("viem").Hex;
        source: "privateKey";
        type: "local";
    };
};
export declare function getPolygonUSDCBalance(address: `0x${string}`): Promise<string>;
export declare function verifyPolygonPayment(txHash: `0x${string}`, expectedFrom: `0x${string}`, expectedTo: `0x${string}`, expectedAmountUSDC: string): Promise<{
    valid: boolean;
    reason?: string;
}>;
export declare function getPolygonX402Config(payToWallet: `0x${string}`): {
    scheme: "exact";
    network: string;
    payTo: `0x${string}`;
    asset: `0x${string}`;
    extra: {
        name: string;
        nativeCurrency: string;
        blockExplorer: string;
        gasToken: string;
        avgBlockTime: string;
        bridgeFrom: string;
    };
};
declare const _default: {
    POLYGON_CHAIN_ID: number;
    POLYGON_NETWORK_ID: string;
    POLYGON_RPC: string;
    POLYGON_USDC: `0x${string}`;
    getPolygonPublicClient: typeof getPolygonPublicClient;
    getPolygonWalletClient: typeof getPolygonWalletClient;
    getPolygonUSDCBalance: typeof getPolygonUSDCBalance;
    verifyPolygonPayment: typeof verifyPolygonPayment;
    getPolygonX402Config: typeof getPolygonX402Config;
};
export default _default;
