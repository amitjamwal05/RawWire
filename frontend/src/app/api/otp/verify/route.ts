import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import OTP from '@/models/OTP';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ message: 'Email and OTP are required' }, { status: 400 });
    }

    await connectToDatabase();

    // Find the most recent OTP for this email
    const record = await OTP.findOne({ email }).sort({ createdAt: -1 });

    if (!record) {
      return NextResponse.json({ message: 'OTP expired or not found. Please request a new one.' }, { status: 400 });
    }

    if (record.isVerified) {
      return NextResponse.json({ message: 'Email address already verified.' }, { status: 400 });
    }

    if (record.otp !== otp.toString()) {
      return NextResponse.json({ message: 'Invalid OTP code.' }, { status: 400 });
    }

    // Mark as verified
    record.isVerified = true;
    await record.save();

    return NextResponse.json({ success: true, message: 'Email verified successfully!' });
  } catch (error) {
    console.error('OTP Verify Error:', error);
    return NextResponse.json({ message: 'Failed to verify OTP' }, { status: 500 });
  }
}
