import { Peer, DataConnection } from 'peerjs';

const PREFIX = 'arcane-exam-v1-';

const PEER_CONFIG = {
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
    ]
  }
};

export class PeerSocket {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private callbacks: Map<string, Function[]> = new Map();
  public id: string = '';
  
  // Host state
  private isHost: boolean = false;
  private room: any = null;
  private hostConnection: DataConnection | null = null;
  private activeRoomId: string | null = null;

  constructor() {
    this.id = Math.random().toString(36).substring(2, 10);
  }

  public on(event: string, callback: Function) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)!.push(callback);
  }

  public off(event: string, callback?: Function) {
    if (!callback) {
      this.callbacks.delete(event);
    } else {
      const cbs = this.callbacks.get(event);
      if (cbs) {
        this.callbacks.set(event, cbs.filter(cb => cb !== callback));
      }
    }
  }

  private trigger(event: string, data?: any) {
    const cbs = this.callbacks.get(event) || [];
    cbs.forEach(cb => cb(data));
  }

  // Common wrapper to handle callbacks the Socket.io way
  public emit(event: string, data: any, ackTimer?: Function) {
    // If we are Host, handle internally
    if (this.isHost) {
      if (event === 'create_room') {
        this.handleCreateRoom(data, ackTimer);
      } else {
        this.handleHostEvent(event, data, this.id, ackTimer);
      }
      return;
    }

    // If we are connecting to a room and it's create_room, upgrade us to host
    if (event === 'create_room') {
      this.isHost = true;
      this.handleCreateRoom(data, ackTimer);
      return;
    }

    // If join room, establish connection
    if (event === 'join_room') {
      if (!this.peer) {
        console.log(`[PeerSocket] Initializing client peer with ID: ${this.id}`);
        this.peer = new Peer(this.id, PEER_CONFIG);
        this.peer.on('open', (id) => {
          console.log(`[PeerSocket] Client peer opened: ${id}`);
          this.connectToHost(data, ackTimer);
        });
        this.peer.on('error', (err) => {
          console.error(`[PeerSocket] Client peer error:`, err);
          if (ackTimer) ackTimer({ success: false, error: err.message || "PeerJS failed to connect" });
        });
      } else {
        this.connectToHost(data, ackTimer);
      }
      return;
    }

    // Otherwise send to host
    if (this.hostConnection && this.hostConnection.open) {
      try {
        this.hostConnection.send({ event, data });
      } catch (e) {
        console.error('[PeerSocket] Error sending to host:', e);
      }
    }
  }

  private connectToHost(data: any, ackTimer?: Function) {
    const roomId = data.roomId.toLowerCase();
    console.log(`[PeerSocket] Attempting to connect to host: ${PREFIX + roomId}`);
    const conn = this.peer!.connect(PREFIX + roomId, { reliable: true });
    this.hostConnection = conn;
    
    let pingInterval: number;

    conn.on('open', () => {
      console.log(`[PeerSocket] Connection to host opened.`);
      conn.send({ event: 'join_room', data });

      pingInterval = window.setInterval(() => {
        if (conn.open) conn.send({ event: '_ping_' });
      }, 15000);
    });
    
    conn.on('data', (msg: any) => {
      if (msg.event === '_ping_') return;
      // console.log(`[PeerSocket] Received data from host:`, msg);
      if (msg.event === '_ack_') {
        if (ackTimer && msg.originalEvent === 'join_room') {
          ackTimer(msg.data);
        }
      } else {
        this.trigger(msg.event, msg.data);
      }
    });

    conn.on('error', (err) => {
      console.error('[PeerSocket] Connection error:', err);
      if (pingInterval) window.clearInterval(pingInterval);
      if (ackTimer) ackTimer({ success: false, error: "Connection error: " + err.message });
    });

    conn.on('close', () => {
       console.log('[PeerSocket] Connection to host lost');
       if (pingInterval) window.clearInterval(pingInterval);
       this.trigger('disconnect');
    });
  }

  private handleCreateRoom(data: any, callback?: Function) {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.activeRoomId = roomId;
    
    console.log(`[PeerSocket] Creating room: ${roomId}`);
    // We bind explicitly to a prefixed ID so clients can find us
    this.peer = new Peer(PREFIX + roomId.toLowerCase(), PEER_CONFIG);
    
    this.peer.on('open', (id) => {
      console.log(`[PeerSocket] Host peer opened with ID: ${id}`);
      // Room state initialization
      const pId = data.participantId || this.id;
      this.room = {
        id: roomId,
        hostId: this.id,
        hostParticipantId: pId,
        participants: [{
          id: this.id,
          participantId: pId,
          name: data.name,
          avatar: data.avatar || 'User',
          avatarBg1: data.avatarBg1 || '#4f46e5',
          avatarBg2: data.avatarBg2 || '#9333ea',
          connected: true,
          finished: false,
          score: 0,
          time: 0
        }],
        exam: null,
        settings: data.settings || null,
        status: "lobby",
        mode: "independent",
        currentQuestionIndex: 0,
        startTime: null,
        chat: [{
          id: "sys_" + Date.now(),
          name: "System",
          message: `${data.name} created the room`,
          time: Date.now(),
          isSystem: true
        }],
        answers: {},
      };

      if (callback) callback({ success: true, roomId });
      
      this.broadcast('room_update', this.room);
      this.trigger('room_update', this.room);
    });

    this.peer.on('error', (err) => {
      console.error(`[PeerSocket] Host peer error:`, err);
      if (callback) callback({ success: false, error: err.message });
    });

    this.peer.on('connection', (conn) => {
      console.log(`[PeerSocket] Incoming connection from: ${conn.peer}`);
      this.connections.set(conn.peer, conn);
      
      let pingInterval: number;

      conn.on('open', () => {
         console.log(`[PeerSocket] Connection with ${conn.peer} officially opened`);
         
         pingInterval = window.setInterval(() => {
           if (conn.open) conn.send({ event: '_ping_' });
         }, 15000);
      });

      conn.on('data', (msg: any) => {
        if (msg.event === '_ping_') return;
        this.handleHostEvent(msg.event, msg.data, conn.peer, undefined, conn);
      });
      
      conn.on('close', () => {
        console.log(`[PeerSocket] Connection with ${conn.peer} closed`);
        if (pingInterval) window.clearInterval(pingInterval);
        this.connections.delete(conn.peer);
        this.handleHostEvent('disconnect_child', {}, conn.peer);
      });
      
      conn.on('error', (err) => {
        if (pingInterval) window.clearInterval(pingInterval);
        console.error(`[PeerSocket] Connection error with ${conn.peer}:`, err);
      });
    });
  }

  private broadcast(event: string, data: any) {
    this.connections.forEach(conn => {
      try {
        if (conn && conn.open) conn.send({ event, data });
      } catch (e) {
        console.error('[PeerSocket] Broadcast error:', e);
      }
    });
  }

  private sendTo(targetId: string, event: string, data: any) {
    this.connections.forEach(conn => {
      if (conn.peer === targetId) {
        try {
          if (conn && conn.open) conn.send({ event, data });
        } catch (e) {
           console.error('[PeerSocket] SendTo error:', e);
        }
      }
    });
  }

  // --- HOST LOGIC --- //
  private handleHostEvent(eventName: string, data: any, sourceId: string, callback?: Function, conn?: DataConnection) {
    if (!this.room) return;
    
    const io_to_roomId_emit = (ev: string, d?: any) => {
      this.broadcast(ev, d);
      this.trigger(ev, d); // also trigger locally
    };

    if (eventName === 'join_room') {
      const { roomId, name, participantId } = data;
      if (roomId !== this.room.id) {
        if (conn) conn.send({ event: '_ack_', originalEvent: 'join_room', data: { success: false, error: "Room not found" } });
        return;
      }
      
      let existingParticipant = null;
      if (participantId) {
        existingParticipant = this.room.participants.find((p: any) => p.participantId === participantId);
      }
      if (!existingParticipant) {
        existingParticipant = this.room.participants.find((p: any) => p.name === name);
      }

      if (existingParticipant) {
        existingParticipant.id = sourceId;
        if (participantId) existingParticipant.participantId = participantId;
        if (data.avatar) existingParticipant.avatar = data.avatar;
        if (data.avatarBg1) existingParticipant.avatarBg1 = data.avatarBg1;
        if (data.avatarBg2) existingParticipant.avatarBg2 = data.avatarBg2;
        existingParticipant.connected = true;
        
        if (this.room.hostParticipantId === existingParticipant.participantId) {
          this.room.hostId = sourceId;
        }
        
        this.room.chat.push({
          id: "sys_" + Date.now(),
          name: "System",
          message: `${name} reconnected`,
          time: Date.now(),
          isSystem: true
        });
      } else {
        this.room.participants.push({
          id: sourceId,
          participantId: participantId || sourceId,
          name,
          avatar: data.avatar || 'User',
          avatarBg1: data.avatarBg1 || '#4f46e5',
          avatarBg2: data.avatarBg2 || '#9333ea',
          connected: true,
          finished: false,
          score: 0,
          time: 0
        });
        this.room.chat.push({
          id: "sys_" + Date.now(),
          name: "System",
          message: `${name} joined the room`,
          time: Date.now(),
          isSystem: true
        });
      }

      if (conn) {
        console.log(`[PeerSocket] Sending join_room ack back to ${sourceId}`);
        conn.send({ event: '_ack_', originalEvent: 'join_room', data: { success: true, roomId } });
      }
      io_to_roomId_emit("room_update", this.room);
    }

    const checkAllAnswered = () => {
      if (this.room.mode === "synchronized" && this.room.status === "playing") {
        const currentQId = this.room.exam[this.room.currentQuestionIndex].id;
        const connectedParticipants = this.room.participants.filter((p: any) => p.connected);
        if (connectedParticipants.length === 0) return;
        
        const allAnswered = connectedParticipants.every((p: any) => this.room.answers[p.participantId] && this.room.answers[p.participantId][currentQId]);
          
        if (allAnswered && !this.room.isTransitioning) {
          this.room.isTransitioning = true;
          setTimeout(() => {
            this.room.isTransitioning = false;
            if (this.room.currentQuestionIndex < this.room.exam.length - 1) {
              this.room.currentQuestionIndex += 1;
              io_to_roomId_emit("next_question", this.room.currentQuestionIndex);
              io_to_roomId_emit("room_update", this.room);
            } else {
              this.room.status = "finished";
              this.room.participants.forEach((p: any) => p.finished = true);
              io_to_roomId_emit("exam_finished");
              io_to_roomId_emit("room_update", this.room);
            }
          }, 5000);
        }
      }
    };

    if (eventName === 'leave_room' || eventName === 'disconnect_child') {
      const participant = this.room.participants.find((p: any) => p.id === sourceId);
      if (participant) {
        participant.connected = false;
        this.room.chat.push({
          id: "sys_" + Date.now(),
          name: "System",
          message: `${participant.name} ${eventName === 'leave_room' ? 'left' : 'disconnected'}`,
          time: Date.now(),
          isSystem: true
        });
        checkAllAnswered();
        io_to_roomId_emit("room_update", this.room);
      }
    }

    if (eventName === 'update_settings') {
      if (this.room.hostId === sourceId && this.room.status === "lobby") {
        this.room.exam = data.exam;
        this.room.settings = data.settings;
        this.room.mode = data.mode;
        io_to_roomId_emit("room_update", this.room);
      }
    }

    if (eventName === 'start_exam') {
      if (this.room.hostId === sourceId && this.room.status === "lobby") {
        this.room.status = "playing";
        this.room.startTime = Date.now();
        this.room.currentQuestionIndex = 0;
        this.room.answers = {};
        this.room.finishOrder = [];
        this.room.participants.forEach((p: any) => {
          p.finished = false;
          p.score = 0;
          p.time = 0;
        });
        io_to_roomId_emit("room_update", this.room);
        io_to_roomId_emit("exam_started");
      }
    }

    if (eventName === 'submit_answer') {
      if (this.room.status === "playing") {
        const participant = this.room.participants.find((p: any) => p.id === sourceId);
        if (!participant) return;

        const pId = participant.participantId;
        if (!this.room.answers[pId]) this.room.answers[pId] = {};
        
        const oldAnswer = this.room.answers[pId][data.questionId];
        const oldTime = oldAnswer ? oldAnswer.timeTaken : 0;
        const oldPoints = oldAnswer ? (oldAnswer.points || 0) : 0;

        this.room.answers[pId][data.questionId] = { answer: data.answer, isCorrect: data.isCorrect, timeTaken: data.timeTaken, points: data.points || 0 };
        
        participant.score = (participant.score || 0) - oldPoints + (data.points || 0);
        
        if (this.room.mode === "synchronized") participant.time += (data.timeTaken - oldTime);

        checkAllAnswered();
        io_to_roomId_emit("room_update", this.room);
      }
    }

    if (eventName === 'finish_exam') {
      if (this.room.status === "playing" && this.room.mode === "independent") {
        const participant = this.room.participants.find((p: any) => p.id === sourceId);
        if (participant && !participant.finished) {
          participant.finished = true;
          participant.time = data.timeTaken;
          
          if (!this.room.finishOrder) this.room.finishOrder = [];
          this.room.finishOrder.push(participant.participantId);
          const order = this.room.finishOrder.length;
          
          if (sourceId === this.id) {
            this.trigger("finish_order", { order });
          } else {
            this.sendTo(sourceId, "finish_order", { order });
          }
        }
        
        const allFinished = this.room.participants.filter((p: any) => p.connected).every((p: any) => p.finished);
        if (allFinished) {
          this.room.status = "finished";
          io_to_roomId_emit("exam_finished");
        }
        io_to_roomId_emit("room_update", this.room);
      }
    }

    if (eventName === 'sync_timeout') {
      if (this.room.status === "playing" && this.room.mode === "synchronized") {
        if (sourceId === this.room.hostId && !this.room.isTransitioning) {
          this.room.isTransitioning = true;
          setTimeout(() => {
            this.room.isTransitioning = false;
            if (this.room.currentQuestionIndex < this.room.exam.length - 1) {
              this.room.currentQuestionIndex += 1;
              io_to_roomId_emit("next_question", this.room.currentQuestionIndex);
              io_to_roomId_emit("room_update", this.room);
            } else {
              this.room.status = "finished";
              this.room.participants.forEach((p: any) => p.finished = true);
              io_to_roomId_emit("exam_finished");
              io_to_roomId_emit("room_update", this.room);
            }
          }, 5000);
        }
      }
    }

    if (eventName === 'send_chat') {
      const chatMsg = { id: Date.now().toString(), name: data.name, avatar: data.avatar || 'User', avatarBg1: data.avatarBg1, avatarBg2: data.avatarBg2, message: data.message, time: Date.now() };
      this.room.chat.push(chatMsg);
      io_to_roomId_emit("chat_message", chatMsg);
      io_to_roomId_emit("room_update", this.room);
    }

    if (eventName === 'return_to_lobby') {
      if (this.room.hostId === sourceId) {
        this.room.status = "lobby";
        this.room.exam = null;
        this.room.settings = null;
        this.room.answers = {};
        this.room.participants.forEach((p: any) => {
          p.finished = false;
          p.score = 0;
          p.time = 0;
        });
        io_to_roomId_emit("room_update", this.room);
      }
    }

    if (eventName === 'use_power') {
      io_to_roomId_emit("power_used", { power: data.power, name: data.name, userId: sourceId });
      this.room.chat.push({
        id: "sys_" + Date.now(),
        name: "System",
        message: `${data.name} used ${data.power.name}!`,
        time: Date.now(),
        isSystem: true
      });
      io_to_roomId_emit("room_update", this.room);
    }
  }

  // Cleanup
  public disconnect() {
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}

export const io = () => new PeerSocket();
