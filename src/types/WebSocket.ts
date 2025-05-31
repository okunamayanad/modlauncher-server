export interface WebSocketData {
  clientId: string;
}

export interface IncomingMessage {
  type: string;
  payload?: any;
}

export interface OutgoingMessage {
  type: string;
  [key: string]: any;
}
