/**
 * Receipts Context
 * Centralized React Context providing receipt data, moments, chapters, and indexes
 * Eliminates prop-drilling across route pages and modals
 */

import { createContext, useContext, type ReactNode } from "react";
import type { Receipt, Connection, LifeMoment, Chapter } from "../types/index";
import { useReceipts } from "../hooks/useReceipts";
import type { buildReceiptIndexes } from "../services/receiptService";

export interface ReceiptsContextValue {
  receipts: Receipt[];
  connections: Connection[];
  moments: LifeMoment[];
  chapters: Chapter[];
  loading: boolean;
  error: string | null;
  indexes: ReturnType<typeof buildReceiptIndexes> | null;
}

const ReceiptsContext = createContext<ReceiptsContextValue | undefined>(undefined);

export function ReceiptsProvider({ children }: { children: ReactNode }) {
  const value = useReceipts();

  return (
    <ReceiptsContext.Provider value={value}>
      {children}
    </ReceiptsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useReceiptsContext(): ReceiptsContextValue {
  const context = useContext(ReceiptsContext);
  if (!context) {
    throw new Error("useReceiptsContext must be used within a ReceiptsProvider");
  }
  return context;
}
