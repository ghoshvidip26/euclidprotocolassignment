import { GraphQLClient } from "graphql-request";
import { getSdk } from "@euclidprotocol/graphql-codegen/dist/src/node";

const GQL_ENDPOINT = "https://testnet.api.euclidprotocol.com/graphql";

const client = new GraphQLClient(GQL_ENDPOINT);

export const euclidSdk = getSdk(client);

export async function getRouterState() {
  const res = await euclidSdk.CODEGEN_GENERATED_ROUTER_STATE({});
  return res.router.state.virtual_balance_address;
}

export async function getEvmChains() {
  const res = await euclidSdk.CODEGEN_GENERATED_CHAINS_ALL_CHAINS({
    chains_all_chains_show_all_chains: true,
  });

  return res.chains.all_chains.filter(
    (chain) => !isNaN(Number(chain.chain_id)) // EVM chains
  );
}
export async function getUserBalancesOnNeuron({
  neuronContractAddress,
  userChainUid,
  walletAddress,
  skip = 0,
  limit = 10,
}: {
  neuronContractAddress: string;
  userChainUid: string;
  walletAddress: string;
  skip?: number;
  limit?: number;
}) {
  const res = await euclidSdk.CODEGEN_GENERATED_CW_MULTICALL_SMART_QUERIES({
    chain_uid: "neuron", // 👈 MUST be neuron
    cw_multicall_smart_queries_queries: [
      {
        contract_address: neuronContractAddress, // 👈 MUST be euclid1...
        msg: {
          get_user_balances: {
            user: {
              chain_uid: userChainUid, // "arbitrum"
              address: walletAddress, // EVM wallet
            },
            pagination: {
              skip,
              limit,
            },
          },
        },
      },
    ],
  });

  return res;
}
