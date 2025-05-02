import { Implementation } from '@modelcontextprotocol/sdk/types.js';
import { McpHonoServerDO } from '@xava-labs/mcp';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { setupServerTools } from './tools';
import { setupServerPrompts } from './prompts';
import { TodoRepository } from './repository';

/**
 * LiveCodeTodoListServer extends McpHonoServerDO for CRUD operations on todo items
 */
export class LiveCodeTodoListServer extends McpHonoServerDO {
  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
 
  }

  /**
   * Implementation of the required abstract method
   */
  getImplementation(): Implementation {
    return {
      name: 'Live Code TODO List',
      version: '1.0.0',
    };
  }

  /**
   * Implements the required abstract configureServer method
   * Registers CRUD tools for the MCP server
   */
  configureServer(server: McpServer): void {
       // Initialize repository with state
       const repository = new TodoRepository(this.ctx);
       // Initialize database
       this.ctx.blockConcurrencyWhile(async () => 
         repository.initializeDatabase()
       );
    // Create and set up tools and resources with our repository
    setupServerTools(server, repository);
    setupServerPrompts(server);
  }
} 