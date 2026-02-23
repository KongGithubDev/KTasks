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

    const fetchTasks = async (listId) => {
        if (listId === 'important' || listId === 'planned') {
            // For global views, we might need a different endpoint or filter locally
            // For now, let's fetch all tasks or handle it smartly
            return;
        }
        try {
            const res = await axios.get(`${API_URL}/tasks/${listId}`);
            setTasks(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (activeListId && activeListId !== 'important' && activeListId !== 'planned') {
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
        if (!window.confirm('Are you sure you want to delete this list and all its tasks?')) return;
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
            const res = await axios.patch(`${API_URL}/tasks/${taskId}`, { completed: !task.completed });
            setTasks(tasks.map(t => t._id === taskId ? res.data : t));
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
            : tasks;

    return (
        <TaskContext.Provider value={{
            user, token, lists, activeListId, setActiveListId,
            addTask, toggleTask, toggleImportant, deleteTask,
            activeTasks, addSubtask, toggleSubtask, setPriority,
            updateNote, addList, updateList, deleteList, loginWithGoogle, logout, loading, authLoading
        }}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTasks = () => useContext(TaskContext);
