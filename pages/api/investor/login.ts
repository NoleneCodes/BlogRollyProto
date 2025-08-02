import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if investor exists and is fully verified
    const { data: investor, error: findError } = await supabase
      .from('investor_users')
      .select('id, email, name, company, investor_type, password_hash, is_verified, linkedin_verified, verification_status')
      .eq('email', email)
      .single();

    if (findError || !investor) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    if (!investor.is_verified) {
      return res.status(400).json({ error: 'Please verify your email before logging in' });
    }

    if (investor.verification_status === 'pending_linkedin') {
      return res.status(400).json({ error: 'Please complete LinkedIn verification before accessing the dashboard' });
    }

    if (investor.verification_status === 'rejected') {
      return res.status(400).json({ error: 'Your account verification was rejected. Please contact support.' });
    }

    if (investor.verification_status !== 'fully_verified') {
      return res.status(400).json({ error: 'Account verification is still pending. Please wait for approval.' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, investor.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    await supabase
      .from('investor_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', investor.id);

    // Generate JWT token
    const token = jwt.sign(
      { 
        investorId: investor.id, 
        email: investor.email,
        name: investor.name,
        type: 'investor'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      investor: {
        id: investor.id,
        email: investor.email,
        name: investor.name,
        company: investor.company,
        investorType: investor.investor_type
      }
    });

  } catch (error) {
    console.error('Investor login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
}