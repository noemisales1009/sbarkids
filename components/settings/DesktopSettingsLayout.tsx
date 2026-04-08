
import React from 'react';
import { CurrentPage } from '../../types';
import Sidebar from './Sidebar';

interface DesktopSettingsLayoutProps {
    children: React.ReactNode;
    onNavigate: (page: CurrentPage) => void;
}

const DesktopSettingsLayout: React.FC<DesktopSettingsLayoutProps> = ({ children, onNavigate }) => {
    return (
        <div className="flex w-full min-h-screen">
            <Sidebar onNavigate={onNavigate} />
            <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto">
                   <div className="max-w-3xl mx-auto w-full">
                    {children}
                   </div>
                </div>
            </div>
        </div>
    );
};

export default DesktopSettingsLayout;
