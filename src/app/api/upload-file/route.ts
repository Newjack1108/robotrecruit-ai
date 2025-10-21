import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new NextResponse('No file provided', { status: 400 });
    }

    // Check file size (10MB limit for OpenAI)
    if (file.size > 10 * 1024 * 1024) {
      return new NextResponse('File must be under 10MB', { status: 400 });
    }

    // Check file type - OpenAI supports these for Assistants
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv',
      'text/markdown',
      'application/json',
    ];

    if (!allowedTypes.includes(file.type)) {
      return new NextResponse(
        'Only PDF, DOC, DOCX, TXT, CSV, MD, and JSON files are supported',
        { status: 400 }
      );
    }

    console.log('[FILE_UPLOAD] Uploading file to OpenAI:', file.name, file.type, file.size);

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a File object for OpenAI (using Node.js Buffer)
    const uploadFile = new File([buffer], file.name, { type: file.type });

    // Upload to OpenAI
    const openaiFile = await openai.files.create({
      file: uploadFile,
      purpose: 'assistants',
    });

    console.log('[FILE_UPLOAD] File uploaded successfully:', openaiFile.id);

    return NextResponse.json({
      fileId: openaiFile.id,
      filename: openaiFile.filename,
      bytes: openaiFile.bytes,
    });

  } catch (error) {
    console.error('[FILE_UPLOAD_ERROR]', error);
    return new NextResponse(
      `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500 }
    );
  }
}

