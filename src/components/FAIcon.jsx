// Font Awesome Icon wrapper component
// Requires Font Awesome Pro CSS loaded via CDN in index.html
export default function FAIcon({ name, solid = true, regular = false, duotone = false, light = false, style = {}, className = '' }) {
    const prefix = duotone ? 'fa-duotone' : light ? 'fa-light' : regular ? 'fa-regular' : 'fa-solid';
    const classes = `${prefix} fa-${name} ${className}`.trim();
    return <i className={classes} style={style} />;
}
