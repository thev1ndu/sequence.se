"use server";

import { supabase } from "@/lib/supabase";
import { r2 } from "@/lib/r2";
import { HeadBucketCommand } from "@aws-sdk/client-s3";

export async function getSystemStatus() {
  const status = {
    database: { status: "offline", latency: 0, message: "" },
    storage: { status: "offline", latency: 0, message: "" },
    api: { status: "online", latency: 0, message: "Next.js Environment" },
  };

  // Check Database
  const dbStart = performance.now();
  try {
    const { count, error } = await supabase.from("posts").select("*", { count: "exact", head: true });
    const dbEnd = performance.now();
    status.database.latency = Math.round(dbEnd - dbStart);
    
    if (error) throw error;
    status.database.status = "online";
    status.database.message = "Supabase PostgreSQL";
  } catch (error: any) {
    status.database.status = "error";
    status.database.message = error.message || "Connection failed";
    console.error("DB Health Check Failed:", error);
  }

  // Check Storage (R2)
  const storageStart = performance.now();
  try {
    // Check if R2_BUCKET_NAME is set
    const bucketName = process.env.R2_BUCKET_NAME;
    if (!bucketName) {
        throw new Error("R2_BUCKET_NAME env var is missing");
    }

    // HeadBucket is better for checking access to a specific bucket
    await r2.send(new HeadBucketCommand({ Bucket: bucketName }));
    
    const storageEnd = performance.now();
    status.storage.latency = Math.round(storageEnd - storageStart);
    status.storage.status = "online";
    status.storage.message = "Cloudflare R2";
  } catch (error: any) {
    status.storage.status = "error";
    status.storage.message = error.message || "Connection failed";
    console.error("R2 Health Check Failed:", error);
  }

  return status;
}
