"use client";

import { useState, useEffect, useRef } from "react";
import { RefreshCw } from "lucide-react";
import { ErrorAlert } from "./error";
import Balance from "./Balance";
import SummaryCard from "./summary-card";
import {
  getRouterState,
  getEvmChains,
  getUserBalancesOnNeuron,
} from "../lib/euclidClient";
import { useWallet } from "../context/WalletAddress";

const AUTO_REFRESH_INTERVAL = 30000;

interface ChainData {
  chain: string;
  chainId: number;
  status: "success" | "error" | "loading";
  tokens: Array<{
    symbol: string;
    balance: string;
    decimals: number;
    usdValue: string;
  }>;
  errorMessage?: string;
}

export function VoucherBalancePage() {
  const [chainData, setChainData] = useState<ChainData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [globalError, setGlobalError] = useState<string | null>(null);
  const autoRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const refreshAbortControllerRef = useRef<AbortController | null>(null);

  const { accountData, connectWallet } = useWallet();
  const time = lastUpdated.toLocaleTimeString();

  /* -------------------------------------------------------------------------- */
  /*                           FETCH REAL EUCLID DATA                            */
  /* -------------------------------------------------------------------------- */

  const fetchRealBalances = async () => {
    if (!accountData.address) return;

    try {
      setIsLoading(true);
      setGlobalError(null);

      // 1️⃣ Get router + chains
      const [virtualBalanceAddress, evmChains] = await Promise.all([
        getRouterState(),
        getEvmChains(),
      ]);

      // 2️⃣ Determine user's origin chain
      const walletChainId = accountData.chainId; // from wallet context
      const userChain = evmChains.find(
        (c) => c.chain_id === String(walletChainId)
      );

      if (!userChain) {
        throw new Error("Unsupported wallet chain");
      }

      // 3️⃣ Fetch ALL balances from Neuron
      const neuronRes = await getUserBalancesOnNeuron({
        neuronContractAddress: virtualBalanceAddress,
        userChainUid: userChain.chain_uid,
        walletAddress: accountData.address,
      });

      const balances = neuronRes.balances || [];

      // 4️⃣ Group balances by chain_uid
      const grouped: Record<string, any[]> = {};
      balances.forEach((b: any) => {
        if (!grouped[b.chain_uid]) grouped[b.chain_uid] = [];
        grouped[b.chain_uid].push(b);
      });

      // 5️⃣ Convert into UI format
      const realChainData: ChainData[] = evmChains.map((chain) => {
        const tokens = grouped[chain.chain_uid] || [];

        return {
          chain: chain.display_name,
          chainId: Number(chain.chain_id),
          status: "success",
          tokens: tokens.map((t) => ({
            symbol: t.denom,
            balance: t.amount,
            decimals: 18, // you can later fetch real decimals
            usdValue: "0", // hook a price feed later
          })),
        };
      });

      setChainData(realChainData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch balances:", err);
      setGlobalError("Failed to fetch voucher balances");
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                               AUTO REFRESH                                  */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!accountData.address) return;

    fetchRealBalances();

    autoRefreshIntervalRef.current = setInterval(() => {
      fetchRealBalances();
    }, AUTO_REFRESH_INTERVAL);

    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
    };
  }, [accountData.address]);

  /* -------------------------------------------------------------------------- */
  /*                                STATS                                         */
  /* -------------------------------------------------------------------------- */

  const calculateStats = () => {
    const allTokens = new Set<string>();
    let totalBalance = 0;

    chainData.forEach((chain) => {
      chain.tokens.forEach((token) => {
        allTokens.add(token.symbol);
        totalBalance += Number(token.usdValue || 0);
      });
    });

    return {
      totalBalance,
      totalTokens: allTokens.size,
      activeChains: chainData.filter((c) => c.tokens.length > 0).length,
    };
  };

  const stats = calculateStats();

  /* -------------------------------------------------------------------------- */
  /*                                   UI                                         */
  /* -------------------------------------------------------------------------- */

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
        <div className="max-w-7xl mx-auto px-4 py-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Voucher Balances</h1>
            <p className="text-gray-500">Cross-chain balances via Euclid</p>
            <p className="text-sm mt-1">Last updated: {time}</p>
          </div>

          {!accountData.address ? (
            <button
              onClick={connectWallet}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Connect Wallet
            </button>
          ) : (
            <button
              onClick={fetchRealBalances}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              <RefreshCw className={isLoading ? "animate-spin" : ""} />
              Refresh
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {globalError && (
          <ErrorAlert
            message={globalError}
            onDismiss={() => setGlobalError(null)}
          />
        )}

        {!isLoading && (
          <SummaryCard
            totalBalance={stats.totalBalance}
            totalTokens={stats.totalTokens}
            activeChains={stats.activeChains}
          />
        )}

        <div className="mt-8 space-y-4">
          {chainData.length === 0 ? (
            <div className="text-center text-gray-500">
              No voucher balances found
            </div>
          ) : (
            chainData.map((chain) => (
              <Balance
                key={chain.chainId}
                chain={chain.chain}
                chainId={chain.chainId}
                status={chain.status}
                tokens={chain.tokens}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
