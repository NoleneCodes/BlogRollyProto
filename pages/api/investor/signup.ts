
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import bcrypt from 'bcryptjs';
import { sendInvestorWelcomeEmail } from '../../../lib/resend-client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      firstName,
      lastName,
      email,
      company,
      investmentRange,
      investorType,
      interests,
      message,
      password,
      linkedinUrl
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !investmentRange || !investorType || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields: first name, last name, email, investment range, investor type, and password are required' 
      });
    }

    // Check if investor already exists
    const { data: existingInvestor } = await supabase
      .from('investor_users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingInvestor) {
      return res.status(400).json({ error: 'An investor account with this email already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate verification token

    const verificationToken = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
    const tokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes from now

    // Insert new investor
    const { data: newInvestor, error: insertError } = await supabase
      .from('investor_users')
      .insert([{
        first_name: firstName,
        last_name: lastName,
        email,
        company: company || null,
        investment_range: investmentRange,
        investor_type: investorType,
        interests: interests || null,
        message: message || null,
        password_hash: passwordHash,
        verification_token: verificationToken,
        token_expires_at: tokenExpiresAt,
        linkedin_url: linkedinUrl || null,
        is_verified: false,
        linkedin_verified: false,
        verification_status: 'pending_email'
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Database error:', insertError);
      return res.status(500).json({ error: 'Failed to create investor account' });
    }

    // Send welcome email with verification link
    try {
  await sendInvestorWelcomeEmail(email, `${firstName} ${lastName}`, verificationToken);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the signup if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Investor account created successfully. Please check your email to verify your account.',
      investorId: newInvestor.id
    });

  } catch (error) {
    console.error('Investor signup error:', error);
    res.status(500).json({ error: 'Internal server error during signup' });
  }
}
