
import { useDatabaseConnection } from "./useDatabaseConnection";

/**
 * @deprecated Use useDatabaseConnection from useDatabaseConnection instead
 */
export const useFirestoreConnection = useDatabaseConnection;
export default useDatabaseConnection;

// Re-export types for backward compatibility
export type { DatabaseConnectionStatus } from "./useDatabaseConnection";
