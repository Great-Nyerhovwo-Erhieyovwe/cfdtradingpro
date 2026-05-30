/**
 * useDashboard Hook
 * =================
 * 
 * Custom React hook for managing dashboard data fetching
 * Handles:
 * - User profile data
 * - Portfolio metrics
 * - Transactions
 * - Notifications
 * - Real-time updates
 */

import { useState, useEffect } from 'react';
import { fetchJson } from '../api/client';

/**
 * User Profile Interface
 * Represents authenticated user's profile information
 */
interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  country: string;
  currency: string;
  accountType: string;
  emailVerified: boolean;
  createdAt: string;
  role: string;
}

/**
 * Portfolio Interface
 * Represents user's trading portfolio and balance
 */
interface Portfolio {
  totalBalance: number;
  balanceUsd: number;
  roi: number;
  activeTradesCount: number;
  activeInvestments: number;
  openPositions: Array<{
    symbol: string;
    amount: number;
    value: number;
    entryPrice: number;
    currentPrice: number;
    change: number;
  }>;
}

/**
 * Transaction Interface
 * Represents a single transaction (trade, deposit, withdrawal)
 */
interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'deposit' | 'withdrawal';
  symbol: string;
  amount: number;
  price: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

/**
 * Notification Interface
 * Represents a notification/alert for user
 */
interface Notification {
  id: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

/**
 * Dashboard Stats Interface
 * Summary statistics for dashboard
 */
interface DashboardStats {
  active_trades_count: number;
  active_investments: number;
  totalBalance: number;
  activeTradesCount: number;
  roi: number;
  activeInvestments: number;
  monthlyProfit: number;
  lastTransactionDate: string | null;
}

// const backendUrl =
//   import.meta.env.VITE_API_URL || "http://localhost:4000";

/**
 * useDashboard Hook
 * 
 * Fetches all dashboard data from backend API
 * Uses JWT token from localStorage for authentication
 * 
 * @returns {Object} Dashboard data and loading/error states
 * 
 * Example usage:
 * ```tsx
 * const { user, portfolio, transactions, stats, loading, error } = useDashboard();
 * 
 * if (loading) return <Spinner />;
 * if (error) return <ErrorMessage error={error} />;
 * 
 * return (
 *   <Dashboard>
 *     <Header user={user} />
 *     <PortfolioCard portfolio={portfolio} />
 *     <StatsCards stats={stats} />
 *   </Dashboard>
 * );
 * ```
 */
export function useDashboard() {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  // User profile data
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // Portfolio metrics
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  
  // Transaction history
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Summary statistics
  const [stats, setStats] = useState<DashboardStats | null>(null);
  
  // Loading state
  const [loading, setLoading] = useState(true);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // API CALL FUNCTIONS
  // ============================================

  /**
   * Fetch user profile from backend
   * GET /api/dashboard/user
   */
  const fetchUser = async () => {
    try {
      const data = await fetchJson('/api/dashboard/user', {
        method: 'GET',
      });
      setUser(data);
      return data;
    } catch (err) {
      console.error('Error fetching user:', err);
      throw err;
    }
  };

  /**
   * Fetch portfolio metrics from backend
   * GET /api/dashboard/portfolio
   */
  const fetchPortfolio = async () => {
    try {
      const data = await fetchJson('/api/dashboard/portfolio', {
        method: 'GET',
      });
      setPortfolio(data);
      return data;
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      throw err;
    }
  };

  /**
   * Fetch transaction history from backend
   * GET /api/requests/deposits and /api/requests/withdrawals
   */
  const fetchTransactions = async (_token?: string, limit = 50, offset = 0) => {
    try {
      const userData = await fetchJson('/api/dashboard/user', { method: 'GET' });
      const userCurrency = userData.currency || 'USD';

      console.log('User currency for transactions:', userCurrency);

      const depositsData = await fetchJson('/api/requests/deposits', { method: 'GET' });
      const withdrawalsData = await fetchJson('/api/requests/withdrawals', { method: 'GET' });

      // Transform deposits to Transaction format
      const deposits = (depositsData.deposits || []).map((d: any) => ({
        id: d.id,
        type: 'deposit' as const,
        symbol: d.paymentMethod || d.payment_method || 'Bank Transfer',
        amount: parseFloat(d.amount.replace(/[^0-9.-]+/g, '')), // Parse formatted currency
        price: 0,
        date: d.requestedAt || d.createdAt,
        status: d.status === 'approved' ? 'completed' : d.status === 'pending' ? 'pending' : 'failed',
        formattedAmount: d.amount // Keep the formatted version
      }));

      // Transform withdrawals to Transaction format
      const withdrawals = (withdrawalsData.withdrawals || []).map((w: any) => ({
        id: w.id,
        type: 'withdrawal' as const,
        symbol: w.withdrawalMethod || w.withdrawal_method || 'Bank Transfer',
        amount: parseFloat(w.amount.replace(/[^0-9.-]+/g, '')), // Parse formatted currency
        price: 0,
        date: w.requestedAt || w.createdAt,
        status: w.status === 'approved' ? 'completed' : w.status === 'pending' ? 'pending' : 'failed',
        formattedAmount: w.amount // Keep the formatted version
      }));

      // Combine and sort by date (most recent first)
      const allTransactions = [...deposits, ...withdrawals].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // Apply limit and offset
      const paginatedTransactions = allTransactions.slice(offset, offset + limit);

      setTransactions(paginatedTransactions);
      return { transactions: paginatedTransactions, total: allTransactions.length };
    } catch (err) {
      console.error('Error fetching transactions:', err);
      throw err;
    }
  };

  /**
   * Fetch notifications from backend
   * GET /api/dashboard/notifications?unreadOnly=false
   */
  const fetchNotifications = async (_token?: string, unreadOnly = false) => {
    try {
      const data = await fetchJson(`/api/dashboard/notifications?unreadOnly=${unreadOnly}`, {
        method: 'GET',
      });
      setNotifications(data.notifications || []);
      return data;
    } catch (err) {
      console.error('Error fetching notifications:', err);
      throw err;
    }
  };

  /**
   * Fetch dashboard statistics from backend
   * GET /api/dashboard/stats
   */
  const fetchStats = async () => {
    try {
      const data = await fetchJson('/api/dashboard/stats', {
        method: 'GET',
      });
      setStats(data);
      return data;
    } catch (err) {
      console.error('Error fetching stats:', err);
      throw err;
    }
  };

  // ============================================
  // MAIN EFFECT: FETCH ALL DATA ON MOUNT
  // ============================================

  /**
   * useEffect hook:
   * - Runs once when component mounts (empty dependency array)
   * - Retrieves JWT token from localStorage
   * - Fetches all dashboard data in parallel
   * - Sets loading and error states
   */
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        await Promise.all([
          fetchUser(),
          fetchPortfolio(),
          fetchTransactions(),
          fetchNotifications(),
          fetchStats(),
        ]);

        setLoading(false);
      } catch (err) {
        console.error('Dashboard initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
        setLoading(false);
      }
    };

    initializeDashboard();
  }, []); // Empty dependency array = run once on mount

  // ============================================
  // RETURN STATE AND FUNCTIONS
  // ============================================

  return {
    // Data
    user,
    portfolio,
    transactions,
    notifications,
    stats,
    
    // States
    loading,
    error,
    
    // Refetch functions (for manual updates)
    refetch: {
      user: () => fetchUser(),
      portfolio: () => fetchPortfolio(),
      transactions: () => fetchTransactions(),
      notifications: () => fetchNotifications(),
      stats: () => fetchStats(),
    }
  };
}

export type { UserProfile, Portfolio, Transaction, Notification, DashboardStats };








// ==============================================
// ============= OR =============================
// ==============================================
// /**
//  * useDashboard Hook
//  * =================
//  * 
//  * Custom React hook for managing dashboard data fetching
//  * Handles:
//  * - User profile data
//  * - Portfolio metrics
//  * - Transactions
//  * - Notifications
//  * - Real-time updates
//  */

// import { useState, useEffect } from 'react';

// /**
//  * User Profile Interface
//  * Represents authenticated user's profile information
//  */
// interface UserProfile {
//   id: string;
//   email: string;
//   firstName: string;
//   lastName: string;
//   username: string;
//   country: string;
//   currency: string;
//   accountType: string;
//   emailVerified: boolean;
//   createdAt: string;
//   role: string;
// }

// /**
//  * Portfolio Interface
//  * Represents user's trading portfolio and balance
//  */
// interface Portfolio {
//   totalBalance: number;
//   balanceUsd: number;
//   roi: number;
//   activeTradesCount: number;
//   activeInvestments: number;
//   openPositions: Array<{
//     symbol: string;
//     amount: number;
//     value: number;
//     entryPrice: number;
//     currentPrice: number;
//     change: number;
//   }>;
// }

// /**
//  * Transaction Interface
//  * Represents a single transaction (trade, deposit, withdrawal)
//  */
// interface Transaction {
//   id: string;
//   type: 'buy' | 'sell' | 'deposit' | 'withdrawal';
//   symbol: string;
//   amount: number;
//   price: number;
//   date: string;
//   status: 'completed' | 'pending' | 'failed';
// }

// /**
//  * Notification Interface
//  * Represents a notification/alert for user
//  */
// interface Notification {
//   id: string;
//   type: 'alert' | 'info' | 'success' | 'warning';
//   title: string;
//   message: string;
//   timestamp: string;
//   read: boolean;
// }

// /**
//  * Dashboard Stats Interface
//  * Summary statistics for dashboard
//  */
// interface DashboardStats {
//   active_trades_count: number;
//   active_investments: number;
//   totalBalance: number;
//   activeTradesCount: number;
//   roi: number;
//   activeInvestments: number;
//   monthlyProfit: number;
//   lastTransactionDate: string | null;
// }

// const backendUrl =
//   import.meta.env.VITE_API_URL || "http://localhost:4000";

// /**
//  * useDashboard Hook
//  * 
//  * Fetches all dashboard data from backend API
//  * Uses JWT token from localStorage for authentication
//  * 
//  * @returns {Object} Dashboard data and loading/error states
//  * 
//  * Example usage:
//  * ```tsx
//  * const { user, portfolio, transactions, stats, loading, error } = useDashboard();
//  * 
//  * if (loading) return <Spinner />;
//  * if (error) return <ErrorMessage error={error} />;
//  * 
//  * return (
//  *   <Dashboard>
//  *     <Header user={user} />
//  *     <PortfolioCard portfolio={portfolio} />
//  *     <StatsCards stats={stats} />
//  *   </Dashboard>
//  * );
//  * ```
//  */
// export function useDashboard() {
//   // ============================================
//   // STATE MANAGEMENT
//   // ============================================

//   // User profile data
//   const [user, setUser] = useState<UserProfile | null>(null);

//   // Portfolio metrics
//   const [portfolio, setPortfolio] = useState<Portfolio | null>(null);

//   // Transaction history
//   const [transactions, setTransactions] = useState<Transaction[]>([]);

//   // Notifications
//   const [notifications, setNotifications] = useState<Notification[]>([]);

//   // Summary statistics
//   const [stats, setStats] = useState<DashboardStats | null>(null);

//   // Loading state
//   const [loading, setLoading] = useState(true);

//   // Error state
//   const [error, setError] = useState<string | null>(null);


//   // ============================================
//   // FETCH USER AUTH HELPER
//   // ============================================
//   const fetchWithAuth = async (url: string) => {
//     const token = localStorage.getItem('token');
//     if (!token) throw new Error('No authentication token found');

//     const res = await fetch(url, {
//       headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
//     });

//     if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
//   }

//   // ============================================
//   // API CALL FUNCTIONS
//   // ============================================

//   /**
//    * Fetch user profile from backend
//    * GET /api/dashboard/user
//    */
//   const fetchUser = async () => (await fetchWithAuth(`${backendUrl}/api/dashboard/user`));

//   /**
//    * Fetch portfolio metrics from backend
//    * GET /api/dashboard/portfolio
//    */
//   // const fetchPortfolio = async () => setUser(await fetchWithAuth(`${backendUrl}/api/dashboard/user`));
//   const fetchPortfolio = async () =>
//     setPortfolio(await fetchWithAuth(`${backendUrl}/api/dashboard/portfolio`));

//   /**
//    * Fetch transaction history from backend
//    * GET /api/dashboard/transactions?limit=50&offset=0
//    */
//   const fetchTransactions = async (limit = 50, offset = 0) => setTransactions(
//     await fetchWithAuth(
//       `${backendUrl} / api / dashboard / transactions ? limit = ${limit} & offset=${offset}`
//     )).transactions || []

//   /**
//    * Fetch notifications from backend
//    * GET /api/dashboard/notifications?unreadOnly=false
//    */
//   const fetchNotifications = async (unreadOnly = false) => setNotifications(
//     (await fetchWithAuth(
//       `${backendUrl}/api/dashboard/notifications?unreadOnly=${unreadOnly}`
//     )).notifications || []
//   );

//   /**
//    * Fetch dashboard statistics from backend
//    * GET /api/dashboard/stats
//    */
//   const fetchStats = async () => setStats(
//     await fetchWithAuth(
//       `${backendUrl}/api/dashboard/stats`
//     ));

//   // ============================================
//   // MAIN EFFECT: FETCH ALL DATA ON MOUNT
//   // ============================================

//   /**
//    * useEffect hook:
//    * - Runs once when component mounts (empty dependency array)
//    * - Retrieves JWT token from localStorage
//    * - Fetches all dashboard data in parallel
//    * - Sets loading and error states
//    */
//   useEffect(() => {
//     const initializeDashboard = async () => {
//       try {
//         // Get JWT token from localStorage (set during login)
//         // const token = localStorage.getItem('token');
//         //         if (!token) {
//         //           // User not logged in, redirect to login page
//         //           setError('No authentication token found');
//         //           setLoading(false);
//         // window.location.href = "/login";
//         //           return;
//         //         }

//         // Fetch all dashboard data in parallel using Promise.all
//         // This is more efficient than fetching sequentially
//         await Promise.all([
//           fetchUser(),
//           fetchPortfolio(),
//           fetchTransactions(),
//           fetchNotifications(),
//           fetchStats(),
//         ])

//         // setLoading(false);
//       } catch (err) {
//         // Handle errors from any of the fetches
//         console.error('Dashboard initialization error:', err);
//         setError(err instanceof Error ? err.message : 'Failed to load dashboard');
//       } finally {
//         setLoading(false);
//       }
//     };

//     initializeDashboard();
//   }, []); // Empty dependency array = run once on mount

//   // ============================================
//   // RETURN STATE AND FUNCTIONS
//   // ============================================

//   return {
//     // Data
//     user,
//     portfolio,
//     transactions,
//     notifications,
//     stats,

//     // States
//     loading,
//     error,

//     // Refetch functions (for manual updates)
//     refetch: {
//       user: fetchUser,
//       portfolio: fetchPortfolio,
//       transactions: fetchTransactions,
//       notifications: fetchNotifications,
//       stats: fetchStats
//     },
//   };
// }

// export type { UserProfile, Portfolio, Transaction, Notification, DashboardStats };
