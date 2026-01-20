
import React from 'react';

interface SbarFooterProps {
    onBack: () => void;
}

const SbarFooter: React.FC<SbarFooterProps> = ({ onBack }) => {
    return (
        <footer className="sticky bottom-0 z-10 mt-auto bg-background-light dark:bg-background-dark p-4 hidden sm:block">
        </footer>
    );
};

export default SbarFooter;
