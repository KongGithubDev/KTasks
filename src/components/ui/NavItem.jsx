export default function NavItem({ icon, label, active, onClick, actions }) {
    return (
        <div className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
            {icon || <div className="nav-dot" />}
            <span className="nav-label">{label}</span>
            {actions}
        </div>
    );
}
