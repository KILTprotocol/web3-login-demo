import React, { useEffect, useState } from 'react'

import styles from './Modal.module.css'

import Button from './Button'

interface Props {
  modalName: string
  message: string | undefined
  onClose: (message: string | undefined) => void
}

function Modal({ modalName, message, onClose }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => {
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    onClose(undefined)
  }

  const handleOutsideClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      closeModal()
    }
  }

  useEffect(() => {
    // if a message is newly passed, show the modal
    message && setIsOpen(true)
  }, [message])

  return (
    <>
      {message && (
        <Button id="showModal" onClick={openModal}>
          🚨 Show Modal 🚨
        </Button>
      )}
      {isOpen && (
        <div
          id={modalName}
          className={styles.modal}
          onClick={handleOutsideClick}
        >
          <div className={styles.modalContent}>
            <span className={styles.close} onClick={closeModal}>
              &times;
            </span>
            <h2 style={{ color: 'rgb(188, 50, 73)' }}>{modalName}</h2>
            <p>{message}</p>
          </div>
        </div>
      )}
    </>
  )
}

export default Modal
