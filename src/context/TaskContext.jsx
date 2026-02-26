import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const TaskContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const TaskProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [lists, setLists] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [activeListId, setActiveListId] = useState('important');
    const [loading, setLoading] = useState(false);
    const [authLoading, setAuthLoading] = useState(!!localStorage.getItem('token'));

    // Setup Axios defaults and fetch user on refresh
    useEffect(() => {
        const fetchUser = async () => {
            setAuthLoading(true);
            try {
                const res = await axios.get(`${API_URL}/auth/me`);
                setUser(res.data);
            } catch (err) {
                console.error('Failed to fetch user:', err);
                logout(); // Token might be invalid
            } finally {
                setAuthLoading(false);
            }
        };

        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
            if (!user) {
                fetchUser();
            } else {
                setAuthLoading(false);
            }
            fetchInitialData();
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
            setLists([]);
            setTasks([]);
            setUser(null);
            setAuthLoading(false);
        }
    }, [token]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const resLists = await axios.get(`${API_URL}/lists`);
            setLists(resLists.data);
            if (resLists.data.length > 0) {
                // Find default "My Tasks" list or first one
                const defaultList = resLists.data.find(l => l.name === 'My Tasks') || resLists.data[0];
                setActiveListId(defaultList._id);
                fetchTasks(defaultList._id);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Listen for Gamification Updates
    useEffect(() => {
        const handleUserUpdate = (e) => {
            setUser(e.detail);
        };
        window.addEventListener('user-updated', handleUserUpdate);
        return () => window.removeEventListener('user-updated', handleUserUpdate);
    }, []);

    const fetchTasks = async (listId) => {
        try {
            if (listId === 'important' || listId === 'planned' || listId === 'today') {
                const res = await axios.get(`${API_URL}/tasks`);
                setTasks(res.data);
            } else {
                const res = await axios.get(`${API_URL}/tasks/${listId}`);
                setTasks(res.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (activeListId) {
            fetchTasks(activeListId);
        }
    }, [activeListId]);

    const loginWithGoogle = async (credential) => {
        try {
            const res = await axios.post(`${API_URL}/auth/google`, { credential });
            setToken(res.data.token);
            setUser(res.data.user);
        } catch (err) {
            console.error('Login failed:', err);
            alert('เข้าสู่ระบบไม่สำเร็จ! กรุณาตรวจสอบว่า Backend Server รันอยู่หรือไม่ หรือติดต่อผู้ดูแลระบบครับ');
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    const addList = async (name) => {
        try {
            const res = await axios.post(`${API_URL}/lists`, { name });
            setLists([...lists, res.data]);
            setActiveListId(res.data._id);
            toast.success('List created successfully!');
        } catch (err) {
            console.error(err);
            toast.error('Failed to create list');
        }
    };

    const updateList = async (id, name) => {
        try {
            const res = await axios.patch(`${API_URL}/lists/${id}`, { name });
            const updatedList = { ...res.data, _id: String(res.data._id), id: String(res.data.id) };
            setLists(lists.map(l => String(l._id) === String(id) ? updatedList : l));
            toast.success('List renamed!');
        } catch (err) {
            console.error(err);
            toast.error('Failed to rename list');
        }
    };

    const deleteList = async (id) => {
        try {
            await axios.delete(`${API_URL}/lists/${id}`);
            const newLists = lists.filter(l => String(l._id) !== String(id));
            setLists(newLists);
            if (String(activeListId) === String(id)) {
                const nextList = newLists.find(l => l.name === 'My Tasks') || newLists[0] || { _id: 'important' };
                setActiveListId(nextList._id);
            }
            toast.success('List deleted');
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete list');
        }
    };

    const addTask = async (title) => {
        if (!activeListId || activeListId === 'important' || activeListId === 'planned') return;
        try {
            const res = await axios.post(`${API_URL}/tasks`, {
                listId: activeListId,
                title,
                priority: 'low'
            });
            setTasks([...tasks, res.data]);
            toast.success('Task added');
        } catch (err) {
            console.error(err);
            toast.error('Failed to add task');
        }
    };

    const toggleTask = async (taskId) => {
        const task = tasks.find(t => t._id === taskId);
        try {
            const isCompleting = !task.completed;
            const res = await axios.patch(`${API_URL}/tasks/${taskId}`, { completed: isCompleting });
            setTasks(tasks.map(t => t._id === taskId ? res.data : t));

            // Gamification XP Logic
            if (isCompleting && user) {
                const xpGain = task.priority === 'high' ? 50 : task.priority === 'medium' ? 30 : 10;
                let newXp = (user.xp || 0) + xpGain;
                let newLevel = user.level || 1;
                const xpNeeded = newLevel * 100;

                if (newXp >= xpNeeded) {
                    newLevel += 1;
                    newXp -= xpNeeded;
                    toast.success(`🎉 Level Up! You are now Level ${newLevel}!`);
                } else {
                    toast.success(`+${xpGain} XP gained!`);
                }

                const userRes = await axios.patch(`${API_URL}/auth/me`, { xp: newXp, level: newLevel }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Note: user state needs to be updated. Since we are in Context, we should have a setUser!
                // We'll dispatch a custom event or we need to add `setUser` to context state.
                window.dispatchEvent(new CustomEvent('user-updated', { detail: userRes.data }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const toggleImportant = async (taskId) => {
        const task = tasks.find(t => t._id === taskId);
        try {
            const res = await axios.patch(`${API_URL}/tasks/${taskId}`, { important: !task.important });
            setTasks(tasks.map(t => t._id === taskId ? res.data : t));
        } catch (err) {
            console.error(err);
        }
    };

    const deleteTask = async (taskId) => {
        try {
            await axios.delete(`${API_URL}/tasks/${taskId}`);
            setTasks(tasks.filter(t => t._id !== taskId));
            toast.success('Task deleted');
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete task');
        }
    };

    const setPriority = async (taskId, priority) => {
        try {
            const res = await axios.patch(`${API_URL}/tasks/${taskId}`, { priority });
            setTasks(tasks.map(t => t._id === taskId ? res.data : t));
        } catch (err) {
            console.error(err);
        }
    };

    const updateNote = async (taskId, note) => {
        try {
            const res = await axios.patch(`${API_URL}/tasks/${taskId}`, { note });
            setTasks(tasks.map(t => t._id === taskId ? res.data : t));
        } catch (err) {
            console.error(err);
        }
    };

    const updateTaskState = async (taskId, updates) => {
        try {
            const res = await axios.patch(`${API_URL}/tasks/${taskId}`, updates);
            setTasks(tasks.map(t => t._id === taskId ? res.data : t));
        } catch (err) {
            console.error(err);
        }
    };

    const addSubtask = async (taskId, title) => {
        const task = tasks.find(t => t._id === taskId);
        const newSubtasks = [...(task.subtasks || []), { title, completed: false }];
        try {
            const res = await axios.patch(`${API_URL}/tasks/${taskId}`, { subtasks: newSubtasks });
            setTasks(tasks.map(t => t._id === taskId ? res.data : t));
        } catch (err) {
            console.error(err);
        }
    };

    const toggleSubtask = async (taskId, subtaskId) => {
        const task = tasks.find(t => t._id === taskId);
        const newSubtasks = task.subtasks.map(sh =>
            sh._id === subtaskId ? { ...sh, completed: !sh.completed } : sh
        );
        try {
            const res = await axios.patch(`${API_URL}/tasks/${taskId}`, { subtasks: newSubtasks });
            setTasks(tasks.map(t => t._id === taskId ? res.data : t));
        } catch (err) {
            console.error(err);
        }
    };

    // Helper for virtual lists
    const activeTasks = activeListId === 'important'
        ? tasks.filter(t => t.important)
        : activeListId === 'planned'
            ? tasks.filter(t => t.dueDate)
            : activeListId === 'today'
                ? tasks.filter(t => {
                    if (!t.dueDate) return false;
                    const today = new Date();
                    const taskDate = new Date(t.dueDate);
                    return taskDate.toDateString() === today.toDateString();
                })
                : tasks.filter(t => t.listId === activeListId || !t.listId);

    return (
        <TaskContext.Provider value={{
            user, token, lists, activeListId, setActiveListId,
            tasks, addTask, toggleTask, toggleImportant, deleteTask,
            activeTasks, addSubtask, toggleSubtask, setPriority,
            updateNote, updateTaskState, addList, updateList, deleteList, loginWithGoogle, logout, loading, authLoading
        }}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTasks = () => useContext(TaskContext);
