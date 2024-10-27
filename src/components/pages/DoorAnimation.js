import React, { useState, useEffect } from 'react';
import './DoorAnimation.css';

const DoorAnimation = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const doorSound = new Audio('./components/audio/open-door-1-14550.mp3');

    const openDoor = () => {
        doorSound.play();
        setLoading(true);
        setTimeout(() => {
            setIsOpen(true);
            document.body.classList.add('open-light');
            document.body.style.transform = 'scale(1.5)';
        }, 1000);
    };

    useEffect(() => {
        const handleTransitionEnd = (event) => {
            if (event.target.classList.contains('door') && isOpen) {
                document.querySelector('.dark-overlay').style.display = 'none';
                document.querySelector('.lamp').style.display = 'none';
                document.querySelector('.light-beam').style.display = 'none';
                document.querySelector('.door-frame').style.display = 'none';
                document.querySelector('.door').style.display = 'none';
                document.querySelector('.corridor').style.display = 'none';
            }
        };

        // Add event listener for the transition end
        const door = document.querySelector('.door');
        if (door) {
            door.addEventListener('transitionend', handleTransitionEnd);
        }

        return () => {
            if (door) {
                door.removeEventListener('transitionend', handleTransitionEnd);
            }
        };
    }, [isOpen]);

    return (
        <div className="door-animation">
            <div className="dark-overlay"></div>
            <div className="lamp"></div>
            <div className="light-beam"></div>
            <div className="door-frame"></div>
            <div className={`door ${isOpen ? 'open' : ''}`} onClick={openDoor}>
                <div className="handle"></div>
            </div>
            <div className="corridor"></div>
        </div>
    );
};

export default DoorAnimation;
