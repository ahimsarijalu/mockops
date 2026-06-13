import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangleIcon } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class GlobalErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled application error', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
          <AlertTriangleIcon className="size-12 text-destructive" />
          <div>
            <h1 className="text-lg font-semibold">Something went wrong</h1>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {this.state.error.message}
            </p>
          </div>
          <Button onClick={() => this.setState({ error: null })}>Try again</Button>
        </div>
      )
    }

    return this.props.children
  }
}
