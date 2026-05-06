import { useState } from 'react';
import { useWishlist, WishlistCollection } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';

interface ShareWishlistModalProps {
    collection: WishlistCollection;
    onClose: () => void;
}

export default function ShareWishlistModal({ collection, onClose }: ShareWishlistModalProps) {
    const { generateShareLink, revokeSharing } = useWishlist();
    const { darkMode } = useTheme();
    const [token, setToken] = useState<string | undefined>(collection.sharedToken);
    const [isPublic, setIsPublic] = useState(collection.isPublic);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const shareUrl = token
        ? `${window.location.origin}/wishlist/shared/${token}`
        : null;

    const handleGenerateLink = async () => {
        setLoading(true);
        try {
            const newToken = await generateShareLink(collection.collectionId);
            setToken(newToken);
            setIsPublic(true);
        } catch (e) {
            console.error('Failed to generate share link', e);
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeSharing = async () => {
        if (!confirm('Revoke sharing? Anyone with the link will no longer be able to access it.')) return;
        setLoading(true);
        try {
            await revokeSharing(collection.collectionId);
            setToken(undefined);
            setIsPublic(false);
        } catch (e) {
            console.error('Failed to revoke sharing', e);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (shareUrl) {
            navigator.clipboard.writeText(shareUrl).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <div
                className={`${darkMode ? 'bg-gray-800 text-light' : 'bg-white text-gray-800'} rounded-lg p-6 max-w-md w-full shadow-xl`}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Share "{collection.name}"</h2>
                    <button
                        onClick={onClose}
                        className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {isPublic && shareUrl ? (
                    <div className="space-y-4">
                        <div className={`flex items-center space-x-2 p-3 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                            <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <span className={`text-sm flex-1 truncate ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {shareUrl}
                            </span>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={handleCopy}
                                className="flex-1 py-2 rounded-md bg-primary hover:bg-accent text-white text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                            >
                                {copied ? (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                        </svg>
                                        <span>Copy Link</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleRevokeSharing}
                                disabled={loading}
                                className={`py-2 px-4 rounded-md text-sm border ${darkMode ? 'border-gray-600 text-red-400 hover:bg-red-900/20' : 'border-gray-300 text-red-500 hover:bg-red-50'} transition-colors disabled:opacity-50`}
                            >
                                Revoke
                            </button>
                        </div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Anyone with this link can view your "{collection.name}" wishlist.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Generate a shareable link so others can view your "{collection.name}" wishlist.
                        </p>
                        <button
                            onClick={handleGenerateLink}
                            disabled={loading}
                            className="w-full py-2 rounded-md bg-primary hover:bg-accent text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                    <span>Generate Share Link</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
