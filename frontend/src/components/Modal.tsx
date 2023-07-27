import React, { useEffect } from 'react'

import styles from './Modal.module.css'

interface Props {
  modalName: string
  message: string | undefined
  setMessageForModal: (message: string | undefined) => void
}

function Modal({ modalName, message, setMessageForModal }: Props) {
  const closeModal = () => {
    setMessageForModal(undefined)
  }

  const handleOutsideClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      closeModal()
    }
  }

  useEffect(() => {
    // if a message is newly passed, show the modal
    message
  }, [message])

  return (
    <>
      {message && (
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
