import { useState, useEffect } from 'react';

export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth <= 768); // Adjust the threshold as needed
        };

        // Initial check
        checkIsMobile();

        // Listen for window resize
        window.addEventListener('resize', checkIsMobile);

        // Clean up the listener
        return () => {
            window.removeEventListener('resize', checkIsMobile);
        };
    }, []);

    return isMobile;
}