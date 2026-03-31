import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthModal from '../components/AuthModal';
import axios from 'axios';

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  }
}));

const mockedAxios = axios as any;

describe('AuthModal Component', () => {
  const mockOnSuccess = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form by default', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    expect(screen.getByText(/Welcome Back/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Username/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Password/i)).toBeDefined();
    expect(screen.queryByPlaceholderText(/Email/i)).toBeNull();
  });

  it('switches to signup form', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByText(/Create an account/i));
    expect(screen.getByText(/Join SafeGuard/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Email/i)).toBeDefined();
  });

  it('handles successful login', async () => {
    mockedAxios.post.mockResolvedValueOnce({ 
      data: { 
        access_token: 'fake-token',
        role: 'user'
      } 
    });
    
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Log In/i }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(expect.stringContaining('/login'), {
        username: 'testuser',
        password: 'password123',
      });
      expect(mockOnSuccess).toHaveBeenCalledWith('fake-token', 'testuser', 'user');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('shows error message on failure', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { detail: 'Invalid credentials' } }
    });

    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'baduser' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /Log In/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeDefined();
    });
  });
});
