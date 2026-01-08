import { getSdk } from "@euclidprotocol/graphql-codegen/dist/src/node";
import { GraphQLClient } from "graphql-request";
const GQL_ENDPOINT = "https://testnet.api.euclidprotocol.com/graphql";

const client = new GraphQLClient(GQL_ENDPOINT);

const sdk = getSdk(client);
console.log(sdk.CODEGEN_GENERATED_ROUTER_STATE());
