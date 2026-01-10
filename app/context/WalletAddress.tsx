"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { ethers } from "ethers";

interface AccountType {
  address?: string;
  balance?: string;
  chainId?: string;
  network?: string;
}

declare global {
  interface Window {
    ethereum: any;
  }
}

interface WalletContextType {
  accountData: AccountType;
  connectWallet: () => Promise<void>;
}

export const WalletContext = createContext<WalletContextType | undefined>(
  undefined
);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [accountData, setAccountData] = useState<AccountType>({});
  console.log("Account Data: ", accountData);
  const connectWallet = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("MetaMask not installed");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        const address = accounts[0];
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(address);
        const network = await provider.getNetwork();

        setAccountData({
          address,
          balance: ethers.formatEther(balance),
          chainId: network.chainId.toString(),
          network: network.name,
        });

        console.log("Connected to MetaMask:", address);
      }
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
    }
  }, []);

  const updateAccount = useCallback(async (accounts: string[]) => {
    if (accounts.length > 0) {
      const address = accounts[0];
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      const network = await provider.getNetwork();

      setAccountData({
        address,
        balance: ethers.formatEther(balance),
        chainId: network.chainId.toString(),
        network: network.name,
      });
    } else {
      setAccountData({});
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", updateAccount);
      window.ethereum.on("chainChanged", () => window.location.reload());

      return () => {
        window.ethereum.removeListener("accountsChanged", updateAccount);
      };
    }
  }, [updateAccount]);

  return (
    <WalletContext.Provider value={{ accountData, connectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
