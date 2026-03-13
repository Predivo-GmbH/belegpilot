import { describe, it, expect } from 'vitest'
import { SUBSCRIPTION_TIERS, DOCUMENT_STATUSES, SWISS_VAT_RATES, ERP_TARGETS } from './constants'

describe('constants', () => {
  it('has all three subscription tiers', () => {
    expect(Object.keys(SUBSCRIPTION_TIERS)).toEqual(['starter', 'professional', 'enterprise'])
  })

  it('starter tier costs CHF 49', () => {
    expect(SUBSCRIPTION_TIERS.starter.price).toBe(49)
    expect(SUBSCRIPTION_TIERS.starter.currency).toBe('CHF')
  })

  it('professional tier costs CHF 99', () => {
    expect(SUBSCRIPTION_TIERS.professional.price).toBe(99)
  })

  it('has all document statuses', () => {
    expect(Object.keys(DOCUMENT_STATUSES)).toContain('verified')
    expect(Object.keys(DOCUMENT_STATUSES)).toContain('processing')
  })

  it('has correct Swiss VAT rates', () => {
    expect(SWISS_VAT_RATES.standard.rate).toBe(8.1)
    expect(SWISS_VAT_RATES.reduced.rate).toBe(2.6)
    expect(SWISS_VAT_RATES.accommodation.rate).toBe(3.8)
  })

  it('supports all 5 ERP targets', () => {
    expect(Object.keys(ERP_TARGETS)).toEqual(['csv', 'bexio', 'abacus', 'sage', 'banana'])
  })
})
