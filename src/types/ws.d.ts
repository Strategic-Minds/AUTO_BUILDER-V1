declare module 'ws' {
  const WebSocket: {
    new (url: string | URL, protocols?: string | string[]): globalThis.WebSocket
  }

  export default WebSocket
}
