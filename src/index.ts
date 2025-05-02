import { LiveCodeTodoListServer } from './server';
// Export the LiveCodeTodoListServer class for Durable Object binding
export { LiveCodeTodoListServer };

// Worker entrypoint for handling incoming requests
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const sessionIdStr = url.searchParams.get('sessionId')
    const id = sessionIdStr
        ? env.LIVE_CODE_TODO_LIST_SERVER.idFromString(sessionIdStr)
        : env.LIVE_CODE_TODO_LIST_SERVER.newUniqueId();

    console.log(`Fetching sessionId: ${sessionIdStr} with id: ${id}`);
    
    url.searchParams.set('sessionId', id.toString());

    return env.LIVE_CODE_TODO_LIST_SERVER.get(id).fetch(new Request(
        url.toString(),
        request
    ));
  }
};
