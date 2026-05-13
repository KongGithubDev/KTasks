import { Dialog, DialogContent, Stack, Typography, IconButton, Paper, Chip, Box } from '@mui/material'
import Close from '@mui/icons-material/Close'
import CheckCircle from '@mui/icons-material/CheckCircle'
import RadioButtonUnchecked from '@mui/icons-material/RadioButtonUnchecked'

export default function CalendarDayModal({ calendarDayTasks, onClose, onSelectTask, onToggleTask }) {
    return (
        <Dialog open={!!calendarDayTasks} onClose={onClose} maxWidth="sm" fullWidth>
            {calendarDayTasks && (
                <DialogContent sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">{calendarDayTasks.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Typography>
                        <IconButton onClick={onClose}><Close /></IconButton>
                    </Stack>
                    <Stack spacing={1}>
                        {calendarDayTasks.tasks.map(task => (
                            <Paper
                                key={task._id || task.id}
                                onClick={() => { onSelectTask(task._id || task.id); onClose(); }}
                                sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', opacity: task.completed ? 0.6 : 1 }}
                            >
                                <IconButton onClick={(e) => { e.stopPropagation(); onToggleTask(task._id || task.id); }}>
                                    {task.completed ? <CheckCircle sx={{ color: 'primary.main' }} /> : <RadioButtonUnchecked />}
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
    )
}
