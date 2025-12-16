import React, { useState, useRef, useEffect } from 'react';

const ProfileSection: React.FC = () => {
    const initialImageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuAaUiVIgkfauo9y8pS6rMAbE4pOf0ZDS_1--reFgmEJfdD0JMHzbjq_NBYfz0H2kLWuPNEtaDGF3_ChenA-gx_qnfErCLKrj_jrMBXYsyZrO4LzUJMcZKD8LTURxB8vm7xq909YZwsL7LtJrfyuwH-nN2NeqgEbu3_7Csennwl6QBa2A_FfpT9jTrOtnO5mmJ6JuLUZyk7DrfZ9XslK2JTJvd1bcOVXbL35RGkyE33STgNg9EwpfB5CvUJjF3uUCGUqqZefxug4RbgR";
    
    const [initialState, setInitialState] = useState({
        image: initialImageUrl,
        name: 'Dra. Juliana Oliveira',
        role: 'Enfermeira Chefe'
    });

    const [profileImage, setProfileImage] = useState<string>(initialState.image);
    const [fullName, setFullName] = useState(initialState.name);
    const [role, setRole] = useState(initialState.role);
    
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const hasChanges = profileImage !== initialState.image || fullName !== initialState.name || role !== initialState.role;

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    setProfileImage(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveChanges = () => {
        if (!hasChanges) return;

        setIsSaving(true);
        setSaveSuccess(false);

        // Simulate API call
        setTimeout(() => {
            // On success, update the initial state to the new saved state
            setInitialState({ image: profileImage, name: fullName, role: role });
            setIsSaving(false);
            setSaveSuccess(true);

            // Hide success message after a delay
            setTimeout(() => {
                setSaveSuccess(false);
            }, 2500);
        }, 1500);
    };


    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                 <div className="relative group shrink-0">
                    <img
                        className="aspect-square rounded-full h-16 w-16 object-cover group-hover:opacity-75 transition-opacity"
                        alt="Foto de perfil da Dra. Juliana Oliveira"
                        src={profileImage}
                    />
                    <button 
                        onClick={handleImageClick}
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900/70"
                        aria-label="Alterar foto de perfil"
                    >
                        <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                </div>
                <div className="flex-1">
                    <label className="sr-only" htmlFor="profile-name">Nome Completo</label>
                    <input 
                        className="w-full p-2 mb-1 rounded-lg border-none text-lg font-bold bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-primary focus:border-primary" 
                        id="profile-name" 
                        placeholder="Nome Completo" 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />
                    <label className="sr-only" htmlFor="profile-role">Cargo</label>
                    <input 
                        className="w-full p-2 rounded-lg border-none text-sm font-normal bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 focus:ring-primary focus:border-primary" 
                        id="profile-role" 
                        placeholder="Cargo" 
                        type="text" 
                        value={role}
                        onChange={(e) => setRole(e.target.value)} 
                    />
                </div>
            </div>
            <button 
                className="flex items-center gap-2 justify-center rounded-lg bg-primary text-white text-base font-medium py-2 px-4 mt-2 hover:opacity-90 transition-all duration-200 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                onClick={handleSaveChanges}
                disabled={!hasChanges || isSaving}
            >
                {isSaving ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Salvando...</span>
                    </>
                ) : saveSuccess ? (
                    <>
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                        <span>Salvo!</span>
                    </>
                ) : (
                    <>
                        <span className="material-symbols-outlined text-lg">save</span>
                        <span>Salvar Alterações</span>
                    </>
                )}
            </button>
        </div>
    );
};

export default ProfileSection;