import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KeyValueMatcherEditor, type KeyValueMatcherMap } from './key-value-matcher-editor'

describe('KeyValueMatcherEditor', () => {
  it('renders one row per entry', () => {
    const value: KeyValueMatcherMap = {
      'X-Trace-Id': { equalTo: '123' },
      Authorization: { equalTo: 'Bearer x' },
    }
    render(<KeyValueMatcherEditor value={value} onChange={() => {}} />)
    expect(screen.getByDisplayValue('X-Trace-Id')).toBeInTheDocument()
    expect(screen.getByDisplayValue('123')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Authorization')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Bearer x')).toBeInTheDocument()
  })

  it('adds an empty equalTo entry when "Add" is clicked', async () => {
    const onChange = vi.fn()
    render(<KeyValueMatcherEditor value={{}} onChange={onChange} addLabel="Add header matcher" />)
    await userEvent.click(screen.getByRole('button', { name: /add header matcher/i }))
    expect(onChange).toHaveBeenCalledWith({ '': { equalTo: '' } })
  })

  it('updates the key while preserving the pattern', async () => {
    const onChange = vi.fn()
    const value: KeyValueMatcherMap = { '': { equalTo: 'abc' } }
    render(<KeyValueMatcherEditor value={value} onChange={onChange} keyPlaceholder="Header name" />)
    fireEvent.change(screen.getByPlaceholderText('Header name'), { target: { value: 'X-Custom' } })
    const lastCall = onChange.mock.calls.at(-1)?.[0]
    expect(lastCall).toEqual({ 'X-Custom': { equalTo: 'abc' } })
  })

  it('updates the matcher value for the current type', async () => {
    const onChange = vi.fn()
    const value: KeyValueMatcherMap = { 'X-Custom': { equalTo: '' } }
    render(<KeyValueMatcherEditor value={value} onChange={onChange} />)
    fireEvent.change(screen.getByPlaceholderText('Value'), { target: { value: 'hello' } })
    const lastCall = onChange.mock.calls.at(-1)?.[0]
    expect(lastCall).toEqual({ 'X-Custom': { equalTo: 'hello' } })
  })

  it('removes an entry when its remove button is clicked', async () => {
    const onChange = vi.fn()
    const value: KeyValueMatcherMap = {
      keep: { equalTo: '1' },
      drop: { equalTo: '2' },
    }
    render(<KeyValueMatcherEditor value={value} onChange={onChange} />)
    const removeButtons = screen.getAllByRole('button', { name: /remove/i })
    await userEvent.click(removeButtons[1])
    expect(onChange).toHaveBeenCalledWith({ keep: { equalTo: '1' } })
  })
})
