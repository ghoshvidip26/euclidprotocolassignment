interface Token {
  symbol: string;
  balance: string;
  decimals: number;
  usdValue: string;
}

interface ChainData {
  chain: string;
  chainId: number;
  status: "success" | "error" | "loading";
  tokens: Token[];
  errorMessage?: string;
}

const Balance = (props: ChainData) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "loading":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "success":
        return "Ready";
      case "error":
        return "Failed";
      case "loading":
        return "Loading";
      default:
        return "Unknown";
    }
  };

  const totalBalance = props.tokens.reduce(
    (sum, token) => sum + Number.parseFloat(token.usdValue.replace(/,/g, "")),
    0
  );

  return (
    <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-5 mb-4">
      {/* Chain Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {props.chain}
            </h3>
            <p className="text-xs text-gray-500 dark:text-neutral-400">
              Chain ID: {props.chainId}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
            props.status
          )}`}
        >
          {getStatusText(props.status)}
        </span>
      </div>

      {/* Error Message */}
      {props.status === "error" && props.errorMessage && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
          {props.errorMessage}
        </div>
      )}

      {/* Tokens Table */}
      {props.status === "success" && props.tokens.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-neutral-700">
                <th className="text-left py-3 px-2 font-medium text-gray-600 dark:text-neutral-300">
                  Token
                </th>
                <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-neutral-300">
                  Balance
                </th>
                <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-neutral-300">
                  USD Value
                </th>
              </tr>
            </thead>
            <tbody>
              {props.tokens.map((token, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-100 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700/50"
                >
                  <td className="py-3 px-2 font-medium text-gray-900 dark:text-white">
                    {token.symbol}
                  </td>
                  <td className="text-right py-3 px-2 text-gray-700 dark:text-neutral-300">
                    {token.balance}
                  </td>
                  <td className="text-right py-3 px-2 font-semibold text-gray-900 dark:text-white">
                    ${token.usdValue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-700 flex justify-between items-center">
            <span className="font-medium text-gray-700 dark:text-neutral-300">
              Chain Total
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              ${totalBalance.toFixed(2)}
            </span>
          </div>
        </div>
      ) : props.status === "loading" ? (
        <div className="py-8 text-center text-gray-500 dark:text-neutral-400">
          Loading balances...
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500 dark:text-neutral-400">
          No tokens found on this chain
        </div>
      )}
    </div>
  );
};

export default Balance;
