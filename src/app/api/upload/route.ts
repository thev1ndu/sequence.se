import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";

import { r2 } from "@/lib/r2";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const bucketName = process.env.R2_BUCKET_NAME;
    if (!bucketName) {
      return NextResponse.json(
        { error: "R2 bucket not configured" },
        { status: 500 }
      );
    }

    // Generate a unique key for the file
    const ext = file.name.split(".").pop();
    const key = `uploads/${nanoid()}.${ext}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });

    await r2.send(command);

    // Construct the public URL
    let publicDomain = process.env.NEXT_PUBLIC_R2_DOMAIN || '';
    // Remove trailing slash if present
    publicDomain = publicDomain.replace(/\/$/, '');
    
    const publicUrl = publicDomain
      ? `${publicDomain}/${key}`
      : `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${bucketName}/${key}`;

    return NextResponse.json({
      publicUrl,
      key,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: "No URL provided" },
        { status: 400 }
      );
    }

    const bucketName = process.env.R2_BUCKET_NAME;
    if (!bucketName) {
      return NextResponse.json(
        { error: "R2 bucket not configured" },
        { status: 500 }
      );
    }

    // Extract key from URL (e.g., "uploads/abc123.jpg")
    const publicDomain = process.env.NEXT_PUBLIC_R2_DOMAIN || '';
    let key = url;
    
    if (publicDomain && url.startsWith(publicDomain)) {
      key = url.replace(publicDomain + '/', '');
    } else if (url.includes('/uploads/')) {
      key = 'uploads/' + url.split('/uploads/').pop();
    }

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await r2.send(command);

    return NextResponse.json({ success: true, deletedKey: key });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
