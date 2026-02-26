import { useState, useEffect, useRef } from 'react'
import {
    CheckCircle2,
    Menu,
    Plus,
    Search,
    Star,
    Calendar,
    Clock,
    ChevronRight,
    User,
    Trash2,
    Circle,
    LogOut,
    Sun
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTasks } from './context/TaskContext'
import { GoogleLogin } from '@react-oauth/google'
import { Toaster, toast } from 'react-hot-toast'

function App() {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
    const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024)
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024)
    const [newTaskTitle, setNewTaskTitle] = useState('')
    const [selectedTaskId, setSelectedTaskId] = useState(null)
    const taskInputRef = useRef(null)

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 1024
            setIsMobile(mobile)
            if (mobile) {
                setSidebarOpen(false)
            } else {
                setSidebarOpen(true)
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])
    const [subtaskInput, setSubtaskInput] = useState('')
    const [isCreatingList, setIsCreatingList] = useState(false)
    const [newListTitle, setNewListTitle] = useState('')
    const [editingListId, setEditingListId] = useState(null)
    const [editListTitle, setEditListTitle] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState('date_desc')

    const {
        user,
        token,
        lists,
        activeListId,
        setActiveListId,
        addTask,
        toggleTask,
        toggleImportant,
        deleteTask,
        activeTasks,
        addSubtask,
        toggleSubtask,
        setPriority,
        updateNote,
        addList,
        updateList,
        deleteList,
        loginWithGoogle,
        logout,
        loading,
        authLoading,
        updateTaskState
    } = useTasks()

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)
    }, [theme])

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')

    const handleAddTask = (e) => {
        if (e.key === 'Enter') {
            addTask(newTaskTitle)
            setNewTaskTitle('')
        }
    }

    const handleAddList = (e) => {
        if (e.key === 'Enter') {
            if (!newListTitle.trim()) return toast.error('List name cannot be empty')
            addList(newListTitle)
            setNewListTitle('')
            setIsCreatingList(false)
        }
    }

    const handleUpdateList = (id) => {
        const trimmed = editListTitle.trim()
        if (!trimmed) return toast.error('List name cannot be empty')
        updateList(String(id), trimmed)
        setEditingListId(null)
    }

    const activeList = lists.find(l => l._id === activeListId) || lists.find(l => l.id === activeListId)
    const selectedTask = activeTasks.find(t => t._id === selectedTaskId || t.id === selectedTaskId)

    const filteredTasks = activeTasks.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.note && t.note.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const sortedFilteredTasks = [...filteredTasks].sort((a, b) => {
        if (sortBy === 'priority') {
            const p = { high: 3, medium: 2, low: 1 };
            return (p[b.priority] || 0) - (p[a.priority] || 0);
        } else if (sortBy === 'alphabetical') {
            return a.title.localeCompare(b.title);
        } else {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
    });

    const handleAddSubtask = (e) => {
        if (e.key === 'Enter' && selectedTaskId) {
            addSubtask(selectedTaskId, subtaskInput)
            setSubtaskInput('')
        }
    }
    if (authLoading && token) {
        return (
            <div className="loading-screen glass">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                    <CheckCircle2 size={48} color="var(--primary)" />
                </motion.div>
                <p>Loading your tasks...</p>
            </div>
        )
    }

    if (!token) {
        return (
            <div className="login-screen glass">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="login-card glass"
                >
                    <div className="login-header">
                        <img src="/logo.png" alt="KTasks Logo" className="login-logo" />
                        <h1>KTasks</h1>
                        <p>Elevate your productivity with glassmorphism.</p>
                    </div>
                    <div className="google-login-wrapper">
                        <GoogleLogin
                            onSuccess={credentialResponse => loginWithGoogle(credentialResponse.credential)}
                            onError={() => console.log('Login Failed')}
                        />
                    </div>
                    <div className="login-footer">
                        <span>Powered by MongoDB Atlas & Google</span>
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="app-layout">
            <Toaster position="top-right" />
            {/* Mobile Backdrop */}
            {isMobile && (isSidebarOpen || selectedTaskId) && (
                <div
                    className="mobile-backdrop"
                    onClick={() => {
                        setSidebarOpen(false);
                        setSelectedTaskId(null);
                    }}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar glass ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <img src="/logo.png" alt="KTasks" className="sidebar-logo" />
                        <span>KTasks</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <NavItem icon={<Star size={22} />} label="Important" active={activeListId === 'important'} onClick={() => setActiveListId('important')} />
                    <NavItem icon={<Sun size={22} />} label="Today" active={activeListId === 'today'} onClick={() => setActiveListId('today')} />
                    <NavItem icon={<Calendar size={22} />} label="Planned" active={activeListId === 'planned'} onClick={() => setActiveListId('planned')} />

                    <div className="nav-divider"></div>

                    <div className="nav-section">
                        <header>My Lists</header>
                        {lists.map(list => {
                            const listId = String(list._id || list.id);
                            return (
                                <div key={listId} className="nav-item-wrapper">
                                    {String(editingListId) === listId ? (
                                        <div className="nav-item editing">
                                            <Plus size={22} className="rotate-45" />
                                            <input
                                                autoFocus
                                                value={editListTitle}
                                                onChange={(e) => setEditListTitle(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateList(listId)}
                                                onBlur={() => setEditingListId(null)}
                                            />
                                        </div>
                                    ) : (
                                        <NavItem
                                            label={list.name}
                                            active={String(activeListId) === listId}
                                            onClick={() => {
                                                setActiveListId(listId);
                                                if (isMobile) setSidebarOpen(false);
                                            }}
                                            actions={
                                                <div className="list-actions">
                                                    <button type="button" onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setEditingListId(listId);
                                                        setEditListTitle(list.name);
                                                    }}>
                                                        <ChevronRight size={14} className="rotate-90" />
                                                    </button>
                                                    <button type="button" onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        deleteList(listId);
                                                    }}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            }
                                        />
                                    )}
                                </div>
                            );
                        })}
                        {isCreatingList && (
                            <div className="new-list-card glass">
                                <input
                                    autoFocus
                                    placeholder="Enter list name..."
                                    value={newListTitle}
                                    onChange={(e) => setNewListTitle(e.target.value)}
                                    onKeyDown={handleAddList}
                                    className="list-input"
                                />
                                <div className="card-actions">
                                    <button className="btn-cancel" onClick={() => setIsCreatingList(false)}>Cancel</button>
                                    <button className="btn-add" onClick={() => {
                                        if (newListTitle.trim()) {
                                            addList(newListTitle);
                                            setNewListTitle('');
                                            setIsCreatingList(false);
                                        } else {
                                            toast.error('Name required');
                                        }
                                    }}>Add List</button>
                                </div>
                            </div>
                        )}
                    </div>
                </nav>

                {!isCreatingList && (
                    <button className="new-list-btn" onClick={() => setIsCreatingList(true)}>
                        <Plus size={22} />
                        <span>Create New List</span>
                    </button>
                )}

                <div className="sidebar-footer">
                    <div className="developer-credit">
                        <span className="label">Developed by</span>
                        <span className="name">Watcharapong Namsaeng</span>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="main-content">
                <header className="main-header">
                    <div className="header-left">
                        <button className="icon-button" onClick={() => setSidebarOpen(!isSidebarOpen)}>
                            <Menu size={24} />
                        </button>
                        <h1>
                            {activeListId === 'important' ? 'Important' :
                                activeListId === 'planned' ? 'Planned' :
                                    (activeList?.name || 'My Tasks')}
                        </h1>
                    </div>

                    <div className="header-right">
                        <div className="search-bar-wrapper glass">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select
                            className="theme-toggle-btn glass"
                            style={{ padding: '8px 12px', border: 'none', borderRadius: '20px', appearance: 'none', cursor: 'pointer', outline: 'none' }}
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="date_desc">Newest First</option>
                            <option value="priority">Priority</option>
                            <option value="alphabetical">A-Z</option>
                        </select>
                        <button className="theme-toggle-btn glass" onClick={toggleTheme}>
                            {theme === 'light' ? (
                                <>
                                    <Clock size={20} />
                                    <span>โหมดมืด</span>
                                </>
                            ) : (
                                <>
                                    <Star size={20} />
                                    <span>โหมดสว่าง</span>
                                </>
                            )}
                        </button>
                        <div className="auth-profile">
                            <div className="user-info">
                                <span>{user?.name || 'User'}</span>
                                <button className="logout-btn" onClick={logout}>
                                    <LogOut size={14} />
                                    <span>Logout</span>
                                </button>
                            </div>
                            <div className="user-avatar">
                                {user?.picture ? <img src={user.picture} alt="Avatar" /> : <User size={20} />}
                            </div>
                        </div>
                    </div>
                </header>

                <section className="task-list-container">
                    <div className="create-task-wrapper">
                        <div className="add-task-box">
                            <Plus size={24} color="var(--primary)" strokeWidth={3} />
                            <input
                                ref={taskInputRef}
                                type="text"
                                placeholder="Add a task"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                onKeyDown={handleAddTask}
                            />
                        </div>
                    </div>

                    <div className="task-items-list">
                        <AnimatePresence mode="popLayout">
                            {sortedFilteredTasks.length > 0 ? (
                                sortedFilteredTasks.map(task => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        whileHover={{ scale: 1.01 }}
                                        key={task._id || task.id}
                                        onClick={() => setSelectedTaskId(task._id || task.id)}
                                        className={`task-item ${task.completed ? 'completed' : ''} ${selectedTaskId === (task._id || task.id) ? 'selected' : ''}`}
                                    >
                                        <button className="check-btn" onClick={(e) => { e.stopPropagation(); toggleTask(task._id || task.id); }}>
                                            {task.completed ? (
                                                <CheckCircle2 size={28} color="var(--primary)" fill="var(--primary)" fillOpacity="0.2" strokeWidth={2.5} />
                                            ) : (
                                                <Circle size={28} color="var(--border-color)" strokeWidth={2.5} />
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
                                            </div>
                                            <div className="task-meta">
                                                {task.note && <span className="task-note">{task.note.substring(0, 60)}{task.note.length > 60 ? '...' : ''}</span>}
                                                {task.dueDate && (
                                                    <span className="task-date" style={{ fontSize: '0.8rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--primary-light)', padding: '2px 6px', borderRadius: '4px' }}>
                                                        <Calendar size={12} />
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
                                                    <span className="subtask-count">
                                                        <span className="dot"></span>
                                                        {task.subtasks.filter(s => s.completed).length} / {task.subtasks.length} subtasks
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="task-actions">
                                            <button className="icon-button star-btn" onClick={(e) => { e.stopPropagation(); toggleImportant(task._id || task.id); }}>
                                                <Star size={20} fill={task.important ? "var(--primary)" : "none"} color={task.important ? "var(--primary)" : "var(--text-secondary)"} />
                                            </button>
                                            <button className="icon-button delete-btn" onClick={(e) => { e.stopPropagation(); deleteTask(task._id || task.id); if (selectedTaskId === (task._id || task.id)) setSelectedTaskId(null); }}>
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 0.5, scale: 1 }}
                                        transition={{ duration: 1 }}
                                        className="empty-icon"
                                    >
                                        <CheckCircle2 size={120} strokeWidth={0.5} />
                                    </motion.div>
                                    <h3>Your plate is clear</h3>
                                    <p>Enjoy the peace, or start something new.</p>
                                    <button className="create-first-btn" onClick={() => {
                                        taskInputRef.current?.focus();
                                        taskInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }}>
                                        Create your first task
                                    </button>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>
            </main>

            {/* Detail Panel */}
            {selectedTask && (
                <aside className={`detail-panel glass ${selectedTaskId ? 'open' : ''}`}>
                    <div className="detail-header">
                        <span>Task Details</span>
                        <button className="icon-button" onClick={() => setSelectedTaskId(null)}><ChevronRight size={20} /></button>
                    </div>

                    <div className="detail-content">
                        <div className="detail-section">
                            <input
                                className="editable-title"
                                value={selectedTask.title || ""}
                                onChange={(e) => updateTaskState(selectedTask._id || selectedTask.id, { title: e.target.value })}
                            />
                        </div>

                        <div className="detail-section">
                            <label><Calendar size={16} /> Due Date & Time</label>
                            <div className="date-time-inputs" style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="date"
                                    value={selectedTask.dueDate ? new Date(selectedTask.dueDate).toISOString().split('T')[0] : ''}
                                    onChange={(e) => updateTaskState(selectedTask._id || selectedTask.id, { dueDate: e.target.value })}
                                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--glass-bg)', color: 'var(--text-primary)' }}
                                />
                                <input
                                    type="time"
                                    value={selectedTask.dueTime || ''}
                                    onChange={(e) => updateTaskState(selectedTask._id || selectedTask.id, { dueTime: e.target.value })}
                                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--glass-bg)', color: 'var(--text-primary)' }}
                                />
                            </div>
                        </div>

                        <div className="detail-section">
                            <label><Calendar size={16} /> Recurrence</label>
                            <select
                                value={selectedTask.recurrence || 'none'}
                                onChange={(e) => updateTaskState(selectedTask._id || selectedTask.id, { recurrence: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--glass-bg)', color: 'var(--text-primary)' }}
                            >
                                <option value="none">Does not repeat</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>

                        <div className="detail-section">
                            <label>Tags</label>
                            <div className="tags-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                                {(selectedTask.tags || []).map(tag => (
                                    <span key={tag} style={{ background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        #{tag}
                                        <button onClick={() => {
                                            const newTags = (selectedTask.tags || []).filter(t => t !== tag);
                                            updateTaskState(selectedTask._id || selectedTask.id, { tags: newTags });
                                        }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '12px', padding: 0 }}>&times;</button>
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text"
                                placeholder="Add tag and press Enter"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.target.value.trim() !== '') {
                                        const t = e.target.value.trim();
                                        if (!(selectedTask.tags || []).includes(t)) {
                                            const newTags = [...(selectedTask.tags || []), t];
                                            updateTaskState(selectedTask._id || selectedTask.id, { tags: newTags });
                                        }
                                        e.target.value = '';
                                    }
                                }}
                                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--glass-bg)', color: 'var(--text-primary)' }}
                            />
                        </div>

                        <div className="detail-section">
                            <label><Star size={16} /> Priority</label>
                            <div className="priority-selector">
                                {['low', 'medium', 'high'].map(p => (
                                    <button
                                        key={p}
                                        className={`p-btn ${p} ${selectedTask.priority === p ? 'active' : ''}`}
                                        onClick={() => setPriority(selectedTask._id || selectedTask.id, p)}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="detail-section">
                            <label><Calendar size={16} /> Subtasks</label>
                            <div className="subtasks-list">
                                {selectedTask.subtasks?.map(st => (
                                    <div key={st._id || st.id} className="subtask-item">
                                        <button onClick={() => toggleSubtask(selectedTask._id || selectedTask.id, st._id || st.id)}>
                                            {st.completed ? <CheckCircle2 size={20} color="var(--primary)" /> : <Circle size={20} />}
                                        </button>
                                        <span className={st.completed ? 'completed' : ''}>{st.title}</span>
                                    </div>
                                ))}
                                <div className="add-subtask">
                                    <Plus size={20} />
                                    <input
                                        placeholder="Next step..."
                                        value={subtaskInput}
                                        onChange={(e) => setSubtaskInput(e.target.value)}
                                        onKeyDown={handleAddSubtask}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="detail-section">
                            <label>Notes</label>
                            <textarea
                                placeholder="Additional context..."
                                value={selectedTask.note}
                                onChange={(e) => updateNote(selectedTask._id || selectedTask.id, e.target.value)}
                            />
                        </div>
                    </div>
                </aside>
            )}
        </div>
    );
}

function NavItem({ icon, label, active, onClick, actions }) {
    return (
        <div className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
            {icon || <div className="nav-dot" />}
            <span className="nav-label">{label}</span>
            {actions}
        </div>
    )
}

export default App
