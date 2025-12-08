import io from "socket.io-client";
import { getTokenFromLocalStorage, removeTrailingSlash } from "./common-utils";
import { ENV_VARIABLES } from "../services/config";

// const SOCKET_URL = removeTrailingSlash(ENV_VARIABLES.API_BASE);
// const isAuthToken = getTokenFromLocalStorage();

// const socket = io(SOCKET_URL, {
//   autoConnect: false,
//   timeout: 10000,
//   transports: ["websocket"],
//   reconnectionAttempts: Infinity,
//   query: {
//     accessToken: isAuthToken,
//   },
// });

// export default socket;

class SocketService {
  private static instance: SocketService | null = null;
  private socket: any;
  private connectionAttempts: number = 0;
  private maxConnectionAttempts: number = 3;
  private readonly RECONNECTION_DELAY = 2000;

  private constructor() {
    const SOCKET_URL = removeTrailingSlash(ENV_VARIABLES.API_BASE);
    const isAuthToken = getTokenFromLocalStorage();

    this.socket = io(SOCKET_URL, {
      autoConnect: false,
      timeout: 10000,
      transports: ["websocket"],
      reconnectionAttempts: Infinity,
      query: {
        accessToken: isAuthToken,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
    });

    this.setupBaseListeners();
  }

  private setupBaseListeners() {
    this.socket.on("connect", () => {
      console.log("Socket connected successfully");
      this.connectionAttempts = 0;
    });

    this.socket.on("connect_error", (error: any) => {
      console.error("Socket connection error:", error);
      this.handleReconnection();
    });

    this.socket.on("disconnect", (reason: string) => {
      console.log("Socket disconnected. Reason:", reason);
      if (
        reason === "io server disconnect" ||
        reason === "io client disconnect"
      ) {
        // Don't reconnect for intentional disconnections
        return;
      }
      this.handleReconnection();
    });
  }

  private handleReconnection() {
    if (this.connectionAttempts < this.maxConnectionAttempts) {
      this.connectionAttempts++;
      console.log(
        `Attempting reconnection ${this.connectionAttempts}/${this.maxConnectionAttempts}`
      );
      setTimeout(() => {
        if (!this.socket.connected) {
          this.connect();
        }
      }, this.RECONNECTION_DELAY);
    } else {
      console.error("Max reconnection attempts reached");
    }
  }

  private connectionState: "connected" | "disconnected" | "connecting" =
    "disconnected";

  public getConnectionState() {
    return this.connectionState;
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  // public connect(): void {
  //   if (!this.socket.connected) {
  //     this.socket.connect();
  //   }
  // }

  public connect(): void {
    if (!this.socket.connected) {
      this.socket.io.opts.query = {
        accessToken: getTokenFromLocalStorage(), // Refresh token
      };
      this.socket.connect();
    }
  }

  public disconnect(): void {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public on(event: string, callback: Function): void {
    this.socket.on(event, callback);
  }

  public off(event: string, callback: Function): void {
    this.socket.off(event, callback);
  }

  public getSocket() {
    return this.socket;
  }

  public connectchat(clientId?: string): void {
    if (!this.socket.connected) {
      this.socket.io.opts.query = {
        accessToken: getTokenFromLocalStorage(), // refresh token
        ...(clientId ? { clientId } : {}), // include clientId if provided
      };
      this.socket.connect();
    }
  }
}

const socketService = SocketService.getInstance();
export default socketService;
