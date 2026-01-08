interface SummaryStats {
  totalBalance: number
  totalTokens: number
  activeChains: number
}

const SummaryCard = ({ totalBalance, totalTokens, activeChains }: SummaryStats) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Total Balance Card */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Total Balance</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">${totalBalance.toFixed(2)}</p>
        <p className="text-xs text-gray-600 dark:text-neutral-400 mt-2">Across all chains</p>
      </div>

      {/* Total Tokens Card */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border border-purple-200 dark:border-purple-700 rounded-lg p-6">
        <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">Unique Tokens</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalTokens}</p>
        <p className="text-xs text-gray-600 dark:text-neutral-400 mt-2">Different token types</p>
      </div>

      {/* Active Chains Card */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border border-green-200 dark:border-green-700 rounded-lg p-6">
        <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">Active Chains</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{activeChains}</p>
        <p className="text-xs text-gray-600 dark:text-neutral-400 mt-2">Networks with balance</p>
      </div>
    </div>
  )
}

export default SummaryCard
