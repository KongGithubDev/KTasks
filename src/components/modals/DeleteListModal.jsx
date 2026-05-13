import { Dialog, DialogContent, Box, Typography, Stack, Button } from '@mui/material'
import Delete from '@mui/icons-material/Delete'

export default function DeleteListModal({ listToDelete, onClose, onDelete }) {
    return (
        <Dialog open={!!listToDelete} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogContent sx={{ textAlign: 'center', py: 4 }}>
                <Box sx={{ background: 'rgba(255, 77, 79, 0.1)', p: 2, borderRadius: '50%', display: 'inline-flex', mb: 2 }}>
                    <Delete sx={{ fontSize: 40, color: 'error.main' }} />
                </Box>
                <Typography variant="h5" fontWeight={600} mb={1}>Delete List?</Typography>
                <Typography color="text.secondary" mb={3}>Are you sure you want to delete this list and all of its tasks? This action <strong>cannot be undone</strong>.</Typography>
                <Stack direction="row" spacing={2}>
                    <Button fullWidth variant="outlined" onClick={onClose}>Cancel</Button>
                    <Button fullWidth variant="contained" color="error" onClick={() => { onDelete(listToDelete); onClose(); }}>Yes, Delete</Button>
                </Stack>
            </DialogContent>
        </Dialog>
    )
}
