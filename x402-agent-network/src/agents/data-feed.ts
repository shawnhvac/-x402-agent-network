/**
 * agents/data-feed.ts - Data Feed Agent (Price Oracle)
 * Real-time price feeds for multiple cryptocurrency pairs
 * 
 * Cost: 0.01 USDC per price point
 * Purpose: Demonstrate x402 works for data agents (not just trading)
 */

import type { AgentExecutionRequest, AgentExecutionResult, AgentStatus } from "../AgentSpec.js";

interface PriceDataRequest {
  symbol: "ETH/USD" | "BTC/USD" | "SOL/USD" | "ARB/USD" | "AVAX/USD";
  includeHistory?: boolean;
  historyLength?: number; // Last N price points
}

interface PricePoint {
  symbol: string;
  price: number;
  timestamp: string;
  source: string;
  confidence: number;
}

interface DataFeedResponse {
  symbol: string;
  currentPrice: PricePoint;
  change24h: number;
  change24hPercent: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  history?: PricePoint[];
  cost: number;
}

/**
 * Data Feed Agent Implementation
 * Simulates real-time price oracle data
 */
export class DataFeedAgent {
  agentId = "data-feed-v1";
  name = "Data Feed Agent (Price Oracle)";
  description = "Real-time cryptocurrency price feeds with historical data";
  endpoint = "/data-feed";
  baseCostPerPoint = 0.01; // USDC per price point
  supportedChains = ["base", "solana", "polygon"];
  supportedSymbols = ["ETH/USD", "BTC/USD", "SOL/USD", "ARB/USD", "AVAX/USD"];

  // Simulated price data (in production, fetch from CoinGecko, Chainlink, etc.)
  private priceData: { [key: string]: { price: number; volatility: number } } = {
    "ETH/USD": { price: 3245.78, volatility: 0.02 },
    "BTC/USD": { price: 68432.45, volatility: 0.015 },
    "SOL/USD": { price: 142.56, volatility: 0.025 },
    "ARB/USD": { price: 1.35, volatility: 0.03 },
    "AVAX/USD": { price: 38.92, volatility: 0.025 },
  };

  /**
   * Execute price feed request
   */
  async execute(request: AgentExecutionRequest): Promise<AgentExecutionResult> {
    try {
      const input = request.input || request;
      const { symbol, includeHistory = false, historyLength = 10 } = input as any;

      // Validation
      if (!symbol || !this.supportedSymbols.includes(symbol)) {
        throw new Error(
          `Unsupported symbol: ${symbol}. Supported: ${this.supportedSymbols.join(", ")}`
        );
      }

      if (historyLength > 100) {
        throw new Error("History length cannot exceed 100");
      }

      // Get current price
      const priceInfo = this.priceData[symbol];
      const currentPrice = this.simulatePriceWithVolatility(priceInfo.price, priceInfo.volatility);

      // Calculate 24h metrics
      const previousPrice = priceInfo.price * (0.98 + Math.random() * 0.04); // Simulate 24h change
      const change24h = currentPrice - previousPrice;
      const change24hPercent = (change24h / previousPrice) * 100;
      const high24h = currentPrice * (1 + Math.abs(Math.random() * 0.03));
      const low24h = currentPrice * (1 - Math.abs(Math.random() * 0.03));
      const volume24h = Math.random() * 1000000000; // Simulate volume

      // Generate history if requested
      const history = includeHistory ? this.generatePriceHistory(symbol, historyLength) : undefined;

      // Calculate cost
      let totalCost = this.baseCostPerPoint; // 1 point (current price)
      if (includeHistory) {
        totalCost += this.baseCostPerPoint * historyLength;
      }

      const output: DataFeedResponse = {
        symbol,
        currentPrice: {
          symbol,
          price: parseFloat(currentPrice.toFixed(2)),
          timestamp: new Date().toISOString(),
          source: "MUSKOX Oracle Network",
          confidence: 0.99,
        },
        change24h: parseFloat(change24h.toFixed(2)),
        change24hPercent: parseFloat(change24hPercent.toFixed(2)),
        high24h: parseFloat(high24h.toFixed(2)),
        low24h: parseFloat(low24h.toFixed(2)),
        volume24h: parseFloat(volume24h.toFixed(0)),
        history,
        cost: parseFloat(totalCost.toFixed(6)),
      };

      return {
        success: true,
        executionId: `feed-${Date.now()}`,
        output,
        executionTime: Math.random() * 200 + 50, // 50-250ms
      };
    } catch (err: any) {
      return {
        success: false,
        executionId: `feed-${Date.now()}`,
        error: err.message || "Data feed execution failed",
        executionTime: 50,
      };
    }
  }

  /**
   * Estimate cost before execution
   */
  estimateCost(input?: any): { cost: number; currency: string; executionTime: number } {
    try {
      const { symbol, includeHistory = false, historyLength = 10 } = input || {};

      if (!symbol) {
        // Default estimate
        return {
          cost: 0.01,
          currency: "USDC",
          executionTime: 100,
        };
      }

      let totalCost = this.baseCostPerPoint; // Current price
      if (includeHistory) {
        totalCost += this.baseCostPerPoint * Math.min(historyLength, 100);
      }

      return {
        cost: parseFloat(totalCost.toFixed(6)),
        currency: "USDC",
        executionTime: 100,
      };
    } catch (err) {
      return {
        cost: 0.01,
        currency: "USDC",
        executionTime: 100,
      };
    }
  }

  /**
   * Get agent status
   */
  getStatus(): AgentStatus {
    return {
      agentId: this.agentId,
      name: this.name,
      status: "healthy",
      uptime: 99.98,
      successCount: Math.floor(Math.random() * 5000),
      failureCount: Math.floor(Math.random() * 10),
      avgExecutionTime: 120,
      lastExecution: new Date(Date.now() - Math.random() * 60000).toISOString(),
    };
  }

  /**
   * Internal: Simulate price with volatility
   */
  private simulatePriceWithVolatility(basePrice: number, volatility: number): number {
    const change = (Math.random() - 0.5) * 2 * volatility;
    return basePrice * (1 + change);
  }

  /**
   * Internal: Generate price history
   */
  private generatePriceHistory(symbol: string, length: number): PricePoint[] {
    const basePrice = this.priceData[symbol].price;
    const volatility = this.priceData[symbol].volatility;
    const history: PricePoint[] = [];

    let currentPrice = basePrice;
    for (let i = length; i > 0; i--) {
      currentPrice = this.simulatePriceWithVolatility(currentPrice, volatility);
      const timestamp = new Date(Date.now() - i * 60000); // Each point is 1 minute apart

      history.push({
        symbol,
        price: parseFloat(currentPrice.toFixed(2)),
        timestamp: timestamp.toISOString(),
        source: "MUSKOX Oracle Network",
        confidence: 0.99,
      });
    }

    return history;
  }
}

// Export singleton instance
export const dataFeed = new DataFeedAgent();
