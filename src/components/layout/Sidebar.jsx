import { Paper, TextField, Button, Stack, IconButton, Tooltip } from '@mui/material'
import Star from '@mui/icons-material/Star'
import WbSunny from '@mui/icons-material/WbSunny'
import CalendarToday from '@mui/icons-material/CalendarToday'
import Add from '@mui/icons-material/Add'
import ChevronRight from '@mui/icons-material/ChevronRight'
import Delete from '@mui/icons-material/Delete'
import NavItem from '../ui/NavItem.jsx'

export default function Sidebar({
    isSidebarOpen,
    isMobile,
    setSidebarOpen,
    activeListId,
    setActiveListId,
    lists,
    editingListId,
    setEditingListId,
    editListTitle,
    setEditListTitle,
    handleUpdateList,
    isCreatingList,
    setIsCreatingList,
    newListTitle,
    setNewListTitle,
    handleAddList,
    setListToDelete,
    addList,
}) {
    return (
        <aside className={`sidebar glass ${isSidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="logo">
                    <img src="/logo.png" alt="KTasks" className="sidebar-logo" />
                    <span>KTasks</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <NavItem icon={<Star sx={{ fontSize: '22px' }} />} label="Important" active={activeListId === 'important'} onClick={() => setActiveListId('important')} />
                <NavItem icon={<WbSunny sx={{ fontSize: '22px' }} />} label="Today" active={activeListId === 'today'} onClick={() => setActiveListId('today')} />
                <NavItem icon={<CalendarToday sx={{ fontSize: '22px' }} />} label="Planned" active={activeListId === 'planned'} onClick={() => setActiveListId('planned')} />

                <div className="nav-divider"></div>

                <div className="nav-section">
                    <header>My Lists</header>
                    {lists.map(list => {
                        const listId = String(list._id || list.id);
                        return (
                            <div key={listId} className="nav-item-wrapper">
                                {String(editingListId) === listId ? (
                                    <div className="nav-item editing">
                                        <Add sx={{ fontSize: '22px' }} className="rotate-45" />
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
                                            <Stack direction="row" spacing={0.5}>
                                                <Tooltip title="Edit list">
                                                    <IconButton size="small" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingListId(listId); setEditListTitle(list.name); }}>
                                                        <ChevronRight sx={{ fontSize: 14 }} className="rotate-90" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete list">
                                                    <IconButton size="small" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setListToDelete(listId); }}>
                                                        <Delete sx={{ fontSize: 14 }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        }
                                    />
                                )}
                            </div>
                        );
                    })}
                    {isCreatingList && (
                        <Paper sx={{ p: 2, mb: 1 }}>
                            <TextField
                                autoFocus
                                fullWidth
                                size="small"
                                placeholder="Enter list name..."
                                value={newListTitle}
                                onChange={(e) => setNewListTitle(e.target.value)}
                                onKeyDown={handleAddList}
                                sx={{ mb: 1 }}
                            />
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <Button size="small" variant="outlined" onClick={() => setIsCreatingList(false)}>Cancel</Button>
                                <Button size="small" variant="contained" onClick={() => {
                                    if (newListTitle.trim()) {
                                        addList(newListTitle);
                                        setNewListTitle('');
                                        setIsCreatingList(false);
                                    }
                                }}>Add List</Button>
                            </Stack>
                        </Paper>
                    )}
                </div>
            </nav>

            {!isCreatingList && (
                <Button fullWidth variant="text" startIcon={<Add />} onClick={() => setIsCreatingList(true)} sx={{ justifyContent: 'flex-start', px: 2 }}>
                    Create New List
                </Button>
            )}

            <div className="sidebar-footer">
                <div className="developer-credit">
                    <span className="label">Developed by</span>
                    <span className="name">Watcharapong Namsaeng</span>
                </div>
            </div>
        </aside>
    )
}
