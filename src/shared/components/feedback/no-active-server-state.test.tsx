import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NoActiveServerState } from './no-active-server-state'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, ...props }: { to: string; children: React.ReactNode }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}))

describe('NoActiveServerState', () => {
  it('renders the provided description', () => {
    render(<NoActiveServerState description="Add and select a WireMock server to continue." />)
    expect(screen.getByText('Add and select a WireMock server to continue.')).toBeInTheDocument()
  })

  it('links to the servers page', () => {
    render(<NoActiveServerState description="..." />)
    expect(screen.getByRole('link', { name: /go to servers/i })).toHaveAttribute('href', '/servers')
  })
})
