import express from 'express'
import { conversationController } from '../controller/conversation.controller'
import { conversationValidation } from '../validation/conversation.validation'
import { authMiddleware } from '~/middlewares/auth.middleware'

const Router = express.Router()

// Base route: /api/conversations
Router.route('/')
  // Create new conversation or get existing one
  .post(authMiddleware, conversationController.createOrGetConversation)
// Get all conversations for user
Router.route('/:id').get(conversationController.getConversations)

// Route for unread count: /api/conversations/unread-count
Router.route('/unread-count').get(authMiddleware, conversationController.getUnreadCount)

// Route for specific conversation messages: /api/conversations/:conversationId/messages
Router.route('/:conversationId/messages')
  // Get messages in conversation
  .get(authMiddleware, conversationController.getMessages)
  // Send message to conversation
  .post(authMiddleware, conversationController.sendMessage)

// Route for marking messages as read: /api/conversations/:conversationId/messages/read
Router.route('/:conversationId/messages/read').put(authMiddleware, conversationController.markMessagesAsRead)

export const conversationRoute = Router
