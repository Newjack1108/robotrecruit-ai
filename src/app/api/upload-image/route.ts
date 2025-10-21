import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

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

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    // Upload to imgbb (free image hosting)
    // Get your own API key from https://api.imgbb.com/
    const apiKey = process.env.IMGBB_API_KEY;
    
    if (!apiKey) {
      console.error('[IMAGE_UPLOAD_ERROR] IMGBB_API_KEY not configured');
      return new NextResponse(
        'Image upload service not configured. Please add IMGBB_API_KEY to your environment variables.',
        { status: 503 }
      );
    }

    const uploadFormData = new FormData();
    uploadFormData.append('image', base64);
    
    const imgbbResponse = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      {
        method: 'POST',
        body: uploadFormData,
      }
    );

    if (!imgbbResponse.ok) {
      const errorText = await imgbbResponse.text();
      console.error('[IMAGE_UPLOAD_ERROR] imgbb response:', imgbbResponse.status, errorText);
      throw new Error(`Failed to upload to image host: ${imgbbResponse.status}`);
    }

    const data = await imgbbResponse.json();

    return NextResponse.json({
      url: data.data.url,
      display_url: data.data.display_url,
    });
  } catch (error) {
    console.error('[IMAGE_UPLOAD_ERROR]', error);
    return new NextResponse('Failed to upload image', { status: 500 });
  }
}



