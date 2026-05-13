import { motion, AnimatePresence } from 'framer-motion'
import { IconButton, Tooltip } from '@mui/material'
import Lock from '@mui/icons-material/Lock'
import Delete from '@mui/icons-material/Delete'
import CalendarMonth from '@mui/icons-material/CalendarMonth'

export default function KanbanBoard({
    sortedFilteredTasks,
    tasks,
    selectedTaskId,
    onSelectTask,
    onDeleteTask,
    getDueStatus,
    handleDragStart,
    handleDrop,
    handleDragOver,
}) {
    return (
        <div className="task-items-list" style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
            {['todo', 'in_progress', 'done'].map(status => (
                <div
                    key={status}
                    className="kanban-column glass"
                    style={{ flex: '0 0 350px', display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', borderRadius: '16px', background: 'var(--glass-bg)', border: '1px solid var(--border-color)', minHeight: '400px' }}
                    onDrop={(e) => handleDrop(e, status)}
                    onDragOver={handleDragOver}
                >
                    <h3 style={{ textTransform: 'capitalize', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-primary)' }}>
                        {status.replace('_', ' ')}
                        <span style={{ fontSize: '0.8rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '12px' }}>
                            {sortedFilteredTasks.filter(t => (t.status || 'todo') === status).length}
                        </span>
                    </h3>
                    <div className="kanban-tasks" style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '100%' }}>
                        <AnimatePresence>
                            {sortedFilteredTasks.filter(t => (t.status || 'todo') === status).map(task => {
                                const isBlocked = task.blockedBy?.length > 0 && task.blockedBy.some(blockerId => {
                                    const blocker = tasks.find(bx => (bx._id || bx.id) === blockerId);
                                    return blocker && !blocker.completed;
                                });
                                return (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        key={task._id || task.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task._id || task.id)}
                                        onClick={() => onSelectTask(task._id || task.id)}
                                        className={`task-item kanban-card ${selectedTaskId === (task._id || task.id) ? 'selected' : ''}`}
                                        style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-color)', border: getDueStatus(task) === 'overdue' ? '1px solid #ff4d4f' : getDueStatus(task) === 'today' ? '1px solid #ff8c00' : getDueStatus(task) === 'soon' ? '1px solid #ffd700' : '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', cursor: 'grab', display: 'block', opacity: isBlocked ? 0.6 : 1 }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                            <span className="task-title" style={{ fontWeight: '600', fontSize: '1rem', textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? 'var(--text-secondary)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                {isBlocked && <Lock sx={{ fontSize: '14px', color: '#ff4d4f' }} />}
                                                {task.title}
                                            </span>
                                            <Tooltip title="Delete">
                                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDeleteTask(task._id || task.id); if (selectedTaskId === (task._id || task.id)) onSelectTask(null); }}>
                                                    <Delete sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            </Tooltip>
                                        </div>

                                        <div className="task-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                                            {task.priority !== 'low' && (
                                                <span className={`priority-badge ${task.priority}`} style={{ fontSize: '0.7rem', padding: '2px 6px' }}>{task.priority}</span>
                                            )}
                                            {task.dueDate && (
                                                <span className="task-date" style={{ fontSize: '0.75rem', color: getDueStatus(task) === 'overdue' ? '#ff4d4f' : getDueStatus(task) === 'today' ? '#ff8c00' : getDueStatus(task) === 'soon' ? '#d4a017' : 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', background: getDueStatus(task) === 'overdue' ? 'rgba(255, 77, 79, 0.1)' : getDueStatus(task) === 'today' ? 'rgba(255, 140, 0, 0.1)' : getDueStatus(task) === 'soon' ? 'rgba(255, 215, 0, 0.15)' : 'var(--primary-light)', padding: '2px 6px', borderRadius: '4px' }}>
                                                    <CalendarMonth sx={{ fontSize: '10px' }} />
                                                    {new Date(task.dueDate).toLocaleDateString()}
                                                </span>
                                            )}
                                            {task.subtasks?.length > 0 && (
                                                <div className="subtask-progress" style={{ width: '100%', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ flex: 1, height: '4px', background: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%`, height: '100%', background: task.subtasks.filter(s => s.completed).length === task.subtasks.length ? '#52c41a' : 'var(--primary)', transition: 'width 0.3s' }} />
                                                    </div>
                                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                        {sortedFilteredTasks.filter(t => (t.status || 'todo') === status).length === 0 && (
                            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
                                Drop tasks here
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
