import React, { useEffect, useState } from 'react'

import styles from './Modal.module.css'

interface Props {
  modalName: string
  message: string | undefined
}

function Modal({ modalName, message }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const closeModal = () => {
    setIsOpen(false)
  }

  const handleOutsideClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    // if a message is newly passed, show the modal
    message && setIsOpen(true)
  }, [message])

  return (
    <>
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
