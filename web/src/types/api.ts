export interface RoomSnapshot {
    pageId:        string;
    dbId:          string;
    name:          string;
    url:           string;
    botFile:       string;
    channelId:     string;
    startedAt:     Date;
    uptimeSeconds: number;
    playerCount:   number;
    avgPing:       number | null;
    ownerId?:      string | null;
}

export interface TokenItem {
    id:          string;
    valueMasked: string;
    status:      'AVAILABLE' | 'IN_USE' | 'EXPIRED' | 'RATE_LIMITED';
    lastUsedAt:  string | null;
    ownerId?:    string | null;
}

export interface BotItem {
    scriptName:  string;
    displayName: string;
    description: string | null;
}

export interface CurrentMetrics {
    cpu:         number;
    ramMb:       number;
    roomsOnline: number;
    botUptime:   number;
}

export interface MetricPoint {
    cpuPercent:  number;
    ramMb:       number;
    roomsOnline: number;
    recordedAt:  string;
}

export interface RoomLog {
    id:        string;
    type:      'INFO' | 'SUCCESS' | 'WARN' | 'ERROR' | 'CRASH' | 'TOKEN_EXPIRED' | 'COMMAND';
    message:   string;
    createdAt: string;
}

export interface RoomHistory {
    id:          string;
    scriptName:  string;
    roomName:    string;
    status:      'ONLINE' | 'OFFLINE' | 'CRASHED';
    startedAt:   string;
    finishedAt:  string | null;
    playerCount: number;
    retryCount:  number;
}

export interface OpenRoomPayload {
    botFile:    string;
    tokenId:    string;
    channelId?: string;
}

export interface RoomOpenUpdate {
    requestId:   string;
    title:       string;
    description: string;
    error?:      boolean;
}

export type SocketRoomMetrics = {
    pageId:      string;
    playerCount: number;
    avgPing:     number | null;
};

export type SocketServerMetrics = {
    cpu:         number;
    ramMb:       number;
    roomsOnline: number;
    timestamp:   string;
};

export type SocketRoomRemoved = {
    pageId: string;
    dbId:   string;
    status: 'OFFLINE' | 'CRASHED';
};
