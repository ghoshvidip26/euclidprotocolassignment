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

const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds

const mockChainData = [
  {
    chain: "Ethereum",
    chainId: 1,
    status: "success" as const,
    tokens: [
      {
        symbol: "EURC",
        balance: "1,234.50",
        decimals: 6,
        usdValue: "1,234.50",
      },
      {
        symbol: "USDC",
        balance: "5,000.00",
        decimals: 6,
        usdValue: "5,000.00",
      },
    ],
  },
  {
    chain: "Polygon",
    chainId: 137,
    status: "success" as const,
    tokens: [
      {
        symbol: "EURC",
        balance: "2,500.00",
        decimals: 6,
        usdValue: "2,500.00",
      },
      {
        symbol: "USDC",
        balance: "3,200.00",
        decimals: 6,
        usdValue: "3,200.00",
      },
    ],
  },
  {
    chain: "Arbitrum",
    chainId: 42161,
    status: "success" as const,
    tokens: [
      { symbol: "EURC", balance: "800.25", decimals: 6, usdValue: "800.25" },
      {
        symbol: "USDC",
        balance: "1,500.00",
        decimals: 6,
        usdValue: "1,500.00",
      },
    ],
  },
];

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
  const [chainData, setChainData] = useState<ChainData[]>(mockChainData);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [globalError, setGlobalError] = useState<string | null>(null);
  const autoRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const refreshAbortControllerRef = useRef<AbortController | null>(null);
  const time = lastUpdated.toLocaleTimeString();

  const func = async () => {
    const [virtualBalanceAddress, evmChains] = await Promise.all([
      getRouterState(),
      getEvmChains(),
    ]);

    const NEURON_CONTRACT = virtualBalanceAddress;
    console.log(NEURON_CONTRACT);

    const res = await getUserBalancesOnNeuron({
      neuronContractAddress: NEURON_CONTRACT, // 👈 MUST be euclid1...
      userChainUid: "sepolia", // 👈 user lives on Arbitrum
      walletAddress: "0xC52711c6091635B26F1046b1ac40325260B9c9Ec",
    });

    console.log(res);
  };
  func();

  const fetchVoucherBalances = async (signal?: AbortSignal) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setChainData(mockChainData);
      setGlobalError(null);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch balances";
      setGlobalError(errorMessage);
    }
  };

  const handleRefresh = async () => {
    if (refreshAbortControllerRef.current) {
      refreshAbortControllerRef.current.abort();
    }

    setIsLoading(true);
    refreshAbortControllerRef.current = new AbortController();

    try {
      await fetchVoucherBalances(refreshAbortControllerRef.current.signal);
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleRefresh();

    autoRefreshIntervalRef.current = setInterval(() => {
      fetchVoucherBalances().then(() => setLastUpdated(new Date()));
    }, AUTO_REFRESH_INTERVAL);

    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
      if (refreshAbortControllerRef.current) {
        refreshAbortControllerRef.current.abort();
      }
    };
  }, []);

  const calculateStats = () => {
    const allTokens = new Set<string>();
    let totalBalance = 0;

    chainData.forEach((chain) => {
      if (chain.status === "success") {
        chain.tokens.forEach((token) => {
          allTokens.add(token.symbol);
          totalBalance += Number.parseFloat(token.usdValue.replace(/,/g, ""));
        });
      }
    });

    return {
      totalBalance,
      totalTokens: allTokens.size,
      activeChains: chainData.filter((c) => c.status === "success").length,
    };
  };

  const stats = calculateStats();

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Voucher Balances
              </h1>
              <p className="text-gray-600 dark:text-neutral-400 mt-1">
                View your balances across all supported chains
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-neutral-400">
              Last updated: {time}
              <span className="ml-2 text-xs text-gray-500 dark:text-neutral-500">
                (Auto-refresh every {AUTO_REFRESH_INTERVAL / 1000}s)
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {globalError && (
          <ErrorAlert
            message={globalError}
            onDismiss={() => setGlobalError(null)}
          />
        )}

        {/* Summary Cards */}
        {!isLoading && (
          <SummaryCard
            totalBalance={stats.totalBalance}
            totalTokens={stats.totalTokens}
            activeChains={stats.activeChains}
          />
        )}

        {/* Chain-Grouped Balances */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Balances by Chain
          </h2>
          <div className="space-y-4">
            {chainData.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-neutral-400">
                No voucher balances found. Please check your address and try
                again.
              </div>
            ) : (
              chainData.map((chain) => (
                <Balance
                  key={chain.chainId}
                  chain={chain.chain}
                  chainId={chain.chainId}
                  status={chain.status}
                  tokens={chain.tokens}
                  errorMessage={chain.errorMessage}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
