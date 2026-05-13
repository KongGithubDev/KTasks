import { IconButton, Button, Stack, Box, Typography, Badge, TextField, FormControl, Select, MenuItem, Tooltip, InputAdornment } from '@mui/material'
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
import Star from '@mui/icons-material/Star'
import Person from '@mui/icons-material/Person'

export default function Header({
    isSidebarOpen,
    setSidebarOpen,
    activeListId,
    activeList,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    showCompleted,
    setShowCompleted,
    calendarOpen,
    setCalendarOpen,
    setStatsOpen,
    showArchived,
    setShowArchived,
    viewMode,
    setViewMode,
    theme,
    toggleTheme,
    user,
    setProfileOpen,
}) {
    return (
        <header className="main-header">
            <div className="header-left">
                <IconButton onClick={() => setSidebarOpen(!isSidebarOpen)}>
                    <Menu />
                </IconButton>
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
                            <InputAdornment position="start"><Search sx={{ fontSize: 18 }} /></InputAdornment>
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
                        {showCompleted ? <Visibility sx={{ fontSize: 20 }} /> : <VisibilityOff sx={{ fontSize: 20 }} />}
                    </IconButton>
                </Tooltip>
                <Tooltip title="Calendar">
                    <IconButton onClick={() => setCalendarOpen(!calendarOpen)}>
                        <GridView sx={{ fontSize: 20 }} />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Statistics">
                    <IconButton onClick={() => setStatsOpen(true)}>
                        <BarChart sx={{ fontSize: 20 }} />
                    </IconButton>
                </Tooltip>
                <Tooltip title={showArchived ? 'Hide archived' : 'Show archived'}>
                    <IconButton onClick={() => setShowArchived(!showArchived)}>
                        <Archive sx={{ fontSize: 20, color: showArchived ? 'primary.main' : 'inherit' }} />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Toggle View">
                    <IconButton onClick={() => setViewMode(viewMode === 'list' ? 'kanban' : 'list')}>
                        {viewMode === 'list' ? <ViewColumn sx={{ fontSize: 20 }} /> : <FormatListBulleted sx={{ fontSize: 20 }} />}
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
                        {user?.picture ? <img src={user.picture} alt="Avatar" style={{ width: 36, height: 36, borderRadius: '50%' }} /> : <Person sx={{ fontSize: 36 }} />}
                    </Badge>
                </Stack>
            </Stack>
        </header>
    )
}
