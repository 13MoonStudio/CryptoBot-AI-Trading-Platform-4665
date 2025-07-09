import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useApp } from './AppContext';
import toast from 'react-hot-toast';

const WalletContext = createContext();

const initialState = {
  isConnected: false,
  walletType: null, // 'metamask', 'phantom', 'debit'
  address: null,
  balance: 0,
  network: null,
  isConnecting: false,
  supportedWallets: ['metamask', 'phantom', 'debit'],
};

function walletReducer(state, action) {
  switch (action.type) {
    case 'SET_CONNECTING':
      return { ...state, isConnecting: action.payload };
    case 'CONNECT_WALLET':
      return {
        ...state,
        isConnected: true,
        walletType: action.payload.type,
        address: action.payload.address,
        network: action.payload.network,
        isConnecting: false,
      };
    case 'DISCONNECT_WALLET':
      return {
        ...state,
        isConnected: false,
        walletType: null,
        address: null,
        balance: 0,
        network: null,
        isConnecting: false,
      };
    case 'UPDATE_BALANCE':
      return { ...state, balance: action.payload };
    default:
      return state;
  }
}

export function WalletProvider({ children }) {
  const [state, dispatch] = useReducer(walletReducer, initialState);
  const { addNotification } = useApp();

  // Check for existing wallet connection on mount
  useEffect(() => {
    checkExistingConnection();
  }, []);

  const checkExistingConnection = async () => {
    try {
      // Check MetaMask
      if (window.ethereum && window.ethereum.selectedAddress) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          dispatch({
            type: 'CONNECT_WALLET',
            payload: {
              type: 'metamask',
              address: accounts[0],
              network: 'ethereum',
            },
          });
        }
      }

      // Check Phantom
      if (window.solana && window.solana.isConnected) {
        dispatch({
          type: 'CONNECT_WALLET',
          payload: {
            type: 'phantom',
            address: window.solana.publicKey.toString(),
            network: 'solana',
          },
        });
      }
    } catch (error) {
      console.error('Error checking existing connection:', error);
    }
  };

  const connectMetaMask = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast.error('MetaMask is not installed. Please install it to continue.');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    dispatch({ type: 'SET_CONNECTING', payload: true });

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        dispatch({
          type: 'CONNECT_WALLET',
          payload: {
            type: 'metamask',
            address: accounts[0],
            network: 'ethereum',
          },
        });

        addNotification({
          type: 'success',
          title: 'MetaMask Connected',
          message: `Connected to ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`,
        });

        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length === 0) {
            disconnectWallet();
          } else {
            dispatch({
              type: 'CONNECT_WALLET',
              payload: {
                type: 'metamask',
                address: accounts[0],
                network: 'ethereum',
              },
            });
          }
        });
      }
    } catch (error) {
      console.error('MetaMask connection error:', error);
      toast.error('Failed to connect MetaMask. Please try again.');
      dispatch({ type: 'SET_CONNECTING', payload: false });
    }
  };

  const connectPhantom = async () => {
    if (!window.solana || !window.solana.isPhantom) {
      toast.error('Phantom wallet is not installed. Please install it to continue.');
      window.open('https://phantom.app/', '_blank');
      return;
    }

    dispatch({ type: 'SET_CONNECTING', payload: true });

    try {
      const response = await window.solana.connect();
      
      dispatch({
        type: 'CONNECT_WALLET',
        payload: {
          type: 'phantom',
          address: response.publicKey.toString(),
          network: 'solana',
        },
      });

      addNotification({
        type: 'success',
        title: 'Phantom Connected',
        message: `Connected to ${response.publicKey.toString().substring(0, 8)}...`,
      });

      // Listen for disconnect
      window.solana.on('disconnect', () => {
        disconnectWallet();
      });
    } catch (error) {
      console.error('Phantom connection error:', error);
      toast.error('Failed to connect Phantom wallet. Please try again.');
      dispatch({ type: 'SET_CONNECTING', payload: false });
    }
  };

  const connectDebitCard = async () => {
    dispatch({ type: 'SET_CONNECTING', payload: true });

    try {
      // Simulate debit card connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      dispatch({
        type: 'CONNECT_WALLET',
        payload: {
          type: 'debit',
          address: 'debit-card-account',
          network: 'fiat',
        },
      });

      addNotification({
        type: 'success',
        title: 'Debit Card Connected',
        message: 'Your debit card has been securely connected.',
      });
    } catch (error) {
      console.error('Debit card connection error:', error);
      toast.error('Failed to connect debit card. Please try again.');
      dispatch({ type: 'SET_CONNECTING', payload: false });
    }
  };

  const disconnectWallet = () => {
    dispatch({ type: 'DISCONNECT_WALLET' });
    addNotification({
      type: 'info',
      title: 'Wallet Disconnected',
      message: 'Your wallet has been disconnected.',
    });
  };

  const getBalance = async () => {
    if (!state.isConnected) return 0;

    try {
      switch (state.walletType) {
        case 'metamask':
          const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [state.address, 'latest'],
          });
          const ethBalance = parseInt(balance, 16) / Math.pow(10, 18);
          dispatch({ type: 'UPDATE_BALANCE', payload: ethBalance });
          return ethBalance;

        case 'phantom':
          const connection = new window.solanaWeb3.Connection(
            window.solanaWeb3.clusterApiUrl('mainnet-beta')
          );
          const publicKey = new window.solanaWeb3.PublicKey(state.address);
          const solBalance = await connection.getBalance(publicKey);
          const solBalanceFormatted = solBalance / window.solanaWeb3.LAMPORTS_PER_SOL;
          dispatch({ type: 'UPDATE_BALANCE', payload: solBalanceFormatted });
          return solBalanceFormatted;

        case 'debit':
          // Simulate debit card balance
          const debitBalance = 1000; // Mock balance
          dispatch({ type: 'UPDATE_BALANCE', payload: debitBalance });
          return debitBalance;

        default:
          return 0;
      }
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  };

  const value = {
    ...state,
    connectMetaMask,
    connectPhantom,
    connectDebitCard,
    disconnectWallet,
    getBalance,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};