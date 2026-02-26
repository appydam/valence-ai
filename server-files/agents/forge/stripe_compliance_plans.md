# Stripe Compliance Plans Configuration

## Overview
This document defines the Stripe pricing configuration for AlgoHouse Compliance Edition. All plans include a 30-day free trial (no credit card required) and automated lifecycle webhooks.

**Stripe Account:** `acct_algohouse_prod`  
**Configuration Date:** March 1, 2026

---

## Plan 1: Starter ($1,250/month)

### Stripe Product Configuration
```json
{
  "name": "AlgoHouse Compliance Edition - Starter",
  "description": "Essential compliance tools for small crypto asset service providers. Includes audit logs, wash trading detection, and basic regulatory reporting.",
  "statement_descriptor": "ALGOHOUSE COMP",
  "unit_label": "seat"
}
```

### Stripe Price Configuration
```json
{
  "product": "prod_starter_compliance",
  "unit_amount": 125000,
  "currency": "usd",
  "recurring": {
    "interval": "month",
    "usage_type": "licensed",
    "trial_period_days": 30
  },
  "billing_scheme": "per_unit",
  "tiers_mode": null,
  "tax_behavior": "exclusive"
}
```

### Plan Features (Displayed on Checkout)
- ✅ 5 exchange pairs
- ✅ 100M ticks/month
- ✅ Audit log (90-day retention)
- ✅ Wash trading detection
- ✅ Email support (<24h response)
- ✅ 99.5% uptime SLA
- ❌ Real-time alerts (webhook)
- ❌ SAR generation
- ❌ Dedicated support

### Trial Configuration
- **Duration:** 30 days
- **Credit card required:** No
- **Auto-conversion:** Yes (trial → paid on day 31, email sent day 23)
- **Trial cancellation:** Allowed anytime, no charge

---

## Plan 2: Professional ($2,917/month)

### Stripe Product Configuration
```json
{
  "name": "AlgoHouse Compliance Edition - Professional",
  "description": "Advanced compliance infrastructure for mid-size crypto firms. Includes real-time alerts, SAR generation, and priority support.",
  "statement_descriptor": "ALGOHOUSE COMP PRO",
  "unit_label": "organization"
}
```

### Stripe Price Configuration
```json
{
  "product": "prod_professional_compliance",
  "unit_amount": 291700,
  "currency": "usd",
  "recurring": {
    "interval": "month",
    "usage_type": "licensed",
    "trial_period_days": 30
  },
  "billing_scheme": "per_unit",
  "tiers_mode": null,
  "tax_behavior": "exclusive"
}
```

### Plan Features
- ✅ 50 exchange pairs
- ✅ 1B ticks/month
- ✅ Audit log (5-year retention)
- ✅ Wash trading detection + cross-exchange analysis
- ✅ Real-time alerts (webhook)
- ✅ SAR generation (automated)
- ✅ Transaction reports (MiFID II-style)
- ✅ Priority email/phone support (<4h response)
- ✅ 99.9% uptime SLA
- ❌ Regulator access portal
- ❌ Dedicated CSM

### Trial Configuration
- **Duration:** 30 days
- **Credit card required:** No
- **Auto-conversion:** Yes (trial → paid on day 31, email sent day 23)
- **Trial cancellation:** Allowed anytime, no charge

---

## Plan 3: Enterprise (Custom Invoice)

### Stripe Product Configuration
```json
{
  "name": "AlgoHouse Compliance Edition - Enterprise",
  "description": "White-glove compliance solution for large institutions. Custom exchange coverage, dedicated CSM, and direct regulator portal access.",
  "statement_descriptor": "ALGOHOUSE ENT"
}
```

### Pricing Model
- **Not configured in Stripe:** Enterprise pricing is custom-quoted based on:
  - Number of exchange pairs (unlimited)
  - Monthly tick volume (>1B ticks)
  - Custom integrations (e.g., direct ESMA reporting API)
  - SLA requirements (e.g., 99.95% instead of 99.9%)

**Process:**
1. Prospect fills out "Contact Sales" form
2. Sales team quotes custom pricing (typically $10K-$50K/month)
3. Contract signed (1-year minimum)
4. Invoice sent manually via Stripe Invoice API (not subscription)

### Plan Features
- ✅ Unlimited exchange pairs
- ✅ Unlimited ticks/month
- ✅ Audit log (10-year retention)
- ✅ Cross-market surveillance (5+ venues)
- ✅ Real-time alerts + anomaly detection
- ✅ SAR generation + direct FIU submission
- ✅ Transaction reports (auto-submit to ESMA)
- ✅ Regulator access portal (BaFin/ESMA login)
- ✅ 24/7 phone/email support (<1h response)
- ✅ Dedicated CSM + monthly QBR
- ✅ 99.9% uptime SLA (or custom)
- ✅ Custom integrations (Solidus HALO, etc.)

### Trial Configuration
- **Duration:** 30 days (extended to 60 days if needed)
- **Credit card required:** No
- **Auto-conversion:** No (manual contract signature required)
- **Trial cancellation:** Allowed anytime

---

## Webhook Configuration

### Required Webhooks
All webhooks send to: `https://api.algohouse.com/v1/webhooks/stripe`

#### 1. `customer.subscription.created`
**Purpose:** Log new subscription start, provision API keys, send welcome email

**Payload Example:**
```json
{
  "id": "evt_abc123",
  "type": "customer.subscription.created",
  "data": {
    "object": {
      "id": "sub_xyz789",
      "customer": "cus_abc123",
      "status": "trialing",
      "trial_end": 1709395200,
      "current_period_start": 1706803200,
      "current_period_end": 1709395200,
      "plan": {
        "id": "price_professional",
        "amount": 291700,
        "interval": "month"
      }
    }
  }
}
```

**AlgoHouse Action:**
1. Create user account in AlgoHouse database
2. Generate OAuth 2.0 client credentials
3. Send email: "Welcome to AlgoHouse Compliance Edition - Your Trial Starts Now"
4. Provision 30-day trial access

---

#### 2. `customer.subscription.trial_will_end`
**Purpose:** Send reminder 7 days before trial ends, prompt to add payment method

**Trigger:** 7 days before `trial_end` timestamp

**Payload Example:**
```json
{
  "id": "evt_abc456",
  "type": "customer.subscription.trial_will_end",
  "data": {
    "object": {
      "id": "sub_xyz789",
      "customer": "cus_abc123",
      "status": "trialing",
      "trial_end": 1709395200,
      "plan": {
        "id": "price_professional",
        "amount": 291700
      }
    }
  }
}
```

**AlgoHouse Action:**
1. Send email: "Your AlgoHouse trial ends in 7 days"
2. Include link to add payment method: `https://app.algohouse.com/billing/add-payment`
3. Highlight features used during trial (e.g., "You flagged 127 wash trades this month")
4. Offer call with compliance team if they have questions

---

#### 3. `invoice.payment_succeeded`
**Purpose:** Confirm payment received, extend access for next billing cycle

**Payload Example:**
```json
{
  "id": "evt_abc789",
  "type": "invoice.payment_succeeded",
  "data": {
    "object": {
      "id": "in_xyz123",
      "customer": "cus_abc123",
      "subscription": "sub_xyz789",
      "amount_paid": 291700,
      "period_start": 1709395200,
      "period_end": 1711987200,
      "status": "paid"
    }
  }
}
```

**AlgoHouse Action:**
1. Extend access for next 30 days
2. Send email: "Payment received - Thank you!"
3. Attach invoice PDF
4. Log payment in internal billing system

---

#### 4. `customer.subscription.updated` (Month 11 Renewal Reminder)
**Purpose:** Send renewal reminder 30 days before annual contract renewal

**Trigger:** When subscription reaches 11th month (for annual contracts)

**Payload Example:**
```json
{
  "id": "evt_abc012",
  "type": "customer.subscription.updated",
  "data": {
    "object": {
      "id": "sub_xyz789",
      "customer": "cus_abc123",
      "status": "active",
      "current_period_start": 1739395200,
      "current_period_end": 1742073600,
      "billing_cycle_anchor": 1709395200,
      "plan": {
        "id": "price_professional",
        "amount": 291700,
        "interval": "month"
      }
    }
  }
}
```

**AlgoHouse Action (if month 11):**
1. Calculate: `(current_period_start - billing_cycle_anchor) / 30 days ≈ 11 months`
2. Send email: "Your annual contract renews in 30 days"
3. Offer renewal call with CSM (Enterprise) or sales (Professional)
4. Include usage summary: "You processed 12.3B ticks this year, flagged 1,542 wash trades"
5. Upsell opportunity: "Upgrade to Enterprise for cross-market surveillance"

---

#### 5. `customer.subscription.deleted`
**Purpose:** Log cancellation, revoke access, send exit survey

**Payload Example:**
```json
{
  "id": "evt_abc345",
  "type": "customer.subscription.deleted",
  "data": {
    "object": {
      "id": "sub_xyz789",
      "customer": "cus_abc123",
      "status": "canceled",
      "canceled_at": 1711987200,
      "ended_at": 1711987200
    }
  }
}
```

**AlgoHouse Action:**
1. Revoke API access immediately
2. Send email: "Your AlgoHouse subscription has been canceled"
3. Retain audit logs (5-year retention per MiCA Article 81)
4. Send exit survey: "Why did you cancel?"
5. Offer to export compliance data (CSV/PDF)

---

## Checkout Flow

### Stripe Checkout Session Configuration
```json
{
  "mode": "subscription",
  "line_items": [
    {
      "price": "price_professional",
      "quantity": 1
    }
  ],
  "success_url": "https://app.algohouse.com/onboarding?session_id={CHECKOUT_SESSION_ID}",
  "cancel_url": "https://app.algohouse.com/pricing",
  "customer_email": "{{user_email}}",
  "allow_promotion_codes": true,
  "billing_address_collection": "required",
  "automatic_tax": {
    "enabled": true
  },
  "subscription_data": {
    "trial_period_days": 30,
    "trial_settings": {
      "end_behavior": {
        "missing_payment_method": "cancel"
      }
    }
  },
  "consent_collection": {
    "terms_of_service": "required"
  }
}
```

### Key Settings
- **Payment methods:** Card, SEPA Direct Debit, Bank Transfer (ACH for US customers)
- **Tax calculation:** Automatic (Stripe Tax enabled for VAT/GST)
- **Promotion codes:** Enabled (e.g., `STARTUP40` for 40% off first 6 months)
- **Trial end behavior:** Cancel subscription if no payment method added by trial end

---

## Customer Portal Configuration

### Stripe Customer Portal Settings
```json
{
  "business_profile": {
    "headline": "Manage your AlgoHouse Compliance Edition subscription"
  },
  "features": {
    "payment_method_update": {
      "enabled": true
    },
    "invoice_history": {
      "enabled": true
    },
    "subscription_update": {
      "enabled": true,
      "products": [
        {
          "product": "prod_starter_compliance",
          "prices": ["price_starter"]
        },
        {
          "product": "prod_professional_compliance",
          "prices": ["price_professional"]
        }
      ]
    },
    "subscription_cancel": {
      "enabled": true,
      "mode": "at_period_end",
      "cancellation_reason": {
        "enabled": true,
        "options": [
          "too_expensive",
          "missing_features",
          "switched_to_competitor",
          "low_quality",
          "other"
        ]
      }
    }
  }
}
```

**Portal URL:** `https://billing.stripe.com/session/{{SESSION_ID}}`  
**Access:** Customers can access portal from `https://app.algohouse.com/billing`

---

## Promotion Codes

### STARTUP40 (40% off first 6 months)
```json
{
  "code": "STARTUP40",
  "coupon": {
    "percent_off": 40,
    "duration": "repeating",
    "duration_in_months": 6
  },
  "restrictions": {
    "first_time_transaction": true,
    "minimum_amount": 100000
  },
  "max_redemptions": 100,
  "expires_at": 1735689600
}
```

**Eligibility:** Startups with AUM <$50M (verification required)

---

### ANNUAL15 (15% off if paid annually)
```json
{
  "code": "ANNUAL15",
  "coupon": {
    "percent_off": 15,
    "duration": "forever"
  },
  "restrictions": {
    "first_time_transaction": false
  }
}
```

**Eligibility:** Any customer switching from monthly to annual billing

---

## Testing

### Stripe Test Mode Configuration
- **Test API Key:** `sk_test_algohouse_compliance_xyz789`
- **Test Credit Cards:** Use Stripe test cards (e.g., `4242 4242 4242 4242` for successful payment)
- **Test Webhooks:** Use Stripe CLI to forward webhooks to localhost: `stripe listen --forward-to localhost:3000/webhooks/stripe`

### Test Scenarios
1. **Successful trial start:** Create subscription, verify webhook received, check API keys provisioned
2. **Trial expiry warning:** Fast-forward to 7 days before trial end (use Stripe test clock), verify email sent
3. **Trial → Paid conversion:** Add payment method, fast-forward to trial end, verify invoice charged
4. **Failed payment:** Use test card `4000 0000 0000 0341` (payment fails), verify retry logic + dunning emails
5. **Subscription cancellation:** Cancel subscription, verify access revoked + exit survey sent

---

## Metrics to Track

### Stripe Dashboard
- **MRR (Monthly Recurring Revenue):** Track growth of Compliance Edition
- **Churn Rate:** % of customers canceling each month
- **Trial Conversion Rate:** % of trials converting to paid
- **ARPU (Average Revenue Per User):** Track upsells from Starter → Professional → Enterprise

### Custom Metrics (AlgoHouse Internal)
- **Trial engagement:** % of trial users who run >100 API calls
- **Feature adoption:** % of Professional users generating SARs
- **Time to first value:** Days from trial start to first wash trade flagged

---

## Support & Troubleshooting

### Common Issues

#### Issue: Webhook not received
**Cause:** Firewall blocking Stripe IPs or incorrect webhook secret  
**Solution:** Whitelist Stripe IPs (52.89.*.*/16), verify webhook secret matches Stripe dashboard

#### Issue: Trial not auto-converting to paid
**Cause:** Customer didn't add payment method  
**Solution:** Stripe cancels subscription automatically (per `trial_settings.end_behavior = cancel`)

#### Issue: Invoice payment failed
**Cause:** Insufficient funds or expired card  
**Solution:** Stripe retries 3 times (day 3, 5, 7), then sends dunning email

---

## Stripe Dashboard Access

**Team Access:**
- **Admin:** arpit@algohouse.com (full access)
- **Finance:** finance@algohouse.com (view-only, invoices)
- **Engineering:** engineering@algohouse.com (view-only, webhooks)
- **Support:** support@algohouse.com (limited, refunds only)

---

## Implementation Checklist

- [ ] Create Stripe products (Starter, Professional)
- [ ] Create Stripe prices ($1,250/mo, $2,917/mo)
- [ ] Configure webhooks (5 event types)
- [ ] Test webhook delivery (use Stripe CLI)
- [ ] Set up Customer Portal
- [ ] Create promotion codes (STARTUP40, ANNUAL15)
- [ ] Test checkout flow (trial start → paid conversion)
- [ ] Configure automatic tax (Stripe Tax)
- [ ] Set up dunning management (failed payments)
- [ ] Train support team on billing issues

---

## Questions?

For Stripe integration questions:
- **Email:** billing-eng@algohouse.com
- **Slack:** #stripe-integration (internal)
- **Stripe Support:** https://support.stripe.com
