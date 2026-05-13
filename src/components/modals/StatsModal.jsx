import { Dialog, DialogContent, Stack, Typography, IconButton, Paper, Box } from '@mui/material'
import Close from '@mui/icons-material/Close'
import BarChart from '@mui/icons-material/BarChart'
import AccessTime from '@mui/icons-material/AccessTime'

export default function StatsModal({ open, onClose, stats }) {
    const maxCount = Math.max(...stats.weekData.map(d => d.count), 1)

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogContent sx={{ maxHeight: '85vh', overflowY: 'auto' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" display="flex" alignItems="center" gap={1}>
                        <BarChart sx={{ color: 'primary.main' }} /> Statistics
                    </Typography>
                    <IconButton onClick={onClose}><Close /></IconButton>
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
                        <AccessTime sx={{ color: 'primary.main' }} />
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
            </DialogContent>
        </Dialog>
    )
}
