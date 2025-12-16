
import React from 'react';
import { CurrentPage } from '../../App';
import MainSidebar from './MainSidebar';

interface DesktopLayoutProps {
    children: React.ReactNode;
    currentPage: CurrentPage;
    onNavigate: (page: CurrentPage) => void;
}

const DesktopLayout: React.FC<DesktopLayoutProps> = ({ children, currentPage, onNavigate }) => {
    return (
        <div className="hidden sm:flex w-full min-h-screen">
            <MainSidebar currentPage={currentPage} onNavigate={onNavigate} />
            <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark">
                <div className="flex-1 overflow-y-auto">
                   <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                   </div>
                </div>
            </div>
        </div>
    );
};

export default DesktopLayout;
