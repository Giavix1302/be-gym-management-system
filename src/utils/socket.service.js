import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { conversationModel } from '~/modules/conversation/model/conversation.model'
import { messageModel } from '~/modules/message/model/message.model'
import { userModel } from '~/modules/user/model/user.model'
import { env } from '~/config/environment.config'

class SocketService {
  constructor() {
    this.io = null
    this.users = new Map() // userId -> socketId mapping
    this.userSockets = new Map() // socketId -> userId mapping
  }

  init(server) {
    this.io = new Server(server, {
      cors: {
        origin: env.FE_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    })

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token
        if (!token) {
          return next(new Error('Authentication error'))
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.getDetailById(decoded.id)

        if (!user) {
          return next(new Error('User not found'))
        }

        socket.userId = user._id.toString()
        socket.user = user
        next()
      } catch (error) {
        next(new Error('Authentication error'))
      }
    })

    this.io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected with socket ${socket.id}`)

      // Store user connection
      this.users.set(socket.userId, socket.id)
      this.userSockets.set(socket.id, socket.userId)

      // Notify others that user is online
      this.broadcastUserStatus(socket.userId, true)

      // Handle joining conversation room
      socket.on('join_conversation', async (data) => {
        try {
          await this.handleJoinConversation(socket, data)
        } catch (error) {
          socket.emit('error', { message: error.message })
        }
      })

      // Handle sending message
      socket.on('send_message', async (data) => {
        try {
          await this.handleSendMessage(socket, data)
        } catch (error) {
          socket.emit('error', { message: error.message })
        }
      })

      // Handle typing indicator
      socket.on('typing', (data) => {
        this.handleTyping(socket, data)
      })

      // Handle marking messages as read
      socket.on('mark_read', async (data) => {
        try {
          await this.handleMarkRead(socket, data)
        } catch (error) {
          socket.emit('error', { message: error.message })
        }
      })

      // Handle leaving conversation
      socket.on('leave_conversation', (data) => {
        this.handleLeaveConversation(socket, data)
      })

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`)
        this.users.delete(socket.userId)
        this.userSockets.delete(socket.id)

        // Notify others that user is offline
        this.broadcastUserStatus(socket.userId, false)
      })
    })

    return this.io
  }

  async handleJoinConversation(socket, data) {
    const { conversationId } = data

    // Verify user has access to conversation
    const conversation = await conversationModel.getDetailById(conversationId)
    if (!conversation) {
      throw new Error('Conversation not found')
    }

    if (conversation.userId.toString() !== socket.userId && conversation.trainerId.toString() !== socket.userId) {
      throw new Error('Access denied')
    }

    // Join room
    socket.join(`conversation_${conversationId}`)

    console.log(`User ${socket.userId} joined conversation ${conversationId}`)
    socket.emit('joined_conversation', { conversationId })
  }

  async handleSendMessage(socket, data) {
    const { conversationId, content } = data

    // Verify conversation access
    const conversation = await conversationModel.getDetailById(conversationId)
    if (!conversation) {
      throw new Error('Conversation not found')
    }

    if (conversation.userId.toString() !== socket.userId && conversation.trainerId.toString() !== socket.userId) {
      throw new Error('Access denied')
    }

    // Determine sender type
    const senderType = conversation.userId.toString() === socket.userId ? 'user' : 'trainer'

    // Create message
    const messageData = {
      conversationId,
      senderId: socket.userId,
      senderType,
      content,
      isRead: false,
    }

    const result = await messageModel.createNew(messageData)
    const createdMessage = await messageModel.getDetailById(result.insertedId)

    // Update conversation's last message
    await conversationModel.updateLastMessage(conversationId, content)

    // Emit to all users in conversation room
    this.io.to(`conversation_${conversationId}`).emit('new_message', {
      _id: createdMessage._id,
      conversationId: createdMessage.conversationId,
      senderId: createdMessage.senderId,
      senderType: createdMessage.senderType,
      content: createdMessage.content,
      timestamp: createdMessage.timestamp,
      isRead: createdMessage.isRead,
    })

    // Send push notification to offline users
    const recipientId =
      conversation.userId.toString() === socket.userId
        ? conversation.trainerId.toString()
        : conversation.userId.toString()

    if (!this.users.has(recipientId)) {
      // User is offline, could send push notification here
      console.log(`User ${recipientId} is offline, should send push notification`)
    }
  }

  handleTyping(socket, data) {
    const { conversationId, isTyping } = data

    // Broadcast typing status to others in conversation
    socket.to(`conversation_${conversationId}`).emit('user_typing', {
      conversationId,
      userId: socket.userId,
      userName: socket.user.fullName,
      isTyping,
    })
  }

  async handleMarkRead(socket, data) {
    const { conversationId, messageIds } = data

    // Verify conversation access
    const conversation = await conversationModel.getDetailById(conversationId)
    if (!conversation) {
      throw new Error('Conversation not found')
    }

    if (conversation.userId.toString() !== socket.userId && conversation.trainerId.toString() !== socket.userId) {
      throw new Error('Access denied')
    }

    // Mark messages as read
    const updatedCount = await messageModel.markMessagesAsRead(messageIds)

    // Broadcast to conversation room
    this.io.to(`conversation_${conversationId}`).emit('messages_read', {
      conversationId,
      messageIds,
      readBy: socket.userId,
      readByName: socket.user.fullName,
      updatedCount,
    })
  }

  handleLeaveConversation(socket, data) {
    const { conversationId } = data
    socket.leave(`conversation_${conversationId}`)
    console.log(`User ${socket.userId} left conversation ${conversationId}`)
  }

  broadcastUserStatus(userId, isOnline) {
    this.io.emit('user_status', {
      userId,
      isOnline,
      lastSeen: isOnline ? null : new Date(),
    })
  }

  // Helper method to send message to specific user
  sendToUser(userId, event, data) {
    const socketId = this.users.get(userId)
    if (socketId) {
      this.io.to(socketId).emit(event, data)
      return true
    }
    return false
  }

  // Helper method to check if user is online
  isUserOnline(userId) {
    return this.users.has(userId)
  }

  // Get online users count
  getOnlineUsersCount() {
    return this.users.size
  }

  // Get online users
  getOnlineUsers() {
    return Array.from(this.users.keys())
  }
}

// Create singleton instance
export const socketService = new SocketService()
