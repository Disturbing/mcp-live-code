import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function setupServerPrompts(server: McpServer) {
  server.prompt(
    'introduction',
    'Learn about the Todo service and how to use it',
    () => ({
      messages: [{
        role: 'assistant',
        content: {
          type: 'text',
          text: `Welcome to the Todo List Service! This service helps you manage your tasks effectively.

Here's what you can do:
1. Create new todos with titles and descriptions
2. List all your todos
3. Get details of a specific todo
4. Update existing todos
5. Mark todos as TODO, IN_PROGRESS, or COMPLETED
6. Delete todos you no longer need

To get started:
- "Create a new todo" - Add a new task to your list
- "Show my todos" - View all your current todos
- "Update a todo" - Change a todo's title, description or status
- "Delete a todo" - Remove a todo from your list

Need anything else? Just ask and I'll help you manage your todos!`
        }
      }]
    })
  );

  server.prompt(
    'create_todo_help',
    'Learn how to create a new todo',
    () => ({
      messages: [{
        role: 'assistant',
        content: {
          type: 'text',
          text: `To create a new todo, you need to provide:

Required:
- title: A short name for your todo
- description: Details about what needs to be done

Optional:
- status: The current status of the todo (TODO, IN_PROGRESS, or COMPLETED)

Example:
"Create a todo with title 'Buy groceries' and description 'Need to get milk, eggs, and bread'"

The system will create a new todo and return its unique ID.`
        }
      }]
    })
  );

  server.prompt(
    'update_todo_help',
    'Learn how to update a todo',
    () => ({
      messages: [{
        role: 'assistant',
        content: {
          type: 'text',
          text: `To update a todo, you need to provide:

Required:
- id: The unique identifier of the todo you want to update

Optional (provide at least one):
- title: A new title for the todo
- description: Updated details about the todo
- status: The new status (TODO, IN_PROGRESS, or COMPLETED)

Example:
"Update todo with id '123abc' to status 'IN_PROGRESS'"

The system will update the todo and return the updated information.`
        }
      }]
    })
  );
} 