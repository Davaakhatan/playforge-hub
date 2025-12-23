import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge, SizeBadge, TypeBadge, StatusBadge, TagBadge } from '../Badge'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Test Badge</Badge>)
    expect(screen.getByText('Test Badge')).toBeInTheDocument()
  })

  describe('variants', () => {
    it('applies default variant styles', () => {
      render(<Badge variant="default">Default</Badge>)
      const badge = screen.getByText('Default')
      expect(badge).toHaveClass('bg-zinc-800', 'text-zinc-300')
    })

    it('applies size variant styles', () => {
      render(<Badge variant="size">Size</Badge>)
      const badge = screen.getByText('Size')
      expect(badge).toHaveClass('bg-blue-500/20', 'text-blue-400')
    })

    it('applies type variant styles', () => {
      render(<Badge variant="type">Type</Badge>)
      const badge = screen.getByText('Type')
      expect(badge).toHaveClass('bg-cyan-500/20', 'text-cyan-400')
    })

    it('applies status variant styles', () => {
      render(<Badge variant="status">Status</Badge>)
      const badge = screen.getByText('Status')
      expect(badge).toHaveClass('bg-green-500/20', 'text-green-400')
    })
  })

  it('applies custom className', () => {
    render(<Badge className="custom-badge">Custom</Badge>)
    const badge = screen.getByText('Custom')
    expect(badge).toHaveClass('custom-badge')
  })
})

describe('SizeBadge', () => {
  it('renders mini size', () => {
    render(<SizeBadge size="mini" />)
    expect(screen.getByText('Mini')).toBeInTheDocument()
  })

  it('renders medium size', () => {
    render(<SizeBadge size="medium" />)
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  it('renders big size', () => {
    render(<SizeBadge size="big" />)
    expect(screen.getByText('Big')).toBeInTheDocument()
  })
})

describe('TypeBadge', () => {
  it('renders web-embed type', () => {
    render(<TypeBadge type="web-embed" />)
    expect(screen.getByText('Web')).toBeInTheDocument()
  })

  it('renders external type', () => {
    render(<TypeBadge type="external" />)
    expect(screen.getByText('External')).toBeInTheDocument()
  })

  it('renders download type', () => {
    render(<TypeBadge type="download" />)
    expect(screen.getByText('Download')).toBeInTheDocument()
  })
})

describe('StatusBadge', () => {
  it('renders prototype status with yellow color', () => {
    render(<StatusBadge status="prototype" />)
    const badge = screen.getByText('Prototype')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-yellow-500/20', 'text-yellow-400')
  })

  it('renders early-access status with orange color', () => {
    render(<StatusBadge status="early-access" />)
    const badge = screen.getByText('Early Access')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-orange-500/20', 'text-orange-400')
  })

  it('renders released status with green color', () => {
    render(<StatusBadge status="released" />)
    const badge = screen.getByText('Released')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-green-500/20', 'text-green-400')
  })
})

describe('TagBadge', () => {
  it('renders tag text', () => {
    render(<TagBadge tag="Puzzle" />)
    expect(screen.getByText('Puzzle')).toBeInTheDocument()
  })

  it('applies default badge styling', () => {
    render(<TagBadge tag="Action" />)
    const badge = screen.getByText('Action')
    expect(badge).toHaveClass('bg-zinc-800', 'text-zinc-300')
  })
})
