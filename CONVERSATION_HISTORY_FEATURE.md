# Conversation History Feature

## Overview
Added a conversation history feature that allows users to view, manage, and switch between their past conversations with each bot. This ensures that uploaded files and conversation context are preserved and accessible.

## Features Implemented

### 1. Conversation History Sidebar
- **Toggle Button**: Fixed position button in the top-left corner to open/close the history sidebar
- **Conversation List**: Shows all past conversations with the current bot, sorted by most recent
- **Conversation Details**: Each conversation shows:
  - Title (first 50 characters of the first message)
  - Message count
  - Last updated time (relative, e.g., "2 hours ago")
- **Delete Conversations**: Hover over a conversation to reveal a delete button
- **New Conversation**: Button at the top to start a fresh conversation

### 2. File Persistence
- **Thread-Based Isolation**: Each conversation has its own OpenAI thread
- **File Accessibility**: Uploaded files remain accessible within their original conversation
- **Cross-Conversation Isolation**: Files uploaded in one conversation are NOT accessible in other conversations
- **User Privacy**: Each user's conversations are completely isolated from other users

### 3. API Endpoints

#### GET `/api/conversations?botId={botId}`
Fetches all conversations for the authenticated user with a specific bot.

**Response:**
```json
[
  {
    "id": "conv_123",
    "title": "How do I start beekeeping?",
    "createdAt": "2024-10-16T10:00:00Z",
    "updatedAt": "2024-10-16T12:30:00Z",
    "messageCount": 15
  }
]
```

#### DELETE `/api/conversations/{conversationId}`
Deletes a specific conversation (with cascade delete for all messages).

**Response:**
```json
{
  "success": true
}
```

### 4. Component Structure

**ConversationHistory Component** (`src/components/chat/ConversationHistory.tsx`):
- Sliding sidebar panel with backdrop
- Real-time conversation loading
- Delete confirmation dialog
- Responsive design for mobile and desktop

**ChatInterface Integration** (`src/components/chat/ChatInterface.tsx`):
- Added router navigation for conversation switching
- New conversation handler that clears state
- Conversation selection handler that loads the selected conversation

## How It Works

### Starting a New Chat
1. User clicks "New Conversation" button
2. State is cleared (messages, input, files)
3. URL updates to `/chat?bot={slug}` (no conversation parameter)
4. Next message creates a new conversation and thread

### Continuing Existing Chat
1. User clicks on a conversation in the history
2. URL updates to `/chat?bot={slug}&conversation={id}`
3. Messages are loaded from the database
4. Thread ID is retrieved from the conversation
5. All uploaded files in that thread remain accessible

### File Upload Workflow
```
User uploads file → File sent to OpenAI → Returns fileId
                                              ↓
                     Message created with fileId attached to thread
                                              ↓
                     File remains in thread for entire conversation
                                              ↓
                     Accessible in ALL future messages in same conversation
                                              ↓
                     NOT accessible in other conversations (different threads)
```

## Security & Privacy

✅ **User Isolation**: Users can only access their own conversations
✅ **Ownership Verification**: API endpoints verify user owns the conversation before access/deletion
✅ **Thread Isolation**: Each conversation has a unique OpenAI thread ID
✅ **File Isolation**: Files attached to one thread cannot be accessed from another thread

## Database Schema

The feature uses the existing `Conversation` model:
```prisma
model Conversation {
  id        String    @id @default(cuid())
  title     String?
  threadId  String?   // OpenAI thread ID for conversation continuity
  userId    String    // Owner of the conversation
  user      User      @relation(...)
  botId     String    // Which bot this conversation is with
  bot       Bot       @relation(...)
  messages  Message[] // Cascade delete
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

## UI/UX Features

- **Visual Feedback**: Current conversation is highlighted in the sidebar
- **Smooth Animations**: Sidebar slides in/out with backdrop fade
- **Delete Confirmation**: Prevents accidental deletion
- **Empty State**: Friendly message when no conversations exist
- **Loading State**: Shows while fetching conversations
- **Relative Timestamps**: Uses `date-fns` for human-readable dates
- **Responsive Design**: Works on mobile and desktop

## Testing

To test the feature:

1. **Create Multiple Conversations**:
   - Chat with Bee Bot
   - Upload a file (e.g., Beekeeping Guide.pdf)
   - Ask questions about it
   - Start a new conversation
   - Upload a different file or ask different questions

2. **Verify File Persistence**:
   - Open conversation history
   - Switch back to first conversation
   - Ask a question about the previously uploaded file
   - ✅ Bot should have access to it

3. **Verify Isolation**:
   - Switch to second conversation
   - Ask about the file from the first conversation
   - ✅ Bot should NOT have access to it

4. **Test Deletion**:
   - Delete a conversation
   - Verify it's removed from the list
   - If it was the current conversation, verify a new one is started

## Dependencies Added

- `date-fns`: For formatting relative timestamps (e.g., "2 hours ago")

## Files Modified/Created

**Created**:
- `src/components/chat/ConversationHistory.tsx`
- `src/app/api/conversations/route.ts`
- `src/app/api/conversations/[conversationId]/route.ts`
- `CONVERSATION_HISTORY_FEATURE.md`

**Modified**:
- `src/components/chat/ChatInterface.tsx`
- `package.json` (added date-fns dependency)

## Future Enhancements

Potential improvements for future versions:

1. **Search Conversations**: Add search/filter functionality
2. **Conversation Renaming**: Allow users to rename conversations
3. **Archive/Favorite**: Mark important conversations
4. **Export Multiple**: Export multiple conversations at once
5. **Conversation Sharing**: Share conversations with team members (if multi-user feature is added)
6. **Conversation Tags**: Add tags/categories to conversations
7. **Pagination**: For users with many conversations
8. **Conversation Preview**: Show last message in the list

## Notes

- Conversations are automatically created when the first message is sent
- The conversation title is auto-generated from the first 50 characters of the first message
- Deleting a conversation also deletes all associated messages (cascade delete)
- The conversation history is bot-specific (each bot has its own conversation history)

