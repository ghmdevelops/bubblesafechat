import React, { useState, useEffect, useRef } from 'react';
import { Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import promoImage from './img/v3.png';
import { X } from 'react-bootstrap-icons';
import { motion } from 'framer-motion';
import './PromoModal.css';

const PromoModal = ({ onPromoSeen }) => {
    const [show, setShow] = useState(false);
    const navigate = useNavigate();
    const timerRef = useRef(null);

    useEffect(() => {
        timerRef.current = setTimeout(() => {
            setShow(true);
        }, 500);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    const handleClose = () => {
        setShow(false);
        onPromoSeen();
    };

    const handleLearnMore = () => {
        handleClose();
        navigate("/learn-more");
    };
    
    return (
        <Modal
            show={show}
            onHide={handleClose}
            centered
            backdrop="static"
            keyboard={false}
            dialogClassName="promo-modal-dialog"
        >
            <Modal.Body className="promo-modal-body p-0">
                <button
                    type="button"
                    className="close-button-overlay"
                    onClick={handleClose}
                    aria-label="Close"
                >
                    <X size={30} color="white" />
                </button>

                <div className="promo-content-container"> 
                    <img
                        src={promoImage}
                        alt="Promoção Especial"
                        className="promo-image-full"
                    />

                    <motion.button
                        className="btn primary promo-action-button"
                        onClick={handleLearnMore}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Saiba mais"
                    >
                        Saiba Mais
                    </motion.button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default PromoModal;