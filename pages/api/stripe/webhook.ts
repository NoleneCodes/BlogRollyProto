
import type { NextApiRequest, NextApiResponse } from 'next'
import { stripe } from '../../../lib/stripe'
import { buffer } from 'micro'
import { supabaseDB } from '../../../lib/supabase'
import { emailService } from '../../../lib/email-templates'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const buf = await buffer(req)
  const sig = req.headers['stripe-signature']!
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event

  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret)
  } catch (err: any) {
    console.log(`Webhook signature verification failed.`, err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        console.log('Checkout session completed:', session.id)
        
        // Get customer and subscription details
        const customer = await stripe.customers.retrieve(session.customer as string)
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        
        if (typeof customer === 'object' && customer.email) {
          // Find user by email
          const { data: user, error: userError } = await supabaseDB.getUserByEmail(customer.email)
          
          if (user && !userError) {
            // Update user to pro tier
            await supabaseDB.updateUserTier(user.id, 'pro')
            
            // Update blogger profile with Stripe details
            await supabaseDB.updateBloggerStripeInfo(user.id, {
              stripe_customer_id: customer.id,
              subscription_status: 'active',
              subscription_id: subscription.id,
              subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString()
            })
            
            // Send premium welcome email
            await emailService.sendPremiumWelcome(customer.email, user.first_name || 'there')
            
            // Add to Mailchimp with premium tag
            await emailService.addToMailchimpAudience(customer.email, user.first_name || 'User', ['premium', 'blogger'])
          }
        }
        break
      
      case 'invoice.payment_succeeded':
        const invoice = event.data.object
        console.log('Invoice payment succeeded:', invoice.id)
        
        if (invoice.subscription && invoice.customer) {
          const customer = await stripe.customers.retrieve(invoice.customer as string)
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
          
          if (typeof customer === 'object' && customer.email) {
            const { data: user } = await supabaseDB.getUserByEmail(customer.email)
            
            if (user) {
              // Update subscription end date
              await supabaseDB.updateBloggerStripeInfo(user.id, {
                subscription_status: 'active',
                subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString()
              })
              
              // Send payment successful email
              const planName = subscription.items.data[0]?.price.nickname || 'Pro Plan'
              const amount = `$${(invoice.amount_paid / 100).toFixed(2)}`
              const nextBillingDate = new Date(subscription.current_period_end * 1000).toLocaleDateString()
              
              await emailService.sendPaymentSuccessful(
                customer.email,
                user.first_name || 'User',
                amount,
                planName,
                invoice.hosted_invoice_url || '',
                nextBillingDate
              )
            }
          }
        }
        break
      
      case 'invoice.payment_failed':
        const failedInvoice = event.data.object
        console.log('Invoice payment failed:', failedInvoice.id)
        
        if (failedInvoice.customer) {
          const customer = await stripe.customers.retrieve(failedInvoice.customer as string)
          const subscription = await stripe.subscriptions.retrieve(failedInvoice.subscription as string)
          
          if (typeof customer === 'object' && customer.email) {
            const { data: user } = await supabaseDB.getUserByEmail(customer.email)
            
            if (user) {
              // Update subscription status
              await supabaseDB.updateBloggerStripeInfo(user.id, {
                subscription_status: 'past_due'
              })
              
              const planName = subscription.items.data[0]?.price.nickname || 'Pro Plan'
              const amount = `$${(failedInvoice.amount_due / 100).toFixed(2)}`
              
              // Determine if this is first or final notice based on attempt count
              const isFirstNotice = failedInvoice.attempt_count === 1
              
              if (isFirstNotice) {
                const retryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
                await emailService.sendPaymentFailedNotice(
                  customer.email,
                  user.first_name || 'User',
                  planName,
                  amount,
                  'first',
                  retryDate
                )
              } else {
                const delistDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()
                await emailService.sendPaymentFailedNotice(
                  customer.email,
                  user.first_name || 'User',
                  planName,
                  amount,
                  'final',
                  undefined,
                  delistDate
                )
              }
            }
          }
        }
        break
      
      case 'customer.subscription.deleted':
      case 'customer.subscription.updated':
        const subscription = event.data.object
        console.log('Subscription event:', event.type, subscription.id)
        
        if (subscription.customer) {
          const customer = await stripe.customers.retrieve(subscription.customer as string)
          
          if (typeof customer === 'object' && customer.email) {
            const { data: user } = await supabaseDB.getUserByEmail(customer.email)
            
            if (user) {
              const isActive = subscription.status === 'active'
              const isCanceled = subscription.status === 'canceled' || event.type === 'customer.subscription.deleted'
              
              if (isCanceled) {
                // Downgrade user to free tier
                await supabaseDB.updateUserTier(user.id, 'free')
                
                // Update blogger profile
                await supabaseDB.updateBloggerStripeInfo(user.id, {
                  subscription_status: 'canceled',
                  subscription_end_date: new Date(subscription.ended_at ? subscription.ended_at * 1000 : Date.now()).toISOString()
                })
                
                // Get user's current live blog count for delisting email
                const { data: submissions } = await supabaseDB.getUserApprovedSubmissions(user.id)
                const liveCount = submissions?.filter(s => s.is_live).length || 0
                
                if (liveCount > 3) {
                  // Send blog delisted email
                  const amount = `$${((subscription.items.data[0]?.price.unit_amount || 0) / 100).toFixed(2)}`
                  await emailService.sendBlogDelistedPayment(
                    customer.email,
                    user.first_name || 'User',
                    liveCount,
                    amount
                  )
                  
                  // Deactivate excess blogs (keep only 3 most recent)
                  if (submissions) {
                    const sortedSubmissions = submissions
                      .filter(s => s.is_live)
                      .sort((a, b) => new Date(b.live_at || b.approved_at || '').getTime() - new Date(a.live_at || a.approved_at || '').getTime())
                    
                    const toDeactivate = sortedSubmissions.slice(3)
                    for (const submission of toDeactivate) {
                      await supabaseDB.toggleBlogLiveStatus(submission.id, user.id, false)
                    }
                  }
                }
                
                // Update Mailchimp tags
                await emailService.addToMailchimpAudience(customer.email, user.first_name || 'User', ['free', 'blogger'])
              } else {
                // Update subscription info for other status changes
                await supabaseDB.updateBloggerStripeInfo(user.id, {
                  subscription_status: subscription.status as any,
                  subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString()
                })
              }
            }
          }
        }
        break
      
      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    res.status(500).json({ error: 'Webhook handler failed' })
  }
}
