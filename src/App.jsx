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
    Circle,
    LogOut,
    Sun,
    Columns,
    List as ListIcon,
    Lock,
    Link,
    Trash2
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
    const [viewMode, setViewMode] = useState('list') // 'list' or 'kanban'
    const [listToDelete, setListToDelete] = useState(null)
    const [activeTimerTaskId, setActiveTimerTaskId] = useState(null)
    const [timerSeconds, setTimerSeconds] = useState(0)
    const [isProfileOpen, setProfileOpen] = useState(false)

    const {
        user,
        token,
        lists,
        activeListId,
        setActiveListId,
        tasks,
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
        let interval = null;
        if (activeTimerTaskId) {
            interval = setInterval(() => {
                setTimerSeconds(s => s + 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [activeTimerTaskId]);

    const handleStopTimer = () => {
        if (!activeTimerTaskId) return;
        const task = tasks.find(t => (t._id || t.id) === activeTimerTaskId);
        if (task) {
            updateTaskState(activeTimerTaskId, { timeSpent: (task.timeSpent || 0) + timerSeconds });
        }
        setActiveTimerTaskId(null);
        setTimerSeconds(0);
    };

    const handleDragStart = (e, taskId) => {
        e.dataTransfer.setData('taskId', taskId);
    };

    const handleDrop = (e, status) => {
        const taskId = e.dataTransfer.getData('taskId');
        if (taskId) {
            updateTaskState(taskId, { status });
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    // Global Keybindings
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                taskInputRef.current?.focus();
                taskInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

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
                    </div>
                    <div className="google-login-wrapper">
                        <GoogleLogin
                            onSuccess={credentialResponse => loginWithGoogle(credentialResponse.credential)}
                            onError={() => console.log('Login Failed')}
                        />
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
                                                        setListToDelete(listId);
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
                        <button className="theme-toggle-btn glass" onClick={() => setViewMode(viewMode === 'list' ? 'kanban' : 'list')} title="Toggle View">
                            {viewMode === 'list' ? <Columns size={20} /> : <ListIcon size={20} />}
                        </button>
                        <button className="theme-toggle-btn glass" onClick={toggleTheme}>
                            {theme === 'light' ? (
                                <>
                                    <Clock size={20} />
                                    <span>Dark mode</span>
                                </>
                            ) : (
                                <>
                                    <Star size={20} />
                                    <span>Light mode</span>
                                </>
                            )}
                        </button>
                        <div className="auth-profile" style={{ cursor: 'pointer' }} onClick={() => setProfileOpen(true)}>
                            <div className="user-info">
                                <span>{user?.name || 'User'}</span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold' }}>Level {user?.level || 1}</span>
                            </div>
                            <div className="user-avatar" style={{ border: '2px solid var(--primary)', padding: '2px', borderRadius: '50%' }}>
                                {user?.picture ? <img src={user.picture} alt="Avatar" style={{ borderRadius: '50%' }} /> : <User size={20} />}
                            </div>
                        </div>
                    </div>
                </header>

                <section className="task-list-container">
                    {!['important', 'planned', 'today'].includes(activeListId) && (
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
                    )}

                    <div className="task-items-list" style={{ display: viewMode === 'kanban' ? 'flex' : 'block', gap: '20px', overflowX: viewMode === 'kanban' ? 'auto' : 'hidden', paddingBottom: '20px' }}>

                        {viewMode === 'kanban' ? (
                            ['todo', 'in_progress', 'done'].map(status => (
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
                                                        onClick={() => setSelectedTaskId(task._id || task.id)}
                                                        className={`task-item kanban-card ${selectedTaskId === (task._id || task.id) ? 'selected' : ''}`}
                                                        style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', cursor: 'grab', display: 'block', opacity: isBlocked ? 0.6 : 1 }}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                            <span className="task-title" style={{ fontWeight: '600', fontSize: '1rem', textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? 'var(--text-secondary)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                {isBlocked && <Lock size={14} color="#ff4d4f" />}
                                                                {task.title}
                                                            </span>
                                                            <button className="icon-button delete-btn" onClick={(e) => { e.stopPropagation(); deleteTask(task._id || task.id); if (selectedTaskId === (task._id || task.id)) setSelectedTaskId(null); }} style={{ padding: '4px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>

                                                        <div className="task-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                                                            {task.priority !== 'low' && (
                                                                <span className={`priority-badge ${task.priority}`} style={{ fontSize: '0.7rem', padding: '2px 6px' }}>{task.priority}</span>
                                                            )}
                                                            {task.dueDate && (
                                                                <span className="task-date" style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--primary-light)', padding: '2px 6px', borderRadius: '4px' }}>
                                                                    <Calendar size={10} />
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
                            ))
                        ) : (
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
                                                onClick={() => setSelectedTaskId(task._id || task.id)}
                                                className={`task-item ${task.completed ? 'completed' : ''} ${selectedTaskId === (task._id || task.id) ? 'selected' : ''}`}
                                                style={{ opacity: isBlocked ? 0.6 : 1 }}
                                            >
                                                <button
                                                    className="check-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (isBlocked) {
                                                            toast.error('This task is blocked by another task!');
                                                            return;
                                                        }
                                                        toggleTask(task._id || task.id);
                                                    }}
                                                    style={{ cursor: isBlocked ? 'not-allowed' : 'pointer' }}
                                                >
                                                    {isBlocked ? (
                                                        <Lock size={20} color="#ff4d4f" />
                                                    ) : task.completed ? (
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
                                                            <div className="subtask-progress" style={{ width: '100%', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <div style={{ flex: 1, height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                                                                    <div style={{ width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%`, height: '100%', background: task.subtasks.filter(s => s.completed).length === task.subtasks.length ? '#52c41a' : 'var(--primary)', transition: 'width 0.3s' }} />
                                                                </div>
                                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}</span>
                                                            </div>
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
                        )}
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
                            <label><Link size={16} /> Blocked By</label>
                            <select
                                value={selectedTask.blockedBy?.[0] || ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    updateTaskState(selectedTask._id || selectedTask.id, { blockedBy: val ? [val] : [] });
                                }}
                                className="glass"
                                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--glass-bg)', color: 'var(--text-primary)', outline: 'none' }}
                            >
                                <option value="">None</option>
                                {activeTasks.filter(t => (t._id || t.id) !== (selectedTask._id || selectedTask.id)).map(t => (
                                    <option key={t._id || t.id} value={t._id || t.id}>{t.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="detail-section">
                            <label><Clock size={16} /> Focus Pomodoro Timer</label>
                            <div className="timer-controls glass" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', background: activeTimerTaskId === (selectedTask._id || selectedTask.id) ? 'rgba(255, 77, 79, 0.05)' : 'var(--glass-bg)', border: activeTimerTaskId === (selectedTask._id || selectedTask.id) ? '1px solid rgba(255, 77, 79, 0.3)' : '1px solid var(--border-color)' }}>
                                {activeTimerTaskId === (selectedTask._id || selectedTask.id) ? (
                                    <>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#ff4d4f', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Tracking Focus</span>
                                            <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                                                {String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:{String(timerSeconds % 60).padStart(2, '0')}
                                            </span>
                                        </div>
                                        <button onClick={handleStopTimer} style={{ background: '#ff4d4f', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(255, 77, 79, 0.3)' }}>
                                            Stop Focus
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Time Logged</span>
                                            <span style={{ fontSize: '1.2rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                                                {Math.floor((selectedTask.timeSpent || 0) / 60)}m {(selectedTask.timeSpent || 0) % 60}s
                                            </span>
                                        </div>
                                        <button onClick={() => {
                                            if (activeTimerTaskId) handleStopTimer();
                                            setActiveTimerTaskId(selectedTask._id || selectedTask.id);
                                            setTimerSeconds(0);
                                        }} style={{ background: 'var(--primary)', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }} className="start-focus-btn">
                                            Start Focus
                                        </button>
                                    </>
                                )}
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

            {/* Delete List Modal */}
            <AnimatePresence>
                {listToDelete && (
                    <div className="mobile-backdrop" style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setListToDelete(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass list-delete-modal"
                            style={{ padding: '32px', borderRadius: '24px', maxWidth: '400px', width: '90%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid rgba(255,100,100,0.2)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ background: 'rgba(255, 77, 79, 0.1)', padding: '16px', borderRadius: '50%', marginBottom: '20px' }}>
                                <Trash2 size={40} color="#ff4d4f" />
                            </div>
                            <h3 style={{ marginBottom: '12px', fontSize: '1.5rem', fontWeight: '600' }}>Delete List?</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.5' }}>Are you sure you want to delete this list and all of its tasks? This action <strong style={{ color: 'var(--text-primary)' }}>cannot be undone</strong>.</p>
                            <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                                <button className="btn-cancel" onClick={() => setListToDelete(null)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--glass-bg)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}>Cancel</button>
                                <button className="btn-add" onClick={() => { deleteList(listToDelete); setListToDelete(null); }} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#ff4d4f', color: 'white', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(255, 77, 79, 0.3)' }}>Yes, Delete</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Gamification Profile Modal */}
            <AnimatePresence>
                {isProfileOpen && user && (
                    <div className="mobile-backdrop" style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setProfileOpen(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass profile-modal"
                            style={{ padding: '32px', borderRadius: '24px', maxWidth: '400px', width: '90%', background: 'var(--bg-color)', border: '1px solid var(--border-color)', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                                <img src={user.picture || ''} alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid var(--primary)' }} />
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-primary)' }}>{user.name}</h2>
                                    <span style={{ color: '#ff8c00', fontWeight: 'bold', fontSize: '1.2rem', textShadow: '0 2px 4px rgba(255,140,0,0.3)' }}>Level {user.level || 1}!</span>
                                </div>
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    <span style={{ fontWeight: '600' }}>XP Progress</span>
                                    <span>{user.xp || 0} / {(user.level || 1) * 100} XP</span>
                                </div>
                                <div style={{ background: 'var(--border-color)', height: '16px', borderRadius: '8px', overflow: 'hidden' }}>
                                    <div style={{ background: 'linear-gradient(90deg, #ffd700, #ff8c00)', height: '100%', width: `${Math.min(((user.xp || 0) / ((user.level || 1) * 100)) * 100, 100)}%`, transition: 'width 0.5s ease-out' }}></div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '40px' }}>
                                <h4 style={{ marginBottom: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Star size={18} color="#ffd700" fill="#ffd700" />
                                    Achievements & Badges
                                </h4>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {user.badges && user.badges.length > 0 ? (
                                        user.badges.map(b => (
                                            <span key={b} style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,140,0,0.2))', color: '#ff8c00', padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold', border: '1px solid rgba(255,140,0,0.3)' }}>{b}</span>
                                        ))
                                    ) : (
                                        <div style={{ background: 'var(--glass-bg)', padding: '16px', borderRadius: '12px', width: '100%', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', border: '1px dashed var(--border-color)' }}>
                                            No badges yet. Keep crushing those tasks!
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button onClick={logout} style={{ width: '100%', padding: '14px', borderRadius: '16px', background: 'var(--glass-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }} className="logout-btn-full">
                                <LogOut size={18} /> Logout of KTasks
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
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
