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
    it('renders the main brand name', () => {
        render(<App />)
        expect(screen.getAllByText(/SafeGuard AI/i)[0]).toBeInTheDocument()
    })

    it('renders the hero headline', () => {
        render(<App />)
        expect(screen.getByText(/Moderation at the/i)).toBeInTheDocument()
        expect(screen.getByText(/Speed of Light/i)).toBeInTheDocument()
    })

    it('renders the demo section', () => {
        render(<App />)
        expect(screen.getByText(/Try the Live Demo/i)).toBeInTheDocument()
    })

    it('renders the post creation placeholder', () => {
        render(<App />)
        expect(screen.getByPlaceholderText(/What's on your mind?/i)).toBeInTheDocument()
    })
})
