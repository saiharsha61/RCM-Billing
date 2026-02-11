import React, { useState } from 'react';

/**
 * NOTES PANEL COMPONENT
 * Time-stamped activity log with user attribution
 * Based on INFINX Patient Access Plus notes functionality
 */

export function NotesPanel({ relatedToId, relatedToType = 'authorization', currentUser = { name: 'Current User' } }) {
    const [notes, setNotes] = useState([
        // Mock data for demonstration
        {
            id: '1',
            user_name: 'Sarah Johnson',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            note_text: 'Contacted payer for authorization status update. Expected response within 24 hours.'
        },
        {
            id: '2',
            user_name: 'Parvez Bamnaz',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            note_text: 'Initial authorization request submitted via portal.'
        }
    ]);

    const [newNoteText, setNewNoteText] = useState('');
    const maxCharacters = 500;

    const handleAddNote = () => {
        if (!newNoteText.trim()) return;

        const newNote = {
            id: Date.now().toString(),
            user_name: currentUser.name,
            timestamp: new Date().toISOString(),
            note_text: newNoteText.trim()
        };

        setNotes([newNote, ...notes]); // Add to beginning (newest first)
        setNewNoteText('');
    };

    const formatTimestamp = (isoString) => {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        // Relative time for recent notes
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

        // Absolute time for older notes
        return date.toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div style={{
            width: '100%',
            backgroundColor: '#f8f9fa',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
        }}>
            {/* Header */}
            <div style={{
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '2px solid #cbd5e1'
            }}>
                <h3 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#0f172a',
                    margin: '0 0 4px 0'
                }}>
                    Activity Notes
                </h3>
                <p style={{
                    fontSize: '12px',
                    color: '#64748b',
                    margin: 0
                }}>
                    {notes.length} note{notes.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Add Note Interface */}
            <div style={{
                marginBottom: '20px',
                padding: '16px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #cbd5e1'
            }}>
                <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#0f172a'
                }}>
                    Add Note
                </label>
                <textarea
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value.slice(0, maxCharacters))}
                    placeholder="Enter your note here..."
                    rows={3}
                    style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '13px',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        marginBottom: '8px'
                    }}
                />
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span style={{
                        fontSize: '11px',
                        color: newNoteText.length >= maxCharacters * 0.9 ? '#ef4444' : '#64748b'
                    }}>
                        {newNoteText.length} / {maxCharacters} characters
                    </span>
                    <button
                        onClick={handleAddNote}
                        disabled={!newNoteText.trim()}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: newNoteText.trim() ? '#a941c6' : '#cbd5e1',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: newNoteText.trim() ? 'pointer' : 'not-allowed',
                            opacity: newNoteText.trim() ? 1 : 0.6
                        }}
                    >
                        Add Note
                    </button>
                </div>
            </div>

            {/* Notes List */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                maxHeight: '400px'
            }}>
                {notes.length === 0 ? (
                    <div style={{
                        padding: '40px 20px',
                        textAlign: 'center',
                        color: '#94a3b8'
                    }}>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>No notes yet</div>
                        <div style={{ fontSize: '12px', marginTop: '4px' }}>Add your first activity note above</div>
                    </div>
                ) : (
                    notes.map((note, index) => (
                        <div
                            key={note.id}
                            style={{
                                padding: '12px',
                                marginBottom: '8px',
                                backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px'
                            }}
                        >
                            {/* Note Header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '6px'
                            }}>
                                <span style={{
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    color: '#0f172a'
                                }}>
                                    {note.user_name}
                                </span>
                                <span style={{
                                    fontSize: '11px',
                                    color: '#64748b'
                                }}>
                                    {formatTimestamp(note.timestamp)}
                                </span>
                            </div>

                            {/* Note Text */}
                            <div style={{
                                fontSize: '13px',
                                lineHeight: '1.5',
                                color: '#334155',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                            }}>
                                {note.note_text}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

/**
 * Compact Notes Panel (for sidebar usage)
 */
export function CompactNotesPanel({ relatedToId, relatedToType, currentUser }) {
    return (
        <div style={{
            width: '300px',
            height: '100%',
            position: 'sticky',
            top: '20px'
        }}>
            <NotesPanel
                relatedToId={relatedToId}
                relatedToType={relatedToType}
                currentUser={currentUser}
            />
        </div>
    );
}
