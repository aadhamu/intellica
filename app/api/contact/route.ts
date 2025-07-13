import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    // Send message to admin
    await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: [process.env.TO_EMAIL!],
      subject: `New message from ${name}: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    // Send confirmation to user
    await resend.emails.send({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'We received your message!',
      html: `
        <h2>Thank you for contacting us, ${name}!</h2>
        <p>We've received your message and will get back to you soon.</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <br>
        <p>Best regards,</p>
        <p>The ${process.env.COMPANY_NAME} Team</p>
      `,
    });

    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error: any) {
    console.error('Resend error:', error);
    return NextResponse.json({ message: 'Failed to send email' }, { status: 500 });
  }
}
