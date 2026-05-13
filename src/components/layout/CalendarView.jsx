import { Box, Typography, IconButton } from '@mui/material'
import ChevronLeft from '@mui/icons-material/ChevronLeft'
import ChevronRight from '@mui/icons-material/ChevronRight'

export default function CalendarView({
    calendarMonth,
    calendarYear,
    prevMonth,
    nextMonth,
    MONTH_NAMES,
    getDaysInMonth,
    getFirstDayOfMonth,
    getTasksForDate,
    onSelectDayTasks,
}) {
    return (
        <div className="calendar-wrapper glass" style={{ padding: '16px', borderRadius: '16px', marginBottom: '16px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={prevMonth}><ChevronLeft /></IconButton>
                <Typography variant="h6">{MONTH_NAMES[calendarMonth]} {calendarYear}</Typography>
                <IconButton onClick={nextMonth}><ChevronRight /></IconButton>
            </Box>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', padding: '8px 0' }}>{d}</div>
                ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {Array.from({ length: getFirstDayOfMonth(calendarYear, calendarMonth) }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: getDaysInMonth(calendarYear, calendarMonth) }).map((_, i) => {
                    const day = i + 1;
                    const date = new Date(calendarYear, calendarMonth, day);
                    const dayTasks = getTasksForDate(date);
                    const isToday = new Date().toDateString() === date.toDateString();
                    return (
                        <button
                            key={day}
                            onClick={() => dayTasks.length > 0 && onSelectDayTasks({ date, tasks: dayTasks })}
                            style={{
                                aspectRatio: '1',
                                borderRadius: '8px',
                                border: isToday ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                background: isToday ? 'var(--primary-light)' : 'var(--glass-bg)',
                                color: 'var(--text-primary)',
                                cursor: dayTasks.length > 0 ? 'pointer' : 'default',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                                padding: '4px',
                                position: 'relative'
                            }}
                        >
                            <span style={{ fontSize: '0.9rem', fontWeight: isToday ? 'bold' : 'normal' }}>{day}</span>
                            {dayTasks.length > 0 && (
                                <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                    {dayTasks.slice(0, 3).map((t, idx) => (
                                        <div key={idx} style={{
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            background: t.completed ? '#52c41a' : t.priority === 'high' ? '#ff4d4f' : t.priority === 'medium' ? '#ff8c00' : 'var(--primary)'
                                        }} />
                                    ))}
                                    {dayTasks.length > 3 && <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>+{dayTasks.length - 3}</span>}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    )
}
