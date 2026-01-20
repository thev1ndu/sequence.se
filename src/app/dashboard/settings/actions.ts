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

  const dbStart = performance.now();
  try {
    const { error } = await supabase.from("posts").select("id").limit(1);
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

  const storageStart = performance.now();
  try {
    if (!process.env.R2_BUCKET_NAME) {
      throw new Error("R2_BUCKET_NAME is not set");
    }

    await r2.send(new HeadBucketCommand({ Bucket: process.env.R2_BUCKET_NAME }));
    
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
