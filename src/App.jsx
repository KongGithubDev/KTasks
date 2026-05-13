import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button, Paper, Stack, Typography, CircularProgress } from '@mui/material'
import CheckCircle from '@mui/icons-material/CheckCircle'
import { useTasks } from './context/TaskContext'
import { GoogleLogin } from '@react-oauth/google'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/layout/Sidebar.jsx'
import Header from './components/layout/Header.jsx'
import DetailPanel from './components/layout/DetailPanel.jsx'
import CalendarView from './components/layout/CalendarView.jsx'
import CreateTaskInput from './components/task/CreateTaskInput.jsx'
import DeleteListModal from './components/modals/DeleteListModal.jsx'
import ProfileModal from './components/modals/ProfileModal.jsx'
import CalendarDayModal from './components/modals/CalendarDayModal.jsx'
import StatsModal from './components/modals/StatsModal.jsx'
import KanbanBoard from './components/task/KanbanBoard.jsx'
import TaskList from './components/task/TaskList.jsx'

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
                <CircularProgress sx={{fontSize:'48px',color:'var(--primary)'}} />
                <Typography>Loading your tasks...</Typography>
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
                        <Typography variant="h4" fontWeight="bold">KTasks</Typography>
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

                    {calendarOpen && (
                        <CalendarView
                            calendarMonth={calendarMonth}
                            calendarYear={calendarYear}
                            prevMonth={prevMonth}
                            nextMonth={nextMonth}
                            MONTH_NAMES={MONTH_NAMES}
                            getDaysInMonth={getDaysInMonth}
                            getFirstDayOfMonth={getFirstDayOfMonth}
                            getTasksForDate={getTasksForDate}
                            onSelectDayTasks={setCalendarDayTasks}
                        />
                    )}

                    <CreateTaskInput
                        activeListId={activeListId}
                        taskInputRef={taskInputRef}
                        newTaskTitle={newTaskTitle}
                        setNewTaskTitle={setNewTaskTitle}
                        handleAddTask={handleAddTask}
                        templates={user?.templates}
                        addTask={addTask}
                        deleteTemplate={deleteTemplate}
                    />

                    <div className="task-items-list" style={{ display: viewMode === 'kanban' ? 'flex' : 'block', gap: '20px', overflowX: viewMode === 'kanban' ? 'auto' : 'hidden', paddingBottom: '20px' }}>
                        {viewMode === 'kanban' ? (
                            <KanbanBoard
                                sortedFilteredTasks={sortedFilteredTasks}
                                tasks={tasks}
                                selectedTaskId={selectedTaskId}
                                onSelectTask={setSelectedTaskId}
                                onDeleteTask={deleteTask}
                                getDueStatus={getDueStatus}
                                handleDragStart={handleDragStart}
                                handleDrop={handleDrop}
                                handleDragOver={handleDragOver}
                            />
                        ) : (
                            <TaskList
                                sortedFilteredTasks={sortedFilteredTasks}
                                tasks={tasks}
                                selectedTaskId={selectedTaskId}
                                onSelectTask={setSelectedTaskId}
                                onToggleTask={toggleTask}
                                onToggleImportant={toggleImportant}
                                onArchiveTask={archiveTask}
                                onDeleteTask={deleteTask}
                                getDueStatus={getDueStatus}
                                bulkSelection={bulkSelection}
                                toggleBulkSelect={toggleBulkSelect}
                            />
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
