import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, children }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
        } else {
            document.body.style.overflow = 'auto'; // Enable scrolling when modal is closed
        }

        return () => {
            document.body.style.overflow = 'auto'; // Ensure scrolling is enabled when component unmounts
        };
    }, [isOpen]);

    const closeModal = () => {
        onClose(false);
    };

    return (
        <div className={`fixed z-50	 top-0 left-0 w-full h-full bg-black bg-opacity-50 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="flex flex-col absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#1D2939] p-8 rounded shadow-md w-[700px] border-8 border-gray-700 bg-gray-800 shadow-xl">
                <button className="absolute top-2 right-2 text-gray-500" onClick={closeModal}>
                    &#215;
                </button>
                <span className='flex text-white text-2xl'>DERUG REQUEST</span>
                {children}
            </div>
        </div>
    );
};

export default Modal;
