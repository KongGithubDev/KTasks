import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Button, IconButton, TextField, Dialog, DialogTitle, DialogContent, Paper,
    Select, MenuItem, Checkbox, Chip, Badge, Box, Stack, Typography,
    FormControl, InputLabel, Divider, Tooltip, InputAdornment
} from '@mui/material'
import CheckCircle from '@mui/icons-material/CheckCircle'
import Star from '@mui/icons-material/Star'
import StarBorder from '@mui/icons-material/StarBorder'
import WbSunny from '@mui/icons-material/WbSunny'
import CalendarToday from '@mui/icons-material/CalendarToday'
import Add from '@mui/icons-material/Add'
import ChevronRight from '@mui/icons-material/ChevronRight'
import Delete from '@mui/icons-material/Delete'
import Menu from '@mui/icons-material/Menu'
import Search from '@mui/icons-material/Search'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import GridView from '@mui/icons-material/GridView'
import BarChart from '@mui/icons-material/BarChart'
import Archive from '@mui/icons-material/Archive'
import ViewColumn from '@mui/icons-material/ViewColumn'
import FormatListBulleted from '@mui/icons-material/FormatListBulleted'
import AccessTime from '@mui/icons-material/AccessTime'
import Person from '@mui/icons-material/Person'
import ChevronLeft from '@mui/icons-material/ChevronLeft'
import Lock from '@mui/icons-material/Lock'
import CalendarMonth from '@mui/icons-material/CalendarMonth'
import Warning from '@mui/icons-material/Warning'
import Close from '@mui/icons-material/Close'
import SaveIcon from '@mui/icons-material/Save'
import RadioButtonUnchecked from '@mui/icons-material/RadioButtonUnchecked'
import Logout from '@mui/icons-material/Logout'
import { useTasks } from './context/TaskContext'
import { GoogleLogin } from '@react-oauth/google'
import { Toaster, toast } from 'react-hot-toast'
import Sidebar from './components/layout/Sidebar.jsx'
import Header from './components/layout/Header.jsx'
import DetailPanel from './components/layout/DetailPanel.jsx'
import DeleteListModal from './components/modals/DeleteListModal.jsx'
import ProfileModal from './components/modals/ProfileModal.jsx'
import CalendarDayModal from './components/modals/CalendarDayModal.jsx'
import StatsModal from './components/modals/StatsModal.jsx'

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
    const [showCompleted, setShowCompleted] = useState(true)
    const [bulkSelection, setBulkSelection] = useState([])
    const [calendarOpen, setCalendarOpen] = useState(false)
    const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth())
    const [calendarYear, setCalendarYear] = useState(new Date().getFullYear())
    const [calendarDayTasks, setCalendarDayTasks] = useState(null) // { date: Date, tasks: [] }
    const [statsOpen, setStatsOpen] = useState(false)
    const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false)
    const [templateFormOpen, setTemplateFormOpen] = useState(false)
    const [templateName, setTemplateName] = useState('')

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
        archiveTask,
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
        updateTaskState,
        showArchived,
        setShowArchived,
        addTemplate,
        deleteTemplate
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

    const getDueStatus = (task) => {
        if (!task.dueDate || task.completed) return null;
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const due = new Date(task.dueDate);
        due.setHours(0, 0, 0, 0);
        const diff = due.getTime() - now.getTime();
        const days = diff / (1000 * 60 * 60 * 24);
        if (days < 0) return 'overdue';
        if (days === 0) return 'today';
        if (days <= 3) return 'soon';
        return null;
    };

    const toggleBulkSelect = (taskId) => {
        setBulkSelection(prev =>
            prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
        );
    };

    const handleBulkComplete = () => {
        bulkSelection.forEach(id => toggleTask(id));
        setBulkSelection([]);
    };

    const handleBulkDelete = () => {
        bulkSelection.forEach(id => deleteTask(id));
        setBulkSelection([]);
    };

    // Calendar helpers
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
    const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const getTasksForDate = (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return activeTasks.filter(t => {
            if (!t.dueDate) return false;
            const td = new Date(t.dueDate);
            td.setHours(0, 0, 0, 0);
            return td.getTime() === d.getTime();
        });
    };

    const prevMonth = () => {
        if (calendarMonth === 0) {
            setCalendarMonth(11);
            setCalendarYear(calendarYear - 1);
        } else {
            setCalendarMonth(calendarMonth - 1);
        }
    };

    const nextMonth = () => {
        if (calendarMonth === 11) {
            setCalendarMonth(0);
            setCalendarYear(calendarYear + 1);
        } else {
            setCalendarMonth(calendarMonth + 1);
        }
    };

    // Stats helpers
    const getStats = () => {
        const now = new Date();
        const oneWeekAgo = new Date(now); oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const allCompleted = tasks.filter(t => t.completed);
        const weeklyCompleted = allCompleted.filter(t => {
            const d = new Date(t.createdAt || t.updatedAt);
            return d >= oneWeekAgo;
        });
        const totalFocus = tasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0);
        const completionRate = tasks.length > 0 ? Math.round((allCompleted.length / tasks.length) * 100) : 0;

        // Streak calculation
        const completedDates = [...new Set(allCompleted.map(t => {
            const d = new Date(t.createdAt || t.updatedAt);
            d.setHours(0, 0, 0, 0);
            return d.getTime();
        }))].sort((a, b) => b - a);
        let streak = 0;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        let checkDate = today.getTime();
        for (const date of completedDates) {
            if (date === checkDate || (streak === 0 && date === checkDate - 86400000)) {
                streak++;
                checkDate -= 86400000;
            } else if (date !== checkDate) {
                break;
            }
        }
        // Weekly bar chart data
        const weekData = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(now); d.setDate(d.getDate() - (6 - i)); d.setHours(0, 0, 0, 0);
            return {
                label: d.toLocaleDateString('en-US', { weekday: 'short' }),
                count: allCompleted.filter(t => {
                    const td = new Date(t.createdAt || t.updatedAt);
                    td.setHours(0, 0, 0, 0);
                    return td.getTime() === d.getTime();
                }).length
            };
        });

        return { total: tasks.length, completed: allCompleted.length, weekly: weeklyCompleted.length, totalFocus, completionRate, streak, weekData };
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

    const filteredTasks = activeTasks.filter(t => {
        const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.note && t.note.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchCompleted = showCompleted || !t.completed;
        return matchSearch && matchCompleted;
    })

    const sortedFilteredTasks = [...filteredTasks].sort((a, b) => {
        if (sortBy === 'priority') {
            const p = { high: 3, medium: 2, low: 1 };
            return (p[b.priority] || 0) - (p[a.priority] || 0);
        } else if (sortBy === 'alphabetical') {
            return a.title.localeCompare(b.title);
        } else if (sortBy === 'due_date_asc') {
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        } else if (sortBy === 'due_date_desc') {
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(b.dueDate) - new Date(a.dueDate);
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
                    <CheckCircle sx={{fontSize:'48px',color:'var(--primary)'}} />
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

            <Sidebar
                isSidebarOpen={isSidebarOpen}
                isMobile={isMobile}
                setSidebarOpen={setSidebarOpen}
                activeListId={activeListId}
                setActiveListId={setActiveListId}
                lists={lists}
                editingListId={editingListId}
                setEditingListId={setEditingListId}
                editListTitle={editListTitle}
                setEditListTitle={setEditListTitle}
                handleUpdateList={handleUpdateList}
                isCreatingList={isCreatingList}
                setIsCreatingList={setIsCreatingList}
                newListTitle={newListTitle}
                setNewListTitle={setNewListTitle}
                handleAddList={handleAddList}
                setListToDelete={setListToDelete}
                addList={addList}
            />

            <main className="main-content">
                <Header
                    isSidebarOpen={isSidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    activeListId={activeListId}
                    activeList={activeList}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    showCompleted={showCompleted}
                    setShowCompleted={setShowCompleted}
                    calendarOpen={calendarOpen}
                    setCalendarOpen={setCalendarOpen}
                    setStatsOpen={setStatsOpen}
                    showArchived={showArchived}
                    setShowArchived={setShowArchived}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    theme={theme}
                    toggleTheme={toggleTheme}
                    user={user}
                    setProfileOpen={setProfileOpen}
                />

                <section className="task-list-container">
                    {bulkSelection.length > 0 && (
                        <Paper sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, mb: 1.5, border: '1px solid', borderColor: 'primary.light' }}>
                            <Typography variant="body2" fontWeight={600}>{bulkSelection.length} selected</Typography>
                            <Stack direction="row" spacing={1}>
                                <Button size="small" variant="contained" onClick={handleBulkComplete}>Complete</Button>
                                <Button size="small" variant="contained" color="error" onClick={handleBulkDelete}>Delete</Button>
                                <Button size="small" variant="outlined" onClick={() => setBulkSelection([])}>Cancel</Button>
                            </Stack>
                        </Paper>
                    )}

                    {/* Calendar View */}
                    {calendarOpen && (
                        <div className="calendar-wrapper glass" style={{ padding: '16px', borderRadius: '16px', marginBottom: '16px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <IconButton onClick={prevMonth}><ChevronLeft /></IconButton>
                                <Typography variant="h6">{MONTH_NAMES[calendarMonth]} {calendarYear}</Typography>
                                <IconButton onClick={nextMonth}><ChevronRight /></IconButton>
                            </Box>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                    <div key={d} style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', padding: '8px 0' }}>{d}</div>
                                ))}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                                {Array.from({ length: getFirstDayOfMonth(calendarYear, calendarMonth) }).map((_, i) => (
                                    <div key={`empty-${i}`} />
                                ))}
                                {Array.from({ length: getDaysInMonth(calendarYear, calendarMonth) }).map((_, i) => {
                                    const day = i + 1;
                                    const date = new Date(calendarYear, calendarMonth, day);
                                    const dayTasks = getTasksForDate(date);
                                    const isToday = new Date().toDateString() === date.toDateString();
                                    return (
                                        <button
                                            key={day}
                                            onClick={() => dayTasks.length > 0 && setCalendarDayTasks({ date, tasks: dayTasks })}
                                            style={{
                                                aspectRatio: '1',
                                                borderRadius: '8px',
                                                border: isToday ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                                background: isToday ? 'var(--primary-light)' : 'var(--glass-bg)',
                                                color: 'var(--text-primary)',
                                                cursor: dayTasks.length > 0 ? 'pointer' : 'default',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '4px',
                                                padding: '4px',
                                                position: 'relative'
                                            }}
                                        >
                                            <span style={{ fontSize: '0.9rem', fontWeight: isToday ? 'bold' : 'normal' }}>{day}</span>
                                            {dayTasks.length > 0 && (
                                                <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                                    {dayTasks.slice(0, 3).map((t, idx) => (
                                                        <div key={idx} style={{
                                                            width: '6px',
                                                            height: '6px',
                                                            borderRadius: '50%',
                                                            background: t.completed ? '#52c41a' : t.priority === 'high' ? '#ff4d4f' : t.priority === 'medium' ? '#ff8c00' : 'var(--primary)'
                                                        }} />
                                                    ))}
                                                    {dayTasks.length > 3 && <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>+{dayTasks.length - 3}</span>}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {!['important', 'planned', 'today'].includes(activeListId) && (
                        <div className="create-task-wrapper">
                            <div className="add-task-box">
                                <Add sx={{fontSize:'24px',color:'var(--primary)'}} />
                                <input
                                    ref={taskInputRef}
                                    type="text"
                                    placeholder="Add a task"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    onKeyDown={handleAddTask}
                                />
                            </div>
                            {user?.templates && user.templates.length > 0 && (
                                <div style={{ position: 'relative', marginTop: '8px' }}>
                                    <button
                                        className="theme-toggle-btn glass"
                                        onClick={() => setTemplateDropdownOpen(!templateDropdownOpen)}
                                        style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                                    >
                                        <SaveIcon sx={{fontSize:'14px'}} /> Use Template
                                    </button>
                                    {templateDropdownOpen && (
                                        <div className="glass" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 50, marginTop: '4px', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden', minWidth: '200px' }}>
                                            {user.templates.map((tmpl, idx) => (
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
                                                        <Delete sx={{fontSize:'12px'}} />
                                                    </button>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
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
                                                        style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-color)', border: getDueStatus(task) === 'overdue' ? '1px solid #ff4d4f' : getDueStatus(task) === 'today' ? '1px solid #ff8c00' : getDueStatus(task) === 'soon' ? '1px solid #ffd700' : '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', cursor: 'grab', display: 'block', opacity: isBlocked ? 0.6 : 1 }}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                            <span className="task-title" style={{ fontWeight: '600', fontSize: '1rem', textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? 'var(--text-secondary)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                {isBlocked && <Lock sx={{fontSize:'14px',color:'#ff4d4f'}} />}
                                                                {task.title}
                                                            </span>
                                                            <Tooltip title="Delete">
                                                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); deleteTask(task._id || task.id); if (selectedTaskId === (task._id || task.id)) setSelectedTaskId(null); }}>
                                                                    <Delete sx={{fontSize:16}} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </div>

                                                        <div className="task-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                                                            {task.priority !== 'low' && (
                                                                <span className={`priority-badge ${task.priority}`} style={{ fontSize: '0.7rem', padding: '2px 6px' }}>{task.priority}</span>
                                                            )}
                                                            {task.dueDate && (
                                                                <span className="task-date" style={{ fontSize: '0.75rem', color: getDueStatus(task) === 'overdue' ? '#ff4d4f' : getDueStatus(task) === 'today' ? '#ff8c00' : getDueStatus(task) === 'soon' ? '#d4a017' : 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', background: getDueStatus(task) === 'overdue' ? 'rgba(255, 77, 79, 0.1)' : getDueStatus(task) === 'today' ? 'rgba(255, 140, 0, 0.1)' : getDueStatus(task) === 'soon' ? 'rgba(255, 215, 0, 0.15)' : 'var(--primary-light)', padding: '2px 6px', borderRadius: '4px' }}>
                                                                    <CalendarMonth sx={{fontSize:'10px'}} />
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
                                                        toggleTask(task._id || task.id);
                                                    }}
                                                    style={{ cursor: isBlocked ? 'not-allowed' : 'pointer' }}
                                                >
                                                    {isBlocked ? (
                                                        <Lock sx={{fontSize:'20px',color:'#ff4d4f'}} />
                                                    ) : task.completed ? (
                                                        <CheckCircle sx={{fontSize:'28px',color:'var(--primary)'}} />
                                                    ) : (
                                                        <RadioButtonUnchecked sx={{fontSize:'28px',color:'var(--border-color)'}} />
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
                                                                <Warning sx={{fontSize:'10px'}} /> Overdue
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="task-meta">
                                                        {task.note && <span className="task-note">{task.note.substring(0, 60)}{task.note.length > 60 ? '...' : ''}</span>}
                                                        {task.dueDate && (
                                                            <span className="task-date" style={{ fontSize: '0.8rem', color: getDueStatus(task) === 'overdue' ? '#ff4d4f' : getDueStatus(task) === 'today' ? '#ff8c00' : getDueStatus(task) === 'soon' ? '#d4a017' : 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', background: getDueStatus(task) === 'overdue' ? 'rgba(255, 77, 79, 0.1)' : getDueStatus(task) === 'today' ? 'rgba(255, 140, 0, 0.1)' : getDueStatus(task) === 'soon' ? 'rgba(255, 215, 0, 0.15)' : 'var(--primary-light)', padding: '2px 6px', borderRadius: '4px' }}>
                                                                <CalendarMonth sx={{fontSize:'12px'}} />
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
                                                <Stack direction="row" spacing={0.5}>
                                                    <Tooltip title="Important">
                                                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleImportant(task._id || task.id); }}>
                                                            {task.important ? <Star sx={{fontSize:20,color:'primary.main'}} /> : <StarBorder sx={{fontSize:20,color:'text.secondary'}} />}
                                                        </IconButton>
                                                    </Tooltip>
                                                    {!task.archived && (
                                                        <Tooltip title="Archive">
                                                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); archiveTask(task._id || task.id); if (selectedTaskId === (task._id || task.id)) setSelectedTaskId(null); }}>
                                                                <Archive sx={{fontSize:18,color:'text.secondary'}} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    <Tooltip title="Delete">
                                                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); deleteTask(task._id || task.id); if (selectedTaskId === (task._id || task.id)) setSelectedTaskId(null); }}>
                                                            <Delete sx={{fontSize:20}} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
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
                                            <CheckCircle sx={{fontSize:'120px',color:'var(--primary)',opacity:0.3}} />
                                        </motion.div>
                                        <h3>Your plate is clear</h3>
                                        <p>Enjoy the peace, or start something new.</p>
                                        <Button variant="contained" onClick={() => {
                                            taskInputRef.current?.focus();
                                            taskInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        }}>
                                            Create your first task
                                        </Button>
                                    </div>
                                )}
                            </AnimatePresence>
                        )}
                    </div>
                </section>
            </main>

            <DetailPanel
                selectedTask={selectedTask}
                selectedTaskId={selectedTaskId}
                onClose={() => setSelectedTaskId(null)}
                updateTaskState={updateTaskState}
                activeTimerTaskId={activeTimerTaskId}
                timerSeconds={timerSeconds}
                handleStopTimer={handleStopTimer}
                setActiveTimerTaskId={setActiveTimerTaskId}
                setTimerSeconds={setTimerSeconds}
                setPriority={setPriority}
                activeTasks={activeTasks}
                templateFormOpen={templateFormOpen}
                setTemplateFormOpen={setTemplateFormOpen}
                templateName={templateName}
                setTemplateName={setTemplateName}
                addTemplate={addTemplate}
                subtaskInput={subtaskInput}
                setSubtaskInput={setSubtaskInput}
                addSubtask={addSubtask}
                toggleSubtask={toggleSubtask}
                handleAddSubtask={handleAddSubtask}
                updateNote={updateNote}
            />

            <DeleteListModal
                listToDelete={listToDelete}
                onClose={() => setListToDelete(null)}
                onDelete={deleteList}
            />

            <ProfileModal
                open={isProfileOpen}
                user={user}
                onClose={() => setProfileOpen(false)}
                onLogout={logout}
            />

            <CalendarDayModal
                calendarDayTasks={calendarDayTasks}
                onClose={() => setCalendarDayTasks(null)}
                onSelectTask={setSelectedTaskId}
                onToggleTask={toggleTask}
            />

            <StatsModal
                open={statsOpen}
                onClose={() => setStatsOpen(false)}
                stats={getStats()}
            />
        </div>
    );
}

export default App
