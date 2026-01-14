import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

function MiModal({ onClose, children, disableScroll = false, title, contentClass, closeModal }) {
    const [transition, setTransition] = useState(false);

    // Close modal with transition
    const handleModalClose = (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            closeWithTransition();
        }
    };

    const closeWithTransition = () => {
        setTransition(false);
        setTimeout(() => {
            onClose(); 
        }, 500);
    };

    useEffect(() => {
        if (closeModal) {
            closeWithTransition()
        }
    }, [closeModal])



    // Handle opening transition on mount
    useEffect(() => {
        const openTimeout = setTimeout(() => {
            setTransition(true);
        }, 100);

        // Clean up timeout on unmount
        return () => clearTimeout(openTimeout);
    }, []);

    // Handle Escape key to close modal
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') closeWithTransition();
        };
        document.addEventListener('keydown', handleEscape);

        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    return createPortal(
        <div
            className={`modal-overlay fixed inset-0 bg-black flex items-center justify-center z-50 h-screen font-inter text-hitam-mi transition-all duration-500 ${transition ? 'bg-opacity-40' : 'bg-opacity-0'}`}
            onClick={handleModalClose}
        >
            <div
                className={`content w-full bg-gray-100 shadow-xl shadow-black/5 rounded-lg flex flex-col ${contentClass} max-w-[60%] max-lg:max-w-[90%] max-h-[90%] overflow-hidden transition-opacity duration-300 ${transition ? 'opacity-100' : 'opacity-0'} ${disableScroll ? 'overflow-y-hidden' : ''}`}
            >
                {children}
            </div>
        </div>,
        document.body
    );
}

export default MiModal;
