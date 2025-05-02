import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { TodoRepository, TodoStatus } from './repository';

export function setupServerTools(server: McpServer, repository: TodoRepository) {
  // Create a new todo
  server.tool(
    'create_todo',
    'Create a new todo item',
    {
      title: z.string().describe('The title of the todo'),
      description: z.string().describe('The description of the todo'),
      status: z.enum([TodoStatus.TODO, TodoStatus.IN_PROGRESS, TodoStatus.COMPLETED]).optional().describe('The status of the todo'),
    },       
    async ({ title, description, status }: { 
      title: string; 
      description: string; 
      status?: TodoStatus; 
    }) => {
      const todo = await repository.createTodo({
        title,
        description,
        status: status || TodoStatus.TODO
      });
      
      return {
        content: [
          {
            type: "text",
            text: `Todo created with id: ${todo.id}`
          }
        ],
        todo
      };
    }
  );

  // Update a todo
  server.tool(
    'update_todo',
    'Update a todo item',
    {
      id: z.string().describe('The ID of the todo to update'),
      title: z.string().optional().describe('The new title of the todo'),
      description: z.string().optional().describe('The new description of the todo'),
      status: z.enum([TodoStatus.TODO, TodoStatus.IN_PROGRESS, TodoStatus.COMPLETED]).optional().describe('The new status of the todo'),
    },
    async ({ id, title, description, status }: {
      id: string;
      title?: string;
      description?: string;
      status?: TodoStatus;
    }) => {
      const updatedTodo = await repository.updateTodo(id, {
        ...(title ? { title } : {}),
        ...(description ? { description } : {}),
        ...(status ? { status } : {})
      });

      if (!updatedTodo) {
        return {
          content: [
            {
              type: "text",
              text: `Todo with id ${id} not found`
            }
          ]
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Todo updated: ${updatedTodo.title}`
          }
        ],
        todo: updatedTodo
      };
    }
  );

  // Delete a todo
  server.tool(
    'delete_todo',
    'Delete a todo item',
    {
      id: z.string().describe('The ID of the todo to delete')
    },
    async ({ id }: { id: string }) => {
      const deleted = await repository.deleteTodo(id);

      if (!deleted) {
        return {
          content: [
            {
              type: "text",
              text: `Todo with id ${id} not found`
            }
          ]
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Todo with id ${id} has been deleted`
          }
        ]
      };
    }
  );

  // Get all todos
  server.tool(
    'list_todos',
    'List all todos',
    {},
    async () => {
      console.log('list_todos');
      const todos = await repository.getAllTodos();

      return {
        content: [
          {
            type: "text",
            text: `Found ${todos.length} todos`
          }
        ],
        todos
      };
    }
  );

  // Get a single todo
  server.tool(
    'get_todo',
    'Get a todo by ID',
    {
      id: z.string().describe('The ID of the todo to get')
    },
    async ({ id }: { id: string }) => {
      const todo = await repository.getTodoById(id);

      if (!todo) {
        return {
          content: [
            {
              type: "text",
              text: `Todo with id ${id} not found`
            }
          ]
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Found todo: ${todo.title}`
          }
        ],
        todo
      };
    }
  );
} 