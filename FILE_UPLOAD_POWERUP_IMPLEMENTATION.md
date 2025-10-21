# File Upload Power-Up - Full Implementation

## Overview
The File Upload power-up now allows users to upload documents (PDF, DOC, DOCX, TXT, CSV) directly in conversations, and the bot can analyze and answer questions about the uploaded files.

## How It Works

### User Flow:
1. User activates the **File Upload** power-up (📁 icon)
2. Green file upload button appears in the chat input
3. User clicks button and selects a document
4. File name shows in green pill next to input
5. User types a message or question about the file
6. File is uploaded to OpenAI and attached to the message
7. Bot analyzes the file and responds with insights

### Technical Flow:
1. **File Selection** - User selects file via FileUploadButton
2. **File Upload** - File uploaded to `/api/upload-file`
3. **OpenAI Upload** - File sent to OpenAI Files API
4. **File Attachment** - OpenAI file ID attached to thread message
5. **Bot Analysis** - Assistant uses file_search tool to analyze document
6. **Response** - Bot answers questions based on file content

## Files Created/Modified

### 1. New API Endpoint: `/api/upload-file/route.ts`
**Purpose:** Upload documents to OpenAI Files API

**Features:**
- Validates file size (10MB limit)
- Validates file type (PDF, DOC, DOCX, TXT, CSV, MD, JSON)
- Uploads to OpenAI with purpose: 'assistants'
- Returns OpenAI file ID

**Usage:**
```typescript
POST /api/upload-file
Content-Type: multipart/form-data

Body: FormData with 'file' field
```

**Response:**
```json
{
  "fileId": "file-xyz123",
  "filename": "document.pdf",
  "bytes": 1024000
}
```

### 2. Updated: `src/lib/openai.ts`
**Changes:**
- Added `fileId` parameter to `sendMessage()` function
- Attach files to messages using `attachments` field
- Files use file_search tool for analysis

**New Signature:**
```typescript
export async function sendMessage(
  threadId: string,
  assistantId: string,
  message: string,
  imageUrl?: string,
  fileId?: string  // NEW
)
```

**File Attachment:**
```typescript
messageData.attachments = [
  {
    file_id: fileId,
    tools: [{ type: 'file_search' }],
  },
];
```

### 3. Updated: `src/app/api/chat/route.ts`
**Changes:**
- Accept `fileId` in request body
- Pass `fileId` to `sendMessage()` function

**Request Body:**
```typescript
{
  message: string,
  botId: string,
  conversationId?: string,
  imageUrl?: string,
  fileId?: string,  // NEW
  activePowerUps?: string[]
}
```

### 4. Updated: `src/components/chat/ChatInterface.tsx`
**Changes:**
- Handle `selectedFile` state
- Upload file to `/api/upload-file` before sending message
- Include file ID in chat API call
- Clear file after sending

**Key Updates:**
```typescript
// Check if file is selected
if ((!input.trim() && !selectedImage && !selectedFile) || isLoading) return;

// Upload document to OpenAI
if (documentToUpload) {
  const formData = new FormData();
  formData.append('file', documentToUpload);
  
  const uploadResponse = await fetch('/api/upload-file', {
    method: 'POST',
    body: formData,
  });
  
  const uploadData = await uploadResponse.json();
  uploadedFileId = uploadData.fileId;
}

// Include in chat request
body: JSON.stringify({
  message: userMessage,
  botId,
  conversationId,
  imageUrl: uploadedImageUrl,
  fileId: uploadedFileId,  // NEW
  activePowerUps: Array.from(activePowerUps),
})
```

## Supported File Types

### Document Formats:
- ✅ **PDF** - `application/pdf`
- ✅ **Word** - `application/msword`, `.docx`
- ✅ **Text** - `text/plain`
- ✅ **CSV** - `text/csv`
- ✅ **Markdown** - `text/markdown`
- ✅ **JSON** - `application/json`

### File Size Limit:
- **10MB maximum** (OpenAI Assistants API limit)

## Example Use Cases

### 1. PDF Analysis
**User uploads:** Beekeepers Guide.pdf  
**User asks:** "What are the main topics covered in this guide?"  
**Bot:** Analyzes PDF and provides summary of topics

### 2. Document Q&A
**User uploads:** Meeting_Notes.docx  
**User asks:** "What were the action items from this meeting?"  
**Bot:** Extracts action items from the document

### 3. Data Analysis
**User uploads:** sales_data.csv  
**User asks:** "What's the average revenue per month?"  
**Bot:** Analyzes CSV data and provides insights

### 4. Code Review
**User uploads:** config.json  
**User asks:** "Are there any security issues in this config?"  
**Bot:** Reviews configuration and suggests improvements

## Key Features

### ✅ File Search Integration
- Files are automatically indexed by OpenAI
- Bot can search within file content
- Supports natural language queries
- Provides citations from documents

### ✅ Conversation-Specific
- Files are attached to specific messages
- Not permanently added to bot's knowledge base
- Each conversation can have different files
- Files are accessible throughout the conversation

### ✅ User-Friendly UI
- Clear file selection indicator
- Shows file name in green pill
- Easy to remove selected file
- Visual feedback during upload

### ✅ Error Handling
- File size validation
- File type validation
- Upload error messages
- Graceful fallbacks

## Differences from Bot File Manager

### File Upload Power-Up (Conversation Files):
- ✅ Temporary - attached to specific conversation
- ✅ User-initiated - users upload their own files
- ✅ Per-message - different files per question
- ✅ Private - only visible in that conversation
- ❌ Not persistent - lost when conversation ends

### Bot File Manager (Permanent Knowledge):
- ✅ Permanent - added to bot's vector store
- ✅ Admin-managed - admin uploads files for all users
- ✅ Global - available to all conversations
- ✅ Persistent - remains forever
- ❌ Requires admin access

## Testing Checklist

- [x] File upload API endpoint created
- [x] OpenAI library updated for file attachments
- [x] Chat API accepts and passes file ID
- [x] ChatInterface uploads files before sending
- [x] File validation (size and type)
- [x] Error handling implemented
- [x] UI shows file selection
- [x] No linter errors

## Testing Instructions

### To Test File Upload:
1. Start dev server (`npm run dev`)
2. Go to `/chat` and select a bot
3. Activate **File Upload** power-up (📁 icon)
4. Click green file button
5. Select a PDF, DOC, or TXT file
6. File name appears in green pill
7. Type: "What is this document about?"
8. Send message
9. Bot should analyze and respond based on file content

### Expected Behavior:
- ✅ File uploads successfully
- ✅ Bot acknowledges file content
- ✅ Bot can answer questions about the file
- ✅ Bot can search within the file
- ✅ Responses are based on actual file content

### Debugging:
Check server logs for:
```
[FILE_UPLOAD] Uploading file to OpenAI: filename.pdf application/pdf 1024000
[FILE_UPLOAD] File uploaded successfully: file-xyz123
[OPENAI_DEBUG] Attaching file: file-xyz123
```

## Limitations

1. **10MB File Size** - OpenAI Assistants API limitation
2. **Text-Based Files Only** - Images require Image Recognition power-up
3. **No File History** - Files not saved between conversations
4. **One File Per Message** - Can't attach multiple files at once
5. **Processing Time** - Large files may take longer to analyze

## Future Enhancements

1. **Multiple Files** - Allow multiple file attachments per message
2. **File History** - Show previously uploaded files in conversation
3. **File Preview** - Display file content in UI
4. **Batch Upload** - Upload multiple files at once
5. **File Types** - Support more file formats
6. **File Storage** - Option to save files permanently
7. **File Sharing** - Share files between conversations
8. **Progress Indicator** - Show upload progress for large files

## Security Considerations

### ✅ Implemented:
- Authentication required (Clerk)
- File size validation
- File type validation
- Server-side upload handling
- OpenAI file isolation

### 📋 Recommendations:
- Monitor OpenAI API usage/costs
- Set up rate limiting
- Implement file scanning for malware
- Add usage quotas per user
- Clean up unused files periodically

## Cost Considerations

### OpenAI Costs:
- **File Storage:** $0.10/GB/day (for stored files)
- **File Search:** Included in Assistant API usage
- **Processing:** Based on tokens processed

### Best Practices:
- Delete files after conversation ends
- Limit file size to necessary amount
- Monitor total storage usage
- Clean up old files regularly

---

**Status:** ✅ Fully Implemented and Ready for Testing  
**Implementation Date:** October 16, 2025  
**Impact:** Major feature - enables document analysis in conversations

