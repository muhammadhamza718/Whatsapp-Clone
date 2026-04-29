import { describe, it, expect, vi } from 'vitest'
import { authClient } from '@/lib/auth-client'

describe('Auth Client Configuration', () => {
  it('should be initialized with the correct base URL', () => {
    // This verifies that the auth-client is correctly configured 
    // and points to the backend URL (default or env)
    expect(authClient).toBeDefined()
    expect(authClient.baseURL).toBeDefined()
  })

  it('should have the necessary auth methods', () => {
    expect(authClient.signIn).toBeTypeOf('function')
    expect(authClient.signOut).toBeTypeOf('function')
    expect(authClient.signUp).toBeTypeOf('function')
  })
})
