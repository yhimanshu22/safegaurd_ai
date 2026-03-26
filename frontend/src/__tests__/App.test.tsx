import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from '../App'

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    patch: vi.fn(() => Promise.resolve({ data: {} })),
  }
}))

describe('SafeGuard AI Application', () => {
    it('renders the main heading', () => {
        render(<App />)
        expect(screen.getByText(/SafeGuard AI/i)).toBeInTheDocument()
    })

    it('renders the activity feed heading', () => {
        render(<App />)
        expect(screen.getByText(/Activity Feed/i)).toBeInTheDocument()
    })

    it('renders the post creation area', () => {
        render(<App />)
        expect(screen.getByPlaceholderText(/What's on your mind?/i)).toBeInTheDocument()
    })
})
