import { useState } from 'react'
import Add from '@mui/icons-material/Add'
import Delete from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'

export default function CreateTaskInput({
    activeListId,
    taskInputRef,
    newTaskTitle,
    setNewTaskTitle,
    handleAddTask,
    templates,
    addTask,
    deleteTemplate,
}) {
    const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false)

    if (['important', 'planned', 'today'].includes(activeListId)) return null

    return (
        <div className="create-task-wrapper">
            <div className="add-task-box">
                <Add sx={{ fontSize: '24px', color: 'var(--primary)' }} />
                <input
                    ref={taskInputRef}
                    type="text"
                    placeholder="Add a task"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={handleAddTask}
                />
            </div>
            {templates && templates.length > 0 && (
                <div style={{ position: 'relative', marginTop: '8px' }}>
                    <button
                        className="theme-toggle-btn glass"
                        onClick={() => setTemplateDropdownOpen(!templateDropdownOpen)}
                        style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                    >
                        <SaveIcon sx={{ fontSize: '14px' }} /> Use Template
                    </button>
                    {templateDropdownOpen && (
                        <div className="glass" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 50, marginTop: '4px', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden', minWidth: '200px' }}>
                            {templates.map((tmpl, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        addTask(tmpl.title, tmpl);
                                        setTemplateDropdownOpen(false);
                                    }}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '10px 14px',
                                        background: 'none',
                                        border: 'none',
                                        borderBottom: '1px solid var(--border-color)',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <span>{tmpl.name}</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteTemplate(idx); }}
                                        style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', padding: '2px' }}
                                    >
                                        <Delete sx={{ fontSize: '12px' }} />
                                    </button>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
