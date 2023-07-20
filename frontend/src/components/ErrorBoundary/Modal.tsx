import React, { useState } from 'react'

import styles from './Modal.module.css'

import Button from '../Button'

interface Props {
  message: string
  modalName: string
  show: boolean
}

function Modal({ message, modalName, show }: Props) {
  const [isOpen, setIsOpen] = useState(show)

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
      <Button
        id="showModal"
        onClick={openModal}
        style={{ textTransform: 'none' }}
      >
        🚨 Please, 🚨
        <br />
        show message again!
      </Button>
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
            isOpen = {isOpen}
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
