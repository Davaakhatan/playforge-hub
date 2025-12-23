import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../Input'

describe('Input', () => {
  it('renders input element', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('renders with label', () => {
    render(<Input label="Email" />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('renders error message', () => {
    render(<Input error="This field is required" />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('applies error styles when error is present', () => {
    render(<Input error="Error" data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveClass('border-red-500')
  })

  it('handles text input', async () => {
    const user = userEvent.setup()
    render(<Input data-testid="input" />)

    const input = screen.getByTestId('input')
    await user.type(input, 'Hello World')
    expect(input).toHaveValue('Hello World')
  })

  it('handles onChange events', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} data-testid="input" />)

    const input = screen.getByTestId('input')
    await user.type(input, 'a')
    expect(handleChange).toHaveBeenCalled()
  })

  it('can be disabled', () => {
    render(<Input disabled data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:cursor-not-allowed')
  })

  it('defaults to text type', () => {
    render(<Input data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('type', 'text')
  })

  it('accepts different input types', () => {
    render(<Input type="password" data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('applies custom className', () => {
    render(<Input className="custom-input" data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveClass('custom-input')
  })

  it('forwards ref to input element', () => {
    const ref = { current: null as HTMLInputElement | null }
    render(<Input ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('passes through additional props', () => {
    render(<Input name="email" autoComplete="email" data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('name', 'email')
    expect(input).toHaveAttribute('autocomplete', 'email')
  })

  it('displays label above input', () => {
    render(<Input label="Username" data-testid="input" />)
    const label = screen.getByText('Username')
    expect(label).toHaveClass('mb-1.5', 'text-sm', 'font-medium')
  })

  it('displays error below input', () => {
    render(<Input error="Invalid email" />)
    const error = screen.getByText('Invalid email')
    expect(error).toHaveClass('mt-1.5', 'text-sm', 'text-red-400')
  })
})
