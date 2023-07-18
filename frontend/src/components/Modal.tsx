import React, { useState } from 'react'

import styles from './Modal.module.css'

interface Props {
  message: string
  modalName: string
}

function Modal({ message, modalName }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => {
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
  }

  const handleOutsideClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setIsOpen(false)
    }
  }

  return (
    <>
      <button id="myBtn" onClick={openModal}>
        Abrir Modal
      </button>
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
            <h2>Modal Title</h2>
            <p>
              Modal content goes here...
              {message}
            </p>
          </div>
        </div>
      )}
    </>
  )
}

export default Modal
