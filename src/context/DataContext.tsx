import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Customer {
  id: string;
  name: string;
  village: string;
  phoneNumber: string;
  fatherHusbandName: string;
  fatherHusbandVillage: string;
  image?: string;
  description?: string;
  createdAt: string;
}

export interface Ornament {
  id: string;
  billId: string;
  name: string;
  type: 'gold' | 'silver';
  grossWeight: number;
  netWeight: number;
  interest: number;
  image?: string;
}

export interface Bill {
  id: string;
  billId: string;
  customerId: string;
  customerName: string;
  amount: number;
  interestRate: number;
  status: 'active' | 'released' | 'cleared';
  createdAt: string;
  releasedAt?: string;
  clearedAt?: string;
  releaseImage?: string;
  totalInterestPaid: number;
  extraAmountPaid: number;
  releaseAccountId?: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank';
  balance: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  billId: string;
  customerId: string;
  customerName: string;
  type: 'bill_created' | 'interest_paid' | 'extra_amount' | 'bill_modified' | 'bill_released' | 'bill_cleared';
  amount: number;
  description: string;
  date: string;
  accountId?: string;
}

interface DataContextType {
  customers: Customer[];
  bills: Bill[];
  ornaments: Ornament[];
  transactions: Transaction[];
  accounts: Account[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  addBill: (bill: Omit<Bill, 'id' | 'createdAt' | 'totalInterestPaid' | 'extraAmountPaid'>) => string;
  updateBill: (id: string, bill: Partial<Bill>) => void;
  addOrnaments: (ornaments: Omit<Ornament, 'id'>[]) => void;
  updateOrnament: (id: string, ornament: Partial<Ornament>) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  addAccount: (account: Omit<Account, 'id' | 'createdAt' | 'balance'>) => void;
  updateAccount: (id: string, account: Partial<Account>) => void;
  getCustomerBills: (customerId: string) => Bill[];
  getBillOrnaments: (billId: string) => Ornament[];
  getTodayTransactions: () => Transaction[];
  getTransactionsByDateRange: (startDate: Date, endDate: Date) => Transaction[];
  getAccountTransactions: (accountId: string) => Transaction[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [ornaments, setOrnaments] = useState<Ornament[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    const savedCustomers = localStorage.getItem('pawn_customers');
    const savedBills = localStorage.getItem('pawn_bills');
    const savedOrnaments = localStorage.getItem('pawn_ornaments');
    const savedTransactions = localStorage.getItem('pawn_transactions');
    const savedAccounts = localStorage.getItem('pawn_accounts');

    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
    if (savedBills) setBills(JSON.parse(savedBills));
    if (savedOrnaments) setOrnaments(JSON.parse(savedOrnaments));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedAccounts) setAccounts(JSON.parse(savedAccounts));
  }, []);

  useEffect(() => {
    localStorage.setItem('pawn_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('pawn_bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('pawn_ornaments', JSON.stringify(ornaments));
  }, [ornaments]);

  useEffect(() => {
    localStorage.setItem('pawn_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('pawn_accounts', JSON.stringify(accounts));
  }, [accounts]);

  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setCustomers([...customers, newCustomer]);
  };

  const updateCustomer = (id: string, customer: Partial<Customer>) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, ...customer } : c));
  };

  const addBill = (bill: Omit<Bill, 'id' | 'createdAt' | 'totalInterestPaid' | 'extraAmountPaid'>) => {
    const newBill: Bill = {
      ...bill,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      totalInterestPaid: 0,
      extraAmountPaid: 0,
    };
    setBills([...bills, newBill]);
    
    addTransaction({
      billId: newBill.billId,
      customerId: newBill.customerId,
      customerName: newBill.customerName,
      type: 'bill_created',
      amount: newBill.amount,
      description: `Bill ${newBill.billId} created`,
    });

    return newBill.id;
  };

  const updateBill = (id: string, bill: Partial<Bill>) => {
    setBills(bills.map(b => b.id === id ? { ...b, ...bill } : b));
  };

  const addOrnaments = (newOrnaments: Omit<Ornament, 'id'>[]) => {
    const ornamentsWithIds = newOrnaments.map(o => ({
      ...o,
      id: `${Date.now()}-${Math.random()}`,
    }));
    setOrnaments([...ornaments, ...ornamentsWithIds]);
  };

  const updateOrnament = (id: string, ornament: Partial<Ornament>) => {
    setOrnaments(ornaments.map(o => o.id === id ? { ...o, ...ornament } : o));
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    setTransactions([...transactions, newTransaction]);
  };

  const getCustomerBills = (customerId: string) => {
    return bills.filter(b => b.customerId === customerId);
  };

  const getBillOrnaments = (billId: string) => {
    return ornaments.filter(o => o.billId === billId);
  };

  const getTodayTransactions = () => {
    const today = new Date().toDateString();
    return transactions.filter(t => new Date(t.date).toDateString() === today);
  };

  const getTransactionsByDateRange = (startDate: Date, endDate: Date) => {
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const addAccount = (account: Omit<Account, 'id' | 'createdAt' | 'balance'>) => {
    const newAccount: Account = {
      ...account,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      balance: 0,
    };
    setAccounts([...accounts, newAccount]);
  };

  const updateAccount = (id: string, account: Partial<Account>) => {
    setAccounts(accounts.map(a => a.id === id ? { ...a, ...account } : a));
  };

  const getAccountTransactions = (accountId: string) => {
    return transactions.filter(t => t.accountId === accountId);
  };

  return (
    <DataContext.Provider
      value={{
        customers,
        bills,
        ornaments,
        transactions,
        accounts,
        addCustomer,
        updateCustomer,
        addBill,
        updateBill,
        addOrnaments,
        updateOrnament,
        addTransaction,
        addAccount,
        updateAccount,
        getCustomerBills,
        getBillOrnaments,
        getTodayTransactions,
        getTransactionsByDateRange,
        getAccountTransactions,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};
