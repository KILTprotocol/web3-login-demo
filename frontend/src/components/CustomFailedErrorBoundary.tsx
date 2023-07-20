import React, { useState, useEffect } from 'react'

// import Modal from './Modal'
import Button from './Button'

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
    console.log('The Effect is being used.')

    window.addEventListener('error', (e) => {
      console.log('Error being listen: ', e)
      errorHandler(e)
    })

    return () => {
      window.removeEventListener('error', errorHandler)
    }
  })

  return [hasError, errorMessage]
}

function CustomFailedErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, errorMessage] = useErrorBoundary()

  if (hasError) {
    return (
      <Button modalName="Error Popup" message={errorMessage} show={hasError} />
    )
  }

  return <>{children}</>
}

export default CustomFailedErrorBoundary
