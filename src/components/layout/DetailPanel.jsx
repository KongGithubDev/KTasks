import { Paper, Stack, Box, Typography, IconButton, Button, TextField, Chip, FormControl, Select, MenuItem } from '@mui/material'
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

    return (
        <Paper className={`detail-panel ${selectedTaskId ? 'open' : ''}`} sx={{ position: 'fixed', top: 0, right: 0, width: 380, height: '100vh', p: 3, overflowY: 'auto', zIndex: 100, borderRadius: 0 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Task Details</Typography>
                <IconButton onClick={onClose}><ChevronRight /></IconButton>
            </Stack>

            <div className="detail-content">
                <Box mb={2}>
                    <TextField
                        fullWidth
                        variant="standard"
                        value={selectedTask.title || ""}
                        onChange={(e) => updateTaskState(selectedTask._id || selectedTask.id, { title: e.target.value })}
                        InputProps={{ style: { fontSize: '1.3rem', fontWeight: 600 } }}
                    />
                </Box>

                <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" mb={1} display="flex" alignItems="center" gap={0.5}><CalendarToday fontSize="small" /> Due Date & Time</Typography>
                    <Stack direction="row" spacing={1}>
                        <TextField type="date" size="small" fullWidth value={selectedTask.dueDate ? new Date(selectedTask.dueDate).toISOString().split('T')[0] : ''} onChange={(e) => updateTaskState(selectedTask._id || selectedTask.id, { dueDate: e.target.value })} />
                        <TextField type="time" size="small" fullWidth value={selectedTask.dueTime || ''} onChange={(e) => updateTaskState(selectedTask._id || selectedTask.id, { dueTime: e.target.value })} />
                    </Stack>
                </Box>

                <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" mb={1} display="flex" alignItems="center" gap={0.5}><CalendarToday fontSize="small" /> Recurrence</Typography>
                    <FormControl fullWidth size="small">
                        <Select value={selectedTask.recurrence || 'none'} onChange={(e) => updateTaskState(selectedTask._id || selectedTask.id, { recurrence: e.target.value })}>
                            <MenuItem value="none">Does not repeat</MenuItem>
                            <MenuItem value="daily">Daily</MenuItem>
                            <MenuItem value="weekly">Weekly</MenuItem>
                            <MenuItem value="monthly">Monthly</MenuItem>
                            <MenuItem value="yearly">Yearly</MenuItem>
                        </Select>
                    </FormControl>
                    {selectedTask.recurrence === 'weekly' && (
                        <Box mt={1.5}>
                            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Repeat on</Typography>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                                    <Button key={day} size="small" variant={selectedTask.recurrenceDayOfWeek === idx ? 'contained' : 'outlined'} onClick={() => updateTaskState(selectedTask._id || selectedTask.id, { recurrenceDayOfWeek: idx })}>{day}</Button>
                                ))}
                            </Stack>
                        </Box>
                    )}
                </Box>

                <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" mb={1}>Tags</Typography>
                    <Stack direction="row" flexWrap="wrap" gap={0.5} mb={1}>
                        {(selectedTask.tags || []).map(tag => (
                            <Chip key={tag} label={`#${tag}`} color="primary" size="small" onDelete={() => {
                                const newTags = (selectedTask.tags || []).filter(t => t !== tag);
                                updateTaskState(selectedTask._id || selectedTask.id, { tags: newTags });
                            }} />
                        ))}
                    </Stack>
                    <TextField
                        size="small"
                        fullWidth
                        placeholder="Add tag and press Enter"
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
                </Box>

                <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" mb={1} display="flex" alignItems="center" gap={0.5}><Star fontSize="small" /> Priority</Typography>
                    <Stack direction="row" spacing={1}>
                        {['low', 'medium', 'high'].map(p => (
                            <Button key={p} size="small" variant={selectedTask.priority === p ? 'contained' : 'outlined'} color={p === 'high' ? 'error' : p === 'medium' ? 'warning' : 'info'} onClick={() => setPriority(selectedTask._id || selectedTask.id, p)}>
                                {p}
                            </Button>
                        ))}
                    </Stack>
                </Box>

                <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" mb={1} display="flex" alignItems="center" gap={0.5}><Link fontSize="small" /> Blocked By</Typography>
                    <FormControl fullWidth size="small">
                        <Select value={selectedTask.blockedBy?.[0] || ''} onChange={(e) => updateTaskState(selectedTask._id || selectedTask.id, { blockedBy: e.target.value ? [e.target.value] : [] })}>
                            <MenuItem value="">None</MenuItem>
                            {activeTasks.filter(t => (t._id || t.id) !== (selectedTask._id || selectedTask.id)).map(t => (
                                <MenuItem key={t._id || t.id} value={t._id || t.id}>{t.title}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" mb={1} display="flex" alignItems="center" gap={0.5}><AccessTime fontSize="small" /> Focus Pomodoro Timer</Typography>
                    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: activeTimerTaskId === (selectedTask._id || selectedTask.id) ? '1px solid' : undefined, borderColor: 'error.light' }}>
                        {activeTimerTaskId === (selectedTask._id || selectedTask.id) ? (
                            <>
                                <Box>
                                    <Typography variant="caption" color="error" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Tracking Focus</Typography>
                                    <Typography variant="h4" fontWeight="bold" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                                        {String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:{String(timerSeconds % 60).padStart(2, '0')}
                                    </Typography>
                                </Box>
                                <Button variant="contained" color="error" onClick={handleStopTimer}>Stop Focus</Button>
                            </>
                        ) : (
                            <>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Total Time Logged</Typography>
                                    <Typography variant="h6">{Math.floor((selectedTask.timeSpent || 0) / 60)}m {(selectedTask.timeSpent || 0) % 60}s</Typography>
                                </Box>
                                <Button variant="contained" onClick={() => {
                                    if (activeTimerTaskId) handleStopTimer();
                                    setActiveTimerTaskId(selectedTask._id || selectedTask.id);
                                    setTimerSeconds(0);
                                }}>Start Focus</Button>
                            </>
                        )}
                    </Paper>
                </Box>

                <Box mb={2}>
                    {!templateFormOpen ? (
                        <Button fullWidth variant="outlined" color="primary" startIcon={<SaveIcon />} onClick={() => setTemplateFormOpen(true)}>Save as Template</Button>
                    ) : (
                        <Stack direction="row" spacing={1}>
                            <TextField autoFocus size="small" placeholder="Template name..." value={templateName} onChange={(e) => setTemplateName(e.target.value)} onKeyDown={(e) => {
                                if (e.key === 'Enter' && templateName.trim()) {
                                    addTemplate({ name: templateName.trim(), title: selectedTask.title, note: selectedTask.note, priority: selectedTask.priority, dueTime: selectedTask.dueTime, recurrence: selectedTask.recurrence, recurrenceDayOfWeek: selectedTask.recurrenceDayOfWeek, tags: selectedTask.tags, important: selectedTask.important });
                                    setTemplateName('');
                                    setTemplateFormOpen(false);
                                }
                            }} sx={{ flex: 1 }} />
                            <IconButton onClick={() => { setTemplateFormOpen(false); setTemplateName(''); }}><Close /></IconButton>
                        </Stack>
                    )}
                </Box>

                <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" mb={1} display="flex" alignItems="center" gap={0.5}><CalendarToday fontSize="small" /> Subtasks</Typography>
                    <Stack spacing={0.5} mb={1}>
                        {selectedTask.subtasks?.map(st => (
                            <Stack key={st._id || st.id} direction="row" alignItems="center" spacing={1}>
                                <IconButton size="small" onClick={() => toggleSubtask(selectedTask._id || selectedTask.id, st._id || st.id)}>
                                    {st.completed ? <CheckCircle sx={{ color: 'primary.main' }} /> : <RadioButtonUnchecked />}
                                </IconButton>
                                <Typography sx={{ textDecoration: st.completed ? 'line-through' : 'none', color: st.completed ? 'text.secondary' : 'text.primary' }}>{st.title}</Typography>
                            </Stack>
                        ))}
                        <TextField size="small" placeholder="Next step..." value={subtaskInput} onChange={(e) => setSubtaskInput(e.target.value)} onKeyDown={handleAddSubtask} />
                    </Stack>
                </Box>

                <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" mb={1}>Notes</Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Additional context..."
                        value={selectedTask.note}
                        onChange={(e) => updateNote(selectedTask._id || selectedTask.id, e.target.value)}
                    />
                </Box>
            </div>
        </Paper>
    )
}
