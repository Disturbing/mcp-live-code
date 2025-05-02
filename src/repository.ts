export enum TodoStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface Todo {
  id: string;
  title: string;
  description: string;
  status: TodoStatus;
  created_at: string;
  updated_at: string;
}

export class TodoRepository {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async initializeDatabase(): Promise<void> {
    // Create todos table with SQL using tagged template literals
    await this.state.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
  }

  async createTodo(todo: Omit<Todo, 'id' | 'created_at' | 'updated_at'>): Promise<Todo> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const newTodo: Todo = {
      id,
      ...todo,
      created_at: now,
      updated_at: now
    };

    this.state.storage.sql.exec(`
      INSERT INTO todos (id, title, description, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,newTodo.id,
      newTodo.title,
      newTodo.description,
      newTodo.status,
      newTodo.created_at,
      newTodo.updated_at);

    return newTodo;
  }

  async getTodoById(id: string): Promise<Todo | null> {
    console.log('Getting todo by id:', id);
    // Query using SQL with parameterized query
    const cursor = await this.state.storage.sql.exec(`
      SELECT * FROM todos WHERE id = ?
    `, [id]);

    // Use the cursor as an iterator
    const result = cursor.next();
    if (result.done) {
      return null;
    }
    
    // Use unknown as an intermediate type for safe type assertion
    return result.value as unknown as Todo;
  }

  async getAllTodos(): Promise<Todo[]> {
    console.log('Getting all todos');
    // Query using SQL - no parameters needed for this query
    const cursor = await this.state.storage.sql.exec(`
      SELECT * FROM todos ORDER BY created_at DESC
    `);

    // Use the cursor as an iterable to collect all rows
    const todos: Todo[] = [];
    for (const row of cursor) {
      todos.push(row as unknown as Todo);
    }
    
    return todos;
  }

  async updateTodo(id: string, updates: Partial<Omit<Todo, 'id' | 'created_at'>>): Promise<Todo | null> {
    // First check if todo exists
    const todo = await this.getTodoById(id);
    if (!todo) {
      return null;
    }

    const now = new Date().toISOString();
    const updatedTodo = {
      ...todo,
      ...updates,
      updated_at: now
    };

    // Build the SQL query dynamically based on what fields are being updated
    let query = 'UPDATE todos SET updated_at = ?';
    const params = [now];
    
    // Only include fields that are actually being updated
    if (updates.title !== undefined) {
      query += ', title = ?';
      params.push(updatedTodo.title);
    }
    
    if (updates.description !== undefined) {
      query += ', description = ?';
      params.push(updatedTodo.description);
    }
    
    if (updates.status !== undefined) {
      query += ', status = ?';
      params.push(updatedTodo.status);
    }
    
    // Add the WHERE clause and the ID parameter
    query += ' WHERE id = ?';
    params.push(id);

    // Execute the query with the correct number of parameters
    await this.state.storage.sql.exec(query, params);

    return updatedTodo;
  }

  async deleteTodo(id: string): Promise<boolean> {
    console.log('Deleting todo:', id);
    const todo = await this.getTodoById(id);
    if (!todo) {
      return false;
    }

    // Delete todo using parameterized query
    await this.state.storage.sql.exec(`
      DELETE FROM todos WHERE id = ?
    `, [id]);

    return true;
  }
} 