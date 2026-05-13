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

            {/* Sidebar */}
            <aside className={`sidebar glass ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <img src="/logo.png" alt="KTasks" className="sidebar-logo" />
                        <span>KTasks</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <NavItem icon={<Star sx={{fontSize:'22px'}} />} label="Important" active={activeListId === 'important'} onClick={() => setActiveListId('important')} />
                    <NavItem icon={<WbSunny sx={{fontSize:'22px'}} />} label="Today" active={activeListId === 'today'} onClick={() => setActiveListId('today')} />
                    <NavItem icon={<CalendarToday sx={{fontSize:'22px'}} />} label="Planned" active={activeListId === 'planned'} onClick={() => setActiveListId('planned')} />

                    <div className="nav-divider"></div>

                    <div className="nav-section">
                        <header>My Lists</header>
                        {lists.map(list => {
                            const listId = String(list._id || list.id);
                            return (
                                <div key={listId} className="nav-item-wrapper">
                                    {String(editingListId) === listId ? (
                                        <div className="nav-item editing">
                                            <Add sx={{fontSize:'22px'}} className="rotate-45" />
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
                                                        <ChevronRight sx={{fontSize:'14px'}} className="rotate-90" />
                                                    </button>
                                                    <button type="button" onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setListToDelete(listId);
                                                    }}>
                                                        <Delete sx={{fontSize:'14px'}} />
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
                        <Add sx={{fontSize:'22px'}} />
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
                            <Menu sx={{fontSize:'24px'}} />
                        </button>
                        <h1>
                            {activeListId === 'important' ? 'Important' :
                                activeListId === 'planned' ? 'Planned' :
                                    (activeList?.name || 'My Tasks')}
                        </h1>
                    </div>

                    <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                            size="small"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start"><Search sx={{fontSize:18}} /></InputAdornment>
                                ),
                            }}
                            sx={{ width: 180 }}
                        />
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} displayEmpty>
                                <MenuItem value="date_desc">Newest First</MenuItem>
                                <MenuItem value="due_date_asc">Due Date (Soonest)</MenuItem>
                                <MenuItem value="due_date_desc">Due Date (Latest)</MenuItem>
                                <MenuItem value="priority">Priority</MenuItem>
                                <MenuItem value="alphabetical">A-Z</MenuItem>
                            </Select>
                        </FormControl>
                        <Tooltip title={showCompleted ? 'Hide completed' : 'Show completed'}>
                            <IconButton onClick={() => setShowCompleted(!showCompleted)}>
                                {showCompleted ? <Visibility sx={{fontSize:20}} /> : <VisibilityOff sx={{fontSize:20}} />}
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Calendar">
                            <IconButton onClick={() => setCalendarOpen(!calendarOpen)}>
                                <GridView sx={{fontSize:20}} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Statistics">
                            <IconButton onClick={() => setStatsOpen(true)}>
                                <BarChart sx={{fontSize:20}} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={showArchived ? 'Hide archived' : 'Show archived'}>
                            <IconButton onClick={() => setShowArchived(!showArchived)}>
                                <Archive sx={{fontSize:20,color:showArchived ? 'primary.main' : 'inherit'}} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Toggle View">
                            <IconButton onClick={() => setViewMode(viewMode === 'list' ? 'kanban' : 'list')}>
                                {viewMode === 'list' ? <ViewColumn sx={{fontSize:20}} /> : <FormatListBulleted sx={{fontSize:20}} />}
                            </IconButton>
                        </Tooltip>
                        <Button variant="outlined" size="small" onClick={toggleTheme} startIcon={theme === 'light' ? <AccessTime /> : <Star />}>
                            {theme === 'light' ? 'Dark' : 'Light'}
                        </Button>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ cursor: 'pointer' }} onClick={() => setProfileOpen(true)}>
                            <Box textAlign="right">
                                <Typography variant="body2">{user?.name || 'User'}</Typography>
                                <Typography variant="caption" color="primary" fontWeight="bold">Level {user?.level || 1}</Typography>
                            </Box>
                            <Badge overlap="circular">
                                {user?.picture ? <img src={user.picture} alt="Avatar" style={{ width:36, height:36, borderRadius:'50%' }} /> : <Person sx={{fontSize:36}} />}
                            </Badge>
                        </Stack>
                    </Stack>
                </header>

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
                                                            <button className="icon-button delete-btn" onClick={(e) => { e.stopPropagation(); deleteTask(task._id || task.id); if (selectedTaskId === (task._id || task.id)) setSelectedTaskId(null); }} style={{ padding: '4px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                                                <Delete sx={{fontSize:'16px'}} />
                                                            </button>
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

            {/* Detail Panel */}
            {selectedTask && (
                <Paper className={`detail-panel ${selectedTaskId ? 'open' : ''}`} sx={{ position:'fixed', top:0, right:0, width:380, height:'100vh', p:3, overflowY:'auto', zIndex:100, borderRadius:0 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">Task Details</Typography>
                        <IconButton onClick={() => setSelectedTaskId(null)}><ChevronRight /></IconButton>
                    </Stack>

                    <div className="detail-content">
                        <Box mb={2}>
                            <TextField
                                fullWidth
                                variant="standard"
                                value={selectedTask.title || ""}
                                onChange={(e) => updateTaskState(selectedTask._id || selectedTask.id, { title: e.target.value })}
                                InputProps={{ style: { fontSize: '1.3rem', fontWeight: 600 } }}
                            />
                        </Box>

                        <div className="detail-section">
                            <label><CalendarToday sx={{fontSize:'16px'}} /> Due Date & Time</label>
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
                            <label><CalendarToday sx={{fontSize:'16px'}} /> Recurrence</label>
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
                            {selectedTask.recurrence === 'weekly' && (
                                <div style={{ marginTop: '10px' }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Repeat on</label>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                                            <button
                                                key={day}
                                                onClick={() => updateTaskState(selectedTask._id || selectedTask.id, { recurrenceDayOfWeek: idx })}
                                                style={{
                                                    padding: '6px 10px',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--border-color)',
                                                    background: selectedTask.recurrenceDayOfWeek === idx ? 'var(--primary)' : 'var(--glass-bg)',
                                                    color: selectedTask.recurrenceDayOfWeek === idx ? 'white' : 'var(--text-primary)',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem',
                                                    fontWeight: selectedTask.recurrenceDayOfWeek === idx ? 'bold' : 'normal',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
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
                            <label><Star sx={{fontSize:'16px'}} /> Priority</label>
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
                            <label><Link sx={{fontSize:'16px'}} /> Blocked By</label>
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
                            <label><AccessTime sx={{fontSize:'16px'}} /> Focus Pomodoro Timer</label>
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
                            {!templateFormOpen ? (
                                <button
                                    onClick={() => setTemplateFormOpen(true)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px dashed var(--primary)', background: 'var(--primary-light)', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '500' }}
                                >
                                    <SaveIcon sx={{fontSize:'16px'}} /> Save as Template
                                </button>
                            ) : (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        autoFocus
                                        placeholder="Template name..."
                                        value={templateName}
                                        onChange={(e) => setTemplateName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && templateName.trim()) {
                                                addTemplate({
                                                    name: templateName.trim(),
                                                    title: selectedTask.title,
                                                    note: selectedTask.note,
                                                    priority: selectedTask.priority,
                                                    dueTime: selectedTask.dueTime,
                                                    recurrence: selectedTask.recurrence,
                                                    recurrenceDayOfWeek: selectedTask.recurrenceDayOfWeek,
                                                    tags: selectedTask.tags,
                                                    important: selectedTask.important
                                                });
                                                setTemplateName('');
                                                setTemplateFormOpen(false);
                                            }
                                        }}
                                        style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--glass-bg)', color: 'var(--text-primary)' }}
                                    />
                                    <button onClick={() => { setTemplateFormOpen(false); setTemplateName(''); }} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--glass-bg)', cursor: 'pointer', color: 'var(--text-secondary)' }}><Close sx={{fontSize:'16px'}} /></button>
                                </div>
                            )}
                        </div>

                        <div className="detail-section">
                            <label><CalendarToday sx={{fontSize:'16px'}} /> Subtasks</label>
                            <div className="subtasks-list">
                                {selectedTask.subtasks?.map(st => (
                                    <div key={st._id || st.id} className="subtask-item">
                                        <button onClick={() => toggleSubtask(selectedTask._id || selectedTask.id, st._id || st.id)}>
                                            {st.completed ? <CheckCircle sx={{fontSize:'20px',color:'var(--primary)'}} /> : <RadioButtonUnchecked sx={{fontSize:'20px'}} />}
                                        </button>
                                        <span className={st.completed ? 'completed' : ''}>{st.title}</span>
                                    </div>
                                ))}
                                <div className="add-subtask">
                                    <Add sx={{fontSize:'20px'}} />
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
                </Paper>
            )}

            {/* Delete List Modal */}
            <Dialog open={!!listToDelete} onClose={() => setListToDelete(null)} maxWidth="xs" fullWidth>
                <DialogContent sx={{ textAlign: 'center', py: 4 }}>
                    <Box sx={{ background: 'rgba(255, 77, 79, 0.1)', p: 2, borderRadius: '50%', display: 'inline-flex', mb: 2 }}>
                        <Delete sx={{fontSize:40,color:'error.main'}} />
                    </Box>
                    <Typography variant="h5" fontWeight={600} mb={1}>Delete List?</Typography>
                    <Typography color="text.secondary" mb={3}>Are you sure you want to delete this list and all of its tasks? This action <strong>cannot be undone</strong>.</Typography>
                    <Stack direction="row" spacing={2}>
                        <Button fullWidth variant="outlined" onClick={() => setListToDelete(null)}>Cancel</Button>
                        <Button fullWidth variant="contained" color="error" onClick={() => { deleteList(listToDelete); setListToDelete(null); }}>Yes, Delete</Button>
                    </Stack>
                </DialogContent>
            </Dialog>

            {/* Gamification Profile Modal */}
            <Dialog open={isProfileOpen && !!user} onClose={() => setProfileOpen(false)} maxWidth="xs" fullWidth>
                {user && (
                    <DialogContent sx={{ p: 4 }}>
                        <Stack direction="row" alignItems="center" spacing={2} mb={4}>
                            <img src={user.picture || ''} alt="Avatar" style={{ width: 80, height: 80, borderRadius: '50%', border: '4px solid var(--primary)' }} />
                            <Box>
                                <Typography variant="h4" fontWeight="bold">{user.name}</Typography>
                                <Typography variant="h6" color="warning.main" fontWeight="bold">Level {user.level || 1}!</Typography>
                            </Box>
                        </Stack>

                        <Box mb={3}>
                            <Stack direction="row" justifyContent="space-between" mb={1}>
                                <Typography variant="body2" fontWeight={600}>XP Progress</Typography>
                                <Typography variant="body2">{user.xp || 0} / {(user.level || 1) * 100} XP</Typography>
                            </Stack>
                            <Box sx={{ background: 'var(--border-color)', height: 16, borderRadius: 2, overflow: 'hidden' }}>
                                <Box sx={{ background: 'linear-gradient(90deg, #ffd700, #ff8c00)', height: '100%', width: `${Math.min(((user.xp || 0) / ((user.level || 1) * 100)) * 100, 100)}%`, transition: 'width 0.5s ease-out' }} />
                            </Box>
                        </Box>

                        <Box mb={4}>
                            <Typography variant="h6" mb={2} display="flex" alignItems="center" gap={1}>
                                <Star sx={{color:'#ffd700'}} /> Achievements & Badges
                            </Typography>
                            <Stack direction="row" flexWrap="wrap" gap={1}>
                                {user.badges && user.badges.length > 0 ? (
                                    user.badges.map(b => <Chip key={b} label={b} color="warning" variant="outlined" />)
                                ) : (
                                    <Paper sx={{ p: 2, width: '100%', textAlign: 'center' }}>
                                        <Typography color="text.secondary" variant="body2">No badges yet. Keep crushing those tasks!</Typography>
                                    </Paper>
                                )}
                            </Stack>
                        </Box>

                        <Button fullWidth variant="outlined" onClick={logout} startIcon={<Logout />}>Logout of KTasks</Button>
                    </DialogContent>
                )}
            </Dialog>

            {/* Calendar Day Tasks Modal */}
            <Dialog open={!!calendarDayTasks} onClose={() => setCalendarDayTasks(null)} maxWidth="sm" fullWidth>
                {calendarDayTasks && (
                    <DialogContent sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6">{calendarDayTasks.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Typography>
                            <IconButton onClick={() => setCalendarDayTasks(null)}><Close /></IconButton>
                        </Stack>
                        <Stack spacing={1}>
                            {calendarDayTasks.tasks.map(task => (
                                <Paper
                                    key={task._id || task.id}
                                    onClick={() => { setSelectedTaskId(task._id || task.id); setCalendarDayTasks(null); }}
                                    sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', opacity: task.completed ? 0.6 : 1 }}
                                >
                                    <IconButton onClick={(e) => { e.stopPropagation(); toggleTask(task._id || task.id); }}>
                                        {task.completed ? <CheckCircle sx={{color:'primary.main'}} /> : <RadioButtonUnchecked />}
                                    </IconButton>
                                    <Box flex={1}>
                                        <Typography sx={{ textDecoration: task.completed ? 'line-through' : 'none', fontWeight: 500 }}>{task.title}</Typography>
                                        {task.dueTime && <Typography variant="caption" color="text.secondary">{task.dueTime}</Typography>}
                                    </Box>
                                    {task.priority !== 'low' && (
                                        <Chip label={task.priority} size="small" color={task.priority === 'high' ? 'error' : 'warning'} />
                                    )}
                                </Paper>
                            ))}
                        </Stack>
                    </DialogContent>
                )}
            </Dialog>

            {/* Statistics Dashboard Modal */}
            <Dialog open={statsOpen} onClose={() => setStatsOpen(false)} maxWidth="sm" fullWidth>
                <DialogContent sx={{ maxHeight: '85vh', overflowY: 'auto' }}>
                    {(() => {
                        const stats = getStats();
                        const maxCount = Math.max(...stats.weekData.map(d => d.count), 1);
                        return (
                            <>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                                    <Typography variant="h5" display="flex" alignItems="center" gap={1}>
                                        <BarChart sx={{color:'primary.main'}} /> Statistics
                                    </Typography>
                                    <IconButton onClick={() => setStatsOpen(false)}><Close /></IconButton>
                                </Stack>

                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5, mb: 3 }}>
                                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                                        <Typography variant="h3" fontWeight="bold" color="primary">{stats.completed}</Typography>
                                        <Typography variant="body2" color="text.secondary">Completed</Typography>
                                    </Paper>
                                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                                        <Typography variant="h3" fontWeight="bold" color="primary">{stats.total}</Typography>
                                        <Typography variant="body2" color="text.secondary">Total Tasks</Typography>
                                    </Paper>
                                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                                        <Typography variant="h3" fontWeight="bold" color="warning.main">{stats.completionRate}%</Typography>
                                        <Typography variant="body2" color="text.secondary">Completion Rate</Typography>
                                    </Paper>
                                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                                        <Typography variant="h3" fontWeight="bold" color="error.main">{stats.streak}</Typography>
                                        <Typography variant="body2" color="text.secondary">Day Streak</Typography>
                                    </Paper>
                                </Box>

                                <Paper sx={{ p: 2, mb: 2.5 }}>
                                    <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                                        <AccessTime sx={{color:'primary.main'}} />
                                        <Typography fontWeight={600}>Total Focus Time</Typography>
                                    </Stack>
                                    <Typography variant="h4" fontWeight="bold">{Math.floor(stats.totalFocus / 3600)}h {Math.floor((stats.totalFocus % 3600) / 60)}m</Typography>
                                </Paper>

                                <Paper sx={{ p: 2 }}>
                                    <Typography variant="h6" mb={2}>Last 7 Days</Typography>
                                    <Stack direction="row" alignItems="flex-end" gap={1} height={120}>
                                        {stats.weekData.map((d, i) => (
                                            <Box key={i} flex={1} display="flex" flexDirection="column" alignItems="center" gap={0.75}>
                                                <Box sx={{ width: '100%', background: 'var(--border-color)', borderRadius: 1.5, height: '100%', position: 'relative', overflow: 'hidden' }}>
                                                    <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${(d.count / maxCount) * 100}%`, background: 'linear-gradient(180deg, var(--primary), #6b8eff)', borderRadius: 1.5, transition: 'height 0.5s ease-out', minHeight: d.count > 0 ? '4px' : 0 }} />
                                                </Box>
                                                <Typography variant="caption" color="text.secondary">{d.label}</Typography>
                                                <Typography variant="caption" fontWeight="bold">{d.count}</Typography>
                                            </Box>
                                        ))}
                                    </Stack>
                                </Paper>
                            </>
                        );
                    })()}
                </DialogContent>
            </Dialog>
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
