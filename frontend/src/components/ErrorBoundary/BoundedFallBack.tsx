import { ErrorBoundary } from 'react-error-boundary'

import Modal from '../Modal'

interface FallBacksProps {
  error: Error
  resetErrorBoundary: ErrorBoundary['resetErrorBoundary']
}

function BoundedFallBack({ error }: FallBacksProps) {
  // Call resetErrorBoundary() to reset the error boundary and retry the render.

  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>{error.message}</pre>
      <Modal modalName="Error Modal" message={error.message} />
    </div>
  )
}

export default BoundedFallBack

export const logError = (error: Error, info: { componentStack: string }) => {
  // Do something with the error, e.g. log to an external API

  console.log(
    'error that the boundary cached: ',
    error,
    'componentStack:',
    info.componentStack
  )
}
