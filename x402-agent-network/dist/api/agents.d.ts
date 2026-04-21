/**
 * Agents API
 * REST endpoints for agent registration, discovery, and management
 */
declare const router: import("express-serve-static-core").Router;
/**
 * Initialize database connection
 */
export declare function initializeAgentsDB(mongoUrl: string): Promise<void>;
export default router;
