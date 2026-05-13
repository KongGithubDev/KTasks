import { useState } from 'react'
import { TextField, Button, Paper, Stack, IconButton, Typography, InputAdornment } from '@mui/material'
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
            <TextField
                inputRef={taskInputRef}
                fullWidth
                placeholder="Add a task"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={handleAddTask}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start"><Add sx={{ fontSize: 24, color: 'var(--primary)' }} /></InputAdornment>
                    ),
                }}
                sx={{ mb: 1 }}
            />
            {templates && templates.length > 0 && (
                <div style={{ position: 'relative' }}>
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<SaveIcon />}
                        onClick={() => setTemplateDropdownOpen(!templateDropdownOpen)}
                    >
                        Use Template
                    </Button>
                    {templateDropdownOpen && (
                        <Paper sx={{ position: 'absolute', top: '100%', left: 0, zIndex: 50, mt: 0.5, minWidth: 220, overflow: 'hidden' }}>
                            <Stack divider={<div style={{ borderBottom: '1px solid var(--border-color)' }} />}>
                                {templates.map((tmpl, idx) => (
                                    <Stack key={idx} direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.5, py: 1 }}>
                                        <Button
                                            fullWidth
                                            sx={{ justifyContent: 'flex-start', textTransform: 'none', color: 'text.primary' }}
                                            onClick={() => {
                                                addTask(tmpl.title, tmpl);
                                                setTemplateDropdownOpen(false);
                                            }}
                                        >
                                            <Typography variant="body2">{tmpl.name}</Typography>
                                        </Button>
                                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); deleteTemplate(idx); }}>
                                            <Delete sx={{ fontSize: 16, color: 'error.main' }} />
                                        </IconButton>
                                    </Stack>
                                ))}
                            </Stack>
                        </Paper>
                    )}
                </div>
            )}
        </div>
    )
}
