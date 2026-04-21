/**
 * AgentPay MCP Server
 *
 * Claude Model Context Protocol server for autonomous service booking
 * Integrates with AgentPay x402 API for seamless agent-to-service payments
 *
 * Usage:
 *   node dist/mcp-server.js
 *
 * Connects to Claude Desktop, Cursor, or other MCP-compatible clients
 */
import { Server, StdioServerTransport, } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();
// Initialize MCP server
const server = new Server({
    name: "agentpay-mcp",
    version: "1.0.0",
});
const AGENTPAY_API_URL = process.env.AGENTPAY_API_URL || "https://agentpay.com";
// ===== TOOL: Search for services =====
const searchServicesTool = {
    name: "search_services",
    description: "Search for available services by category, location, and date. Returns list of providers with pricing, ratings, and availability.",
    inputSchema: {
        type: "object",
        properties: {
            category: {
                type: "string",
                description: "Service category (salon, restaurant, mechanic, etc)",
            },
            location: {
                type: "string",
                description: "Location (address or coordinates)",
            },
            date: {
                type: "string",
                description: "Desired service date (ISO 8601, optional)",
            },
            duration: {
                type: "integer",
                description: "Service duration in minutes (optional)",
            },
        },
        required: ["category", "location"],
    },
};
// ===== TOOL: Book a service =====
const bookServiceTool = {
    name: "book_service",
    description: "Book a service appointment at a specific time and location. Requires confirmation before payment.",
    inputSchema: {
        type: "object",
        properties: {
            service_id: {
                type: "string",
                description: "Service ID from search results",
            },
            booking_time: {
                type: "string",
                description: "Desired booking time (ISO 8601)",
            },
            customer_wallet: {
                type: "string",
                description: "Customer Ethereum wallet address (0x...)",
            },
            customer_name: {
                type: "string",
                description: "Customer name for booking",
            },
        },
        required: ["service_id", "booking_time", "customer_wallet"],
    },
};
// ===== TOOL: Make payment =====
const payForServiceTool = {
    name: "pay_for_service",
    description: "Complete payment for a booked service using x402 protocol. Funds are locked in SmartEscrow until service completion.",
    inputSchema: {
        type: "object",
        properties: {
            booking_id: {
                type: "string",
                description: "Booking ID from book_service result",
            },
            service_price: {
                type: "number",
                description: "Service price in USD",
            },
            customer_wallet: {
                type: "string",
                description: "Customer wallet address",
            },
        },
        required: ["booking_id", "service_price", "customer_wallet"],
    },
};
// ===== Tool handlers =====
async function searchServices(params) {
    try {
        const response = await fetch(`${AGENTPAY_API_URL}/api/v1/search`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                category: params.category,
                location: params.location,
                date: params.date,
                duration: params.duration,
            }),
        });
        if (!response.ok) {
            return `Error: Service search failed (${response.status})`;
        }
        const data = (await response.json());
        return JSON.stringify(data, null, 2);
    }
    catch (error) {
        return `Error searching services: ${error instanceof Error ? error.message : String(error)}`;
    }
}
async function bookService(params) {
    try {
        const response = await fetch(`${AGENTPAY_API_URL}/api/v1/book`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                service_id: params.service_id,
                booking_time: params.booking_time,
                customer_wallet: params.customer_wallet,
                customer_name: params.customer_name,
            }),
        });
        if (!response.ok) {
            return `Error: Booking failed (${response.status})`;
        }
        const data = (await response.json());
        return JSON.stringify(data, null, 2);
    }
    catch (error) {
        return `Error booking service: ${error instanceof Error ? error.message : String(error)}`;
    }
}
async function payForService(params) {
    try {
        const response = await fetch(`${AGENTPAY_API_URL}/api/v1/pay`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                booking_id: params.booking_id,
                service_price: params.service_price,
                customer_wallet: params.customer_wallet,
            }),
        });
        if (!response.ok) {
            return `Error: Payment failed (${response.status})`;
        }
        const data = (await response.json());
        return JSON.stringify(data, null, 2);
    }
    catch (error) {
        return `Error processing payment: ${error instanceof Error ? error.message : String(error)}`;
    }
}
// ===== Register tool list =====
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [searchServicesTool, bookServiceTool, payForServiceTool],
    };
});
// ===== Register tool execution =====
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    let result;
    switch (name) {
        case "search_services":
            result = await searchServices(args);
            break;
        case "book_service":
            result = await bookService(args);
            break;
        case "pay_for_service":
            result = await payForService(args);
            break;
        default:
            result = `Unknown tool: ${name}`;
    }
    return {
        content: [
            {
                type: "text",
                text: result,
            },
        ],
    };
});
// ===== Start server =====
async function main() {
    console.log("🚀 Starting AgentPay MCP Server...");
    console.log(`   API URL: ${AGENTPAY_API_URL}`);
    console.log(`   Version: 1.0.0`);
    console.log("");
    console.log("📡 Available tools:");
    console.log("   • search_services - Find services by category/location");
    console.log("   • book_service - Reserve a service appointment");
    console.log("   • pay_for_service - Complete payment via x402");
    console.log("");
    console.log("Connecting to Claude...");
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log("✅ MCP Server connected and ready!");
}
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
//# sourceMappingURL=mcp-server.js.map