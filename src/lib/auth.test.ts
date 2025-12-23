import { describe, it, expect, vi, beforeEach } from 'vitest'
import bcrypt from 'bcryptjs'

// Mock prisma
vi.mock('./prisma', () => ({
  prisma: {
    session: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}))

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}))

// Import after mocks
import { hashPassword, verifyPassword } from './auth'

describe('Auth Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123'
      const hash = await hashPassword(password)

      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(0)
    })

    it('should produce different hashes for same password', async () => {
      const password = 'testPassword123'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      expect(hash1).not.toBe(hash2)
    })

    it('should produce a valid bcrypt hash', async () => {
      const password = 'testPassword123'
      const hash = await hashPassword(password)

      // Bcrypt hashes start with $2a$, $2b$, or $2y$
      expect(hash).toMatch(/^\$2[aby]\$/)
    })
  })

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      const password = 'testPassword123'
      const hash = await bcrypt.hash(password, 12)

      const result = await verifyPassword(password, hash)
      expect(result).toBe(true)
    })

    it('should return false for incorrect password', async () => {
      const password = 'testPassword123'
      const wrongPassword = 'wrongPassword456'
      const hash = await bcrypt.hash(password, 12)

      const result = await verifyPassword(wrongPassword, hash)
      expect(result).toBe(false)
    })

    it('should work with hashPassword output', async () => {
      const password = 'mySecurePassword'
      const hash = await hashPassword(password)

      const result = await verifyPassword(password, hash)
      expect(result).toBe(true)
    })

    it('should handle empty password', async () => {
      const password = ''
      const hash = await hashPassword(password)

      const result = await verifyPassword(password, hash)
      expect(result).toBe(true)
    })

    it('should handle special characters in password', async () => {
      const password = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      const hash = await hashPassword(password)

      const result = await verifyPassword(password, hash)
      expect(result).toBe(true)
    })

    it('should handle unicode characters in password', async () => {
      const password = '密码テスト🔐'
      const hash = await hashPassword(password)

      const result = await verifyPassword(password, hash)
      expect(result).toBe(true)
    })
  })
})
