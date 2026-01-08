"use client";
import { ErrorAlert } from "./error";
import { useState, useEffect, useRef } from "react";
import { RefreshCw } from "lucide-react";

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

const VoucherBalancePage = () => {
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
  const [chainData, setChainData] = useState<ChainData[]>(mockChainData);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [globalError, setGlobalError] = useState<string | null>(null);
  const autoRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const refreshAbortControllerRef = useRef<AbortController | null>(null);
  const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds
  const fetchVoucherBalances = async (signal?: AbortSignal) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setChainData(mockChainData);
      setGlobalError(null);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("[v0] Refresh cancelled");
        return;
      }

      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch balances";
      setGlobalError(errorMessage);
      console.error("[v0] Fetch error:", error);
    }
  };
  const handleRefresh = async () => {
    // Cancel any pending refresh
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
    // Initial fetch on mount
    handleRefresh();

    // Set up auto-refresh interval
    autoRefreshIntervalRef.current = setInterval(() => {
      console.log("[v0] Auto-refreshing balances");
      fetchVoucherBalances()
        .then(() => setLastUpdated(new Date()))
        .catch((error) => console.error("[v0] Auto-refresh error:", error));
    }, AUTO_REFRESH_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
      if (refreshAbortControllerRef.current) {
        refreshAbortControllerRef.current.abort();
      }
    };
  }, []);
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Voucher Balances
              </h1>
              <p className="text-muted-foreground mt-1">
                View your balances across all supported chains
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="gap-2 bg-transparent"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              {/* Last updated: {lastUpdated.toLocaleTimeString()} */}
              <span className="ml-2 text-xs text-muted-foreground/60">
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
      </div>
    </main>
  );
};

export default VoucherBalancePage;
