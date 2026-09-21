export default function TabPlaceholder({ displayName }) {
  return (
    <div className="placeholder">
      <p className="placeholder__title">{displayName}</p>
      <p className="placeholder__text">No hay datos todavía. Próximamente.</p>
    </div>
  );
}
