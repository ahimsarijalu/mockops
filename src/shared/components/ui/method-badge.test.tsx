import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MethodBadge } from './method-badge'

describe('MethodBadge', () => {
  it('renders the method text', () => {
    render(<MethodBadge method="GET" />)
    expect(screen.getByText('GET')).toBeInTheDocument()
  })

  it('applies a distinct color class per known method', () => {
    render(<MethodBadge method="POST" />)
    expect(screen.getByText('POST').className).toContain('green')
  })

  it('falls back to a muted style for unknown methods', () => {
    render(<MethodBadge method="ANY" />)
    expect(screen.getByText('ANY').className).toContain('bg-muted')
  })
})
