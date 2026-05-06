import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist, WishlistCollection } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import ShareWishlistModal from './ShareWishlistModal';

interface CreateCollectionModalProps {
    onClose: () => void;
    onCreated: () => void;
}

function CreateCollectionModal({ onClose, onCreated }: CreateCollectionModalProps) {
    const { createCollection } = useWishlist();
    const { darkMode } = useTheme();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name.trim()) return;
        setLoading(true);
        try {
            await createCollection({ name: name.trim(), description: description.trim(), isPublic });
            onCreated();
            onClose();
        } catch (e) {
            console.error('Failed to create collection', e);
        } finally {
            setLoading(false);
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
                <h2 className="text-xl font-bold mb-4">Create New Collection</h2>
                <div className="space-y-4">
                    <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                            Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className={`w-full px-3 py-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-light' : 'bg-white border-gray-300 text-gray-800'} focus:outline-none focus:border-primary`}
                            placeholder="e.g. Tech Gadgets"
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className={`w-full px-3 py-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-light' : 'bg-white border-gray-300 text-gray-800'} focus:outline-none focus:border-primary`}
                            rows={3}
                            placeholder="Optional description..."
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="isPublic"
                            checked={isPublic}
                            onChange={e => setIsPublic(e.target.checked)}
                            className="rounded text-primary"
                        />
                        <label htmlFor="isPublic" className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Make this collection public
                        </label>
                    </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 rounded-md text-sm ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={!name.trim() || loading}
                        className="px-4 py-2 rounded-md text-sm bg-primary hover:bg-accent text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating...' : 'Create Collection'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function WishlistCollections() {
    const { collections, collectionsLoading, deleteCollection, getCollections } = useWishlist();
    const { darkMode } = useTheme();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [shareCollection, setShareCollection] = useState<WishlistCollection | null>(null);

    const handleDelete = async (collectionId: number, collectionName: string) => {
        if (confirm(`Delete "${collectionName}"? Items will be moved to your default wishlist.`)) {
            try {
                await deleteCollection(collectionId);
            } catch (e) {
                console.error('Failed to delete collection', e);
            }
        }
    };

    if (collectionsLoading) {
        return (
            <div className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 px-4 transition-colors duration-300`}>
                <div className="max-w-7xl mx-auto flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}>
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'}`}>
                        My Wishlists
                    </h1>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-primary hover:bg-accent text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>New Collection</span>
                    </button>
                </div>

                {collections.length === 0 ? (
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-12 text-center shadow-md`}>
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <h2 className={`text-xl font-semibold ${darkMode ? 'text-light' : 'text-gray-700'} mb-2`}>
                            No collections yet
                        </h2>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-6`}>
                            Create your first wishlist collection to start saving products.
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-primary hover:bg-accent text-white px-6 py-3 rounded-md font-medium transition-colors"
                        >
                            Create Collection
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {collections.map(collection => (
                            <div
                                key={collection.collectionId}
                                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden`}
                            >
                                <Link to={`/wishlist/collections/${collection.collectionId}`} className="block p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className={`text-xl font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} hover:text-primary transition-colors`}>
                                            {collection.name}
                                        </h3>
                                        {collection.isPublic && (
                                            <span className="text-xs bg-primary text-white px-2 py-1 rounded-full ml-2 flex-shrink-0">
                                                Public
                                            </span>
                                        )}
                                    </div>
                                    {collection.description && (
                                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mb-4 line-clamp-2`}>
                                            {collection.description}
                                        </p>
                                    )}
                                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                        Created {new Date(collection.createdAt).toLocaleDateString()}
                                    </p>
                                </Link>
                                <div className={`px-6 pb-4 flex items-center space-x-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'} pt-3`}>
                                    <button
                                        onClick={() => setShareCollection(collection)}
                                        className={`flex-1 text-sm py-1.5 rounded-md border ${
                                            collection.isPublic
                                                ? 'border-primary text-primary hover:bg-primary hover:text-white'
                                                : `${darkMode ? 'border-gray-600 text-gray-400 hover:border-gray-400' : 'border-gray-300 text-gray-500 hover:border-gray-500'}`
                                        } transition-colors`}
                                        title="Share collection"
                                    >
                                        {collection.isPublic ? '🔗 Shared' : 'Share'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(collection.collectionId, collection.name)}
                                        className={`text-sm py-1.5 px-3 rounded-md border ${darkMode ? 'border-gray-600 text-red-400 hover:bg-red-900/20' : 'border-gray-300 text-red-500 hover:bg-red-50'} transition-colors`}
                                        title="Delete collection"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showCreateModal && (
                <CreateCollectionModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={() => getCollections()}
                />
            )}

            {shareCollection && (
                <ShareWishlistModal
                    collection={shareCollection}
                    onClose={() => setShareCollection(null)}
                />
            )}
        </div>
    );
}
