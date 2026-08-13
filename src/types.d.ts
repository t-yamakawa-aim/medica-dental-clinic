import {} from 'hono'

declare module 'hono' {
  interface ContextRenderer {
    (
      content: string | Promise<string> | any,
      props?: { title?: string; description?: string }
    ): Response | Promise<Response>
  }
}
