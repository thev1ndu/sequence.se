import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Perform a lightweight query to keep the Supabase project active
    const { error } = await supabase.from('posts').select('id').limit(1);

    if (error) {
      console.error('Supabase keep-alive cron failed:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Supabase project pinged successfully' });
  } catch (error: any) {
    console.error('Supabase keep-alive cron error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
