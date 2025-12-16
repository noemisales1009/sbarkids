
import React from 'react';

interface SbarFooterProps {
    onBack: () => void;
}

const SbarFooter: React.FC<SbarFooterProps> = ({ onBack }) => {
    return (
        <footer className="sticky bottom-0 z-10 mt-auto bg-background-light dark:bg-background-dark p-4 border-t border-gray-200 dark:border-gray-800">
        </footer>
    );
};

export default SbarFooter;
