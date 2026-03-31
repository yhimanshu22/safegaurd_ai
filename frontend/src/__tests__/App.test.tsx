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
        expect(screen.getByText(/Modern Moderation/i)).toBeInTheDocument()
        expect(screen.getByText(/Modern Communities/i)).toBeInTheDocument()
    })

    it('renders the demo button', () => {
        render(<App />)
        expect(screen.getByText(/View Live Demo/i)).toBeInTheDocument()
    })
})
