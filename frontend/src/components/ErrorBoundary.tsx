import React, { useState, useEffect } from 'react'

import Modal from './Modal'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

const useErrorBoundary = (): [boolean, string] => {
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      setHasError(true)
      setErrorMessage(event.message)
      console.log('error message inside the boundary:', event.message)
    }

    window.addEventListener('error', errorHandler)

    return () => {
      window.removeEventListener('error', errorHandler)
    }
  })

  return [hasError, errorMessage]
}

function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, errorMessage] = useErrorBoundary()

  if (hasError) {
    return (
      <Modal
        modalName="Error Popup"
        message={errorMessage}
        show={errorMessage ? true : false}
      />
    )
  }

  return <>{children}</>
}

export default ErrorBoundary
