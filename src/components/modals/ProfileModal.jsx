import { Dialog, DialogContent, Box, Typography, Stack, Chip, Paper, Button } from '@mui/material'
import Star from '@mui/icons-material/Star'
import Logout from '@mui/icons-material/Logout'

export default function ProfileModal({ open, user, onClose, onLogout }) {
    return (
        <Dialog open={open && !!user} onClose={onClose} maxWidth="xs" fullWidth>
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
                            <Star sx={{ color: '#ffd700' }} /> Achievements & Badges
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

                    <Button fullWidth variant="outlined" onClick={onLogout} startIcon={<Logout />}>Logout of KTasks</Button>
                </DialogContent>
            )}
        </Dialog>
    )
}
