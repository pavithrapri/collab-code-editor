export class WebSocketService {
  private ws: WebSocket | null = null;
  private roomId: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private latency: number = 0;
  private latencyCheckInterval: number | null = null;
  private userId: string;

  public onConnect: (() => void) | null = null;
  public onDisconnect: (() => void) | null = null;
  public onCodeUpdate: ((code: string) => void) | null = null;
  public onUserJoined: ((count: number) => void) | null = null;
  public onUserLeft: ((count: number) => void) | null = null;
  public onTypingStarted: ((userId: string) => void) | null = null;
  public onTypingStopped: ((userId: string) => void) | null = null;

  constructor(roomId: string) {
    this.roomId = roomId;
    this.userId = this.generateUserId();
  }

  private generateUserId(): string {
    // Generate or retrieve user ID
    const storedId = localStorage.getItem('user_id');
    if (storedId) return storedId;
    
    const newId = `user_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('user_id', newId);
    return newId;
  }

  connect() {
    const wsUrl = import.meta.env.VITE_WS_URL || `ws://localhost:8000/ws/${this.roomId}`;
    
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        
        // Start latency monitoring
        this.startLatencyMonitoring();
        
        if (this.onConnect) this.onConnect();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.stopLatencyMonitoring();
        if (this.onDisconnect) this.onDisconnect();
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
    }
  }

  private handleMessage(message: any) {
    switch (message.type) {
      case 'code_update':
        if (this.onCodeUpdate && message.code !== undefined) {
          this.onCodeUpdate(message.code);
        }
        break;
      case 'user_joined':
        if (this.onUserJoined && message.user_count !== undefined) {
          this.onUserJoined(message.user_count);
        }
        break;
      case 'user_left':
        if (this.onUserLeft && message.user_count !== undefined) {
          this.onUserLeft(message.user_count);
        }
        break;
      case 'initial_state':
        if (this.onCodeUpdate && message.code !== undefined) {
          this.onCodeUpdate(message.code);
        }
        break;
      case 'typing_indicator':
        if (message.isTyping && this.onTypingStarted) {
          this.onTypingStarted(message.userId);
        } else if (!message.isTyping && this.onTypingStopped) {
          this.onTypingStopped(message.userId);
        }
        break;
      case 'pong':
        this.latency = Date.now() - message.timestamp;
        break;
    }
  }

  private startLatencyMonitoring() {
    this.stopLatencyMonitoring(); // Clear any existing interval
    
    this.latencyCheckInterval = window.setInterval(() => {
      const start = Date.now();
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ 
          type: 'ping', 
          timestamp: start 
        }));
      }
    }, 10000); // Every 10 seconds
  }

  private stopLatencyMonitoring() {
    if (this.latencyCheckInterval) {
      clearInterval(this.latencyCheckInterval);
      this.latencyCheckInterval = null;
    }
  }

  getLatency(): number {
    return this.latency;
  }

  getUserId(): string {
    return this.userId;
  }

  sendCodeUpdate(code: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'code_update',
        code,
        roomId: this.roomId,
        userId: this.userId,
      }));
    }
  }

  sendTypingIndicator(isTyping: boolean) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'typing_indicator',
        isTyping,
        userId: this.userId,
        roomId: this.roomId,
      }));
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
    }
  }

  disconnect() {
    this.stopLatencyMonitoring();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}