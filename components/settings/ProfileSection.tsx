import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../contexts/UserContext';

const ProfileSection: React.FC = () => {
    const { user, loading, error: contextError, refetchUser } = useUser();
    
    const [profileImage, setProfileImage] = useState<string>('');
    const [fullName, setFullName] = useState<string>('');
    const [role, setRole] = useState<string>('');

    // Atualizar estados quando o user mudar
    React.useEffect(() => {
        if (user) {
            setProfileImage(user.foto || '');
            setFullName(user.name || '');
            setRole(user.role || '');
        }
    }, [user]);
    
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState('');
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const hasChanges = user && (
        profileImage !== (user.foto || '') || 
        fullName !== user.name || 
        role !== user.role
    );

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validação de tipo
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError('Formato não suportado. Use JPG, PNG ou WebP.');
            return;
        }

        // Validação de tamanho (máx 2MB)
        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            setError('Imagem muito grande. Tamanho máximo: 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                setProfileImage(reader.result);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSaveChanges = async () => {
        if (!hasChanges || !user) return;

        setIsSaving(true);
        setError('');
        setSaveSuccess(false);

        try {
            // Atualizar dados na tabela users
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    name: fullName,
                    role: role,
                    foto: profileImage,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (updateError) {
                setError('Erro ao salvar alterações: ' + updateError.message);
                setIsSaving(false);
                return;
            }

            // Recarregar dados do usuário
            await refetchUser();

            setIsSaving(false);
            setSaveSuccess(true);

            // Esconder mensagem de sucesso após 2.5 segundos
            setTimeout(() => {
                setSaveSuccess(false);
            }, 2500);
        } catch (err: any) {
            setError('Erro ao salvar alterações');
            setIsSaving(false);
        }
    };


    return (
        <div className="flex flex-col gap-4">
            {loading && (
                <div className="text-center py-4">
                    <p className="text-slate-600 dark:text-slate-400">Carregando dados do usuário...</p>
                </div>
            )}

            {(error || contextError) && !loading && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-red-700 dark:text-red-300 text-sm">{error || contextError}</p>
                </div>
            )}

            {!loading && user && (
                <>
                    <div className="flex items-center gap-4">
                        <div className="relative group shrink-0">
                            <img
                                className="aspect-square rounded-full h-16 w-16 object-cover group-hover:opacity-75 transition-opacity bg-slate-200 dark:bg-slate-700"
                                alt={`Foto de perfil de ${fullName}`}
                                src={profileImage || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0IiBmaWxsPSJub25lIiBzdHJva2U9IiNjY2MiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMCIgZmlsbD0iI2Y1ZjVmNSIgLz48cGF0aCBkPSJNMzIgMTZhMTIgMTIgMCAxIDAgMCAyNCAxMiAxMiAwIDAgMCAwLTI0eiIgZmlsbD0iI2QwZDBkMCIgc3Ryb2tlPSJub25lIiAvPjxwYXRoIGQ9Ik0xMiA1MmEyMCAyMCAwIDAgMSA0MCAwIiBzdHJva2U9IiM5OTkiIGZpbGw9Im5vbmUiIC8+PC9zdmc+'}
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
                                accept="image/jpeg,image/png,image/webp"
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

                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <span className="material-symbols-outlined text-base">email</span>
                        <span>{user.email}</span>
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
                </>
            )}
        </div>
    );
};

export default ProfileSection;