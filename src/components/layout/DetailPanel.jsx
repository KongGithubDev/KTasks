import { Paper, Stack, Box, Typography, IconButton, Button, TextField, Chip, FormControl, Select, MenuItem, Divider, InputAdornment, ToggleButton, ToggleButtonGroup } from '@mui/material'
import ChevronRight from '@mui/icons-material/ChevronRight'
import CalendarToday from '@mui/icons-material/CalendarToday'
import Star from '@mui/icons-material/Star'
import Link from '@mui/icons-material/Link'
import AccessTime from '@mui/icons-material/AccessTime'
import SaveIcon from '@mui/icons-material/Save'
import Close from '@mui/icons-material/Close'
import CheckCircle from '@mui/icons-material/CheckCircle'
import RadioButtonUnchecked from '@mui/icons-material/RadioButtonUnchecked'

export default function DetailPanel({
    selectedTask,
    selectedTaskId,
    onClose,
    updateTaskState,
    activeTimerTaskId,
    timerSeconds,
    handleStopTimer,
    setActiveTimerTaskId,
    setTimerSeconds,
    setPriority,
    activeTasks,
    templateFormOpen,
    setTemplateFormOpen,
    templateName,
    setTemplateName,
    addTemplate,
    subtaskInput,
    setSubtaskInput,
    addSubtask,
    toggleSubtask,
    handleAddSubtask,
    updateNote,
}) {
    if (!selectedTask) return null

    const Section = ({ icon: Icon, title, children }) => (
        <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.75, fontWeight: 600 }}>
                {Icon && <Icon fontSize="small" />}
                {title}
            </Typography>
            {children}
        </Paper>
    )

    return (
        <Paper className={`detail-panel ${selectedTaskId ? 'open' : ''}`} sx={{ position: 'fixed', top: 0, right: 0, width: 400, height: '100vh', p: 2.5, overflowY: 'auto', zIndex: 1200, borderRadius: 0, borderLeft: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight={700}>Task Details</Typography>
                <IconButton onClick={onClose} sx={{ borderRadius: 2 }}><ChevronRight /></IconButton>
            </Stack>

            <TextField
                fullWidth
                variant="outlined"
                value={selectedTask.title || ''}
                onChange={(e) => updateTaskState(selectedTask._id || selectedTask.id, { title: e.target.value })}
                sx={{ mb: 2, '& .MuiInputBase-input': { fontSize: '1.25rem', fontWeight: 600 } }}
            />

            <Section icon={CalendarToday} title="Due Date & Time">
                <Stack direction="row" spacing={1.5}>
                    <TextField
                        type="date"
                        size="small"
                        fullWidth
                        label="Date"
                        InputLabelProps={{ shrink: true }}
                        value={selectedTask.dueDate ? new Date(selectedTask.dueDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => updateTaskState(selectedTask._id || selectedTask.id, { dueDate: e.target.value })}
                    />
                    <TextField
                        type="time"
                        size="small"
                        fullWidth
                        label="Time"
                        InputLabelProps={{ shrink: true }}
                        value={selectedTask.dueTime || ''}
                        onChange={(e) => updateTaskState(selectedTask._id || selectedTask.id, { dueTime: e.target.value })}
                    />
                </Stack>
            </Section>

            <Section icon={CalendarToday} title="Recurrence">
                <FormControl fullWidth size="small">
                    <Select
                        value={selectedTask.recurrence || 'none'}
                        onChange={(e) => updateTaskState(selectedTask._id || selectedTask.id, { recurrence: e.target.value })}
                        displayEmpty
                    >
                        <MenuItem value="none">Does not repeat</MenuItem>
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                        <MenuItem value="yearly">Yearly</MenuItem>
                    </Select>
                </FormControl>
                {selectedTask.recurrence === 'weekly' && (
                    <Box mt={2}>
                        <Typography variant="caption" color="text.secondary" display="block" mb={1} fontWeight={500}>Repeat on</Typography>
                        <ToggleButtonGroup
                            size="small"
                            value={selectedTask.recurrenceDayOfWeek ?? null}
                            exclusive
                            onChange={(_, val) => val !== null && updateTaskState(selectedTask._id || selectedTask.id, { recurrenceDayOfWeek: val })}
                        >
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                                <ToggleButton key={day} value={idx} sx={{ minWidth: 40, px: 1 }}>{day}</ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </Box>
                )}
            </Section>

            <Section title="Tags">
                <Stack direction="row" flexWrap="wrap" gap={0.75} mb={1.5}>
                    {(selectedTask.tags || []).map(tag => (
                        <Chip
                            key={tag}
                            label={`#${tag}`}
                            color="primary"
                            size="small"
                            variant="outlined"
                            onDelete={() => {
                                const newTags = (selectedTask.tags || []).filter(t => t !== tag);
                                updateTaskState(selectedTask._id || selectedTask.id, { tags: newTags });
                            }}
                            sx={{ borderRadius: 2 }}
                        />
                    ))}
                </Stack>
                <TextField
                    size="small"
                    fullWidth
                    placeholder="Add tag and press Enter"
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><Typography color="text.secondary">#</Typography></InputAdornment>,
                    }}
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
                />
            </Section>

            <Section icon={Star} title="Priority">
                <ToggleButtonGroup
                    fullWidth
                    size="small"
                    value={selectedTask.priority || 'low'}
                    exclusive
                    onChange={(_, val) => val && setPriority(selectedTask._id || selectedTask.id, val)}
                >
                    <ToggleButton value="low" color="info">low</ToggleButton>
                    <ToggleButton value="medium" color="warning">medium</ToggleButton>
                    <ToggleButton value="high" color="error">high</ToggleButton>
                </ToggleButtonGroup>
            </Section>

            <Section icon={Link} title="Blocked By">
                <FormControl fullWidth size="small">
                    <Select
                        value={selectedTask.blockedBy?.[0] || ''}
                        onChange={(e) => updateTaskState(selectedTask._id || selectedTask.id, { blockedBy: e.target.value ? [e.target.value] : [] })}
                        displayEmpty
                    >
                        <MenuItem value="">None</MenuItem>
                        {activeTasks.filter(t => (t._id || t.id) !== (selectedTask._id || selectedTask.id)).map(t => (
                            <MenuItem key={t._id || t.id} value={t._id || t.id}>{t.title}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Section>

            <Section icon={AccessTime} title="Focus Pomodoro Timer">
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, borderColor: activeTimerTaskId === (selectedTask._id || selectedTask.id) ? 'error.light' : 'divider' }}>
                    {activeTimerTaskId === (selectedTask._id || selectedTask.id) ? (
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Box>
                                <Typography variant="caption" color="error" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Tracking Focus</Typography>
                                <Typography variant="h4" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}>
                                    {String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:{String(timerSeconds % 60).padStart(2, '0')}
                                </Typography>
                            </Box>
                            <Button variant="contained" color="error" size="small" onClick={handleStopTimer}>Stop Focus</Button>
                        </Stack>
                    ) : (
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Box>
                                <Typography variant="caption" color="text.secondary">Total Time Logged</Typography>
                                <Typography variant="h6" fontWeight={600}>{Math.floor((selectedTask.timeSpent || 0) / 60)}m {(selectedTask.timeSpent || 0) % 60}s</Typography>
                            </Box>
                            <Button variant="contained" size="small" onClick={() => {
                                if (activeTimerTaskId) handleStopTimer();
                                setActiveTimerTaskId(selectedTask._id || selectedTask.id);
                                setTimerSeconds(0);
                            }}>Start Focus</Button>
                        </Stack>
                    )}
                </Paper>
            </Section>

            <Box mb={2}>
                {!templateFormOpen ? (
                    <Button fullWidth variant="outlined" startIcon={<SaveIcon />} onClick={() => setTemplateFormOpen(true)} sx={{ borderRadius: 3, py: 1 }}>
                        Save as Template
                    </Button>
                ) : (
                    <Stack direction="row" spacing={1}>
                        <TextField
                            autoFocus
                            size="small"
                            placeholder="Template name..."
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && templateName.trim()) {
                                    addTemplate({ name: templateName.trim(), title: selectedTask.title, note: selectedTask.note, priority: selectedTask.priority, dueTime: selectedTask.dueTime, recurrence: selectedTask.recurrence, recurrenceDayOfWeek: selectedTask.recurrenceDayOfWeek, tags: selectedTask.tags, important: selectedTask.important });
                                    setTemplateName('');
                                    setTemplateFormOpen(false);
                                }
                            }}
                            sx={{ flex: 1 }}
                        />
                        <IconButton onClick={() => { setTemplateFormOpen(false); setTemplateName(''); }} sx={{ borderRadius: 2 }}>
                            <Close />
                        </IconButton>
                    </Stack>
                )}
            </Box>

            <Section icon={CalendarToday} title="Subtasks">
                <Stack spacing={0.75} mb={1.5}>
                    {selectedTask.subtasks?.map(st => (
                        <Stack key={st._id || st.id} direction="row" alignItems="center" spacing={1} sx={{ py: 0.5, px: 1, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                            <IconButton size="small" onClick={() => toggleSubtask(selectedTask._id || selectedTask.id, st._id || st.id)}>
                                {st.completed ? <CheckCircle color="primary" fontSize="small" /> : <RadioButtonUnchecked fontSize="small" />}
                            </IconButton>
                            <Typography variant="body2" sx={{ textDecoration: st.completed ? 'line-through' : 'none', color: st.completed ? 'text.secondary' : 'text.primary', flex: 1 }}>
                                {st.title}
                            </Typography>
                        </Stack>
                    ))}
                </Stack>
                <TextField
                    size="small"
                    fullWidth
                    placeholder="Next step..."
                    value={subtaskInput}
                    onChange={(e) => setSubtaskInput(e.target.value)}
                    onKeyDown={handleAddSubtask}
                />
            </Section>

            <Section title="Notes">
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Additional context..."
                    value={selectedTask.note || ''}
                    onChange={(e) => updateNote(selectedTask._id || selectedTask.id, e.target.value)}
                />
            </Section>
        </Paper>
    )
}
