import { motion, AnimatePresence } from 'framer-motion'
import { Button, IconButton, Tooltip } from '@mui/material'
import CheckCircle from '@mui/icons-material/CheckCircle'
import Star from '@mui/icons-material/Star'
import StarBorder from '@mui/icons-material/StarBorder'
import Lock from '@mui/icons-material/Lock'
import CalendarMonth from '@mui/icons-material/CalendarMonth'
import Warning from '@mui/icons-material/Warning'
import Archive from '@mui/icons-material/Archive'
import Delete from '@mui/icons-material/Delete'
import RadioButtonUnchecked from '@mui/icons-material/RadioButtonUnchecked'
import { toast } from 'react-hot-toast'

export default function TaskList({
    sortedFilteredTasks,
    tasks,
    selectedTaskId,
    onSelectTask,
    onToggleTask,
    onToggleImportant,
    onArchiveTask,
    onDeleteTask,
    getDueStatus,
    bulkSelection,
    toggleBulkSelect,
}) {
    return (
        <AnimatePresence mode="popLayout">
            {sortedFilteredTasks.length > 0 ? (
                sortedFilteredTasks.map(task => {
                    const isBlocked = task.blockedBy?.length > 0 && task.blockedBy.some(blockerId => {
                        const blocker = tasks.find(bx => (bx._id || bx.id) === blockerId);
                        return blocker && !blocker.completed;
                    });
                    return (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            whileHover={{ scale: 1.01 }}
                            key={task._id || task.id}
                            onClick={() => onSelectTask(task._id || task.id)}
                            className={`task-item ${task.completed ? 'completed' : ''} ${selectedTaskId === (task._id || task.id) ? 'selected' : ''}`}
                            style={{ opacity: isBlocked ? 0.6 : 1, borderLeft: getDueStatus(task) === 'overdue' ? '3px solid #ff4d4f' : getDueStatus(task) === 'today' ? '3px solid #ff8c00' : getDueStatus(task) === 'soon' ? '3px solid #ffd700' : undefined }}
                        >
                            <input
                                type="checkbox"
                                checked={bulkSelection.includes(task._id || task.id)}
                                onClick={(e) => e.stopPropagation()}
                                onChange={() => toggleBulkSelect(task._id || task.id)}
                                style={{ marginRight: '8px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                            />
                            <button
                                className="check-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (isBlocked) {
                                        toast.error('This task is blocked by another task!');
                                        return;
                                    }
                                    onToggleTask(task._id || task.id);
                                }}
                                style={{ cursor: isBlocked ? 'not-allowed' : 'pointer' }}
                            >
                                {isBlocked ? (
                                    <Lock sx={{ fontSize: '20px', color: '#ff4d4f' }} />
                                ) : task.completed ? (
                                    <CheckCircle sx={{ fontSize: '28px', color: 'var(--primary)' }} />
                                ) : (
                                    <RadioButtonUnchecked sx={{ fontSize: '28px', color: 'var(--border-color)' }} />
                                )}
                            </button>
                            <div className="task-body">
                                <div className="task-top">
                                    <span className="task-title">{task.title}</span>
                                    {task.priority !== 'low' && (
                                        <span className={`priority-badge ${task.priority}`}>
                                            {task.priority}
                                        </span>
                                    )}
                                    {getDueStatus(task) === 'overdue' && (
                                        <span style={{ fontSize: '0.7rem', background: '#ff4d4f', color: 'white', padding: '2px 6px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                            <Warning sx={{ fontSize: '10px' }} /> Overdue
                                        </span>
                                    )}
                                </div>
                                <div className="task-meta">
                                    {task.note && <span className="task-note">{task.note.substring(0, 60)}{task.note.length > 60 ? '...' : ''}</span>}
                                    {task.dueDate && (
                                        <span className="task-date" style={{ fontSize: '0.8rem', color: getDueStatus(task) === 'overdue' ? '#ff4d4f' : getDueStatus(task) === 'today' ? '#ff8c00' : getDueStatus(task) === 'soon' ? '#d4a017' : 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', background: getDueStatus(task) === 'overdue' ? 'rgba(255, 77, 79, 0.1)' : getDueStatus(task) === 'today' ? 'rgba(255, 140, 0, 0.1)' : getDueStatus(task) === 'soon' ? 'rgba(255, 215, 0, 0.15)' : 'var(--primary-light)', padding: '2px 6px', borderRadius: '4px' }}>
                                            <CalendarMonth sx={{ fontSize: '12px' }} />
                                            {new Date(task.dueDate).toLocaleDateString()} {task.dueTime || ''}
                                        </span>
                                    )}
                                    {task.recurrence && task.recurrence !== 'none' && (
                                        <span title={`Repeats ${task.recurrence}`} style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                                            🔁
                                        </span>
                                    )}
                                    {task.tags?.length > 0 && (
                                        <div className="task-tags" style={{ display: 'flex', gap: '4px', marginLeft: '4px' }}>
                                            {task.tags.map(t => <span key={t} style={{ fontSize: '0.7rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '10px' }}>#{t}</span>)}
                                        </div>
                                    )}
                                    {task.subtasks?.length > 0 && (
                                        <div className="subtask-progress" style={{ width: '100%', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ flex: 1, height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%`, height: '100%', background: task.subtasks.filter(s => s.completed).length === task.subtasks.length ? '#52c41a' : 'var(--primary)', transition: 'width 0.3s' }} />
                                            </div>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <Tooltip title="Important">
                                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); onToggleImportant(task._id || task.id); }}>
                                        {task.important ? <Star sx={{ fontSize: 20, color: 'primary.main' }} /> : <StarBorder sx={{ fontSize: 20, color: 'text.secondary' }} />}
                                    </IconButton>
                                </Tooltip>
                                {!task.archived && (
                                    <Tooltip title="Archive">
                                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); onArchiveTask(task._id || task.id); if (selectedTaskId === (task._id || task.id)) onSelectTask(null); }}>
                                            <Archive sx={{ fontSize: 18, color: 'text.secondary' }} />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                <Tooltip title="Delete">
                                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDeleteTask(task._id || task.id); if (selectedTaskId === (task._id || task.id)) onSelectTask(null); }}>
                                        <Delete sx={{ fontSize: 20 }} />
                                    </IconButton>
                                </Tooltip>
                            </div>
                        </motion.div>
                    )
                })
            ) : (
                <div className="empty-state">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 0.5, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="empty-icon"
                    >
                        <CheckCircle sx={{ fontSize: '120px', color: 'var(--primary)', opacity: 0.3 }} />
                    </motion.div>
                    <h3>Your plate is clear</h3>
                    <p>Enjoy the peace, or start something new.</p>
                </div>
            )}
        </AnimatePresence>
    )
}
