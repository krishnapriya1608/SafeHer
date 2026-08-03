import React from 'react';

export default function ContactList({ contacts, onEdit, onDelete }) {
  if (contacts.length === 0) {
    return <p style={{ color: '#666' }}>No trusted contacts yet. Add one to get started.</p>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {contacts.map((c) => (
        <li key={c._id} style={styles.card}>
          <div>
            <div style={styles.nameRow}>
              <strong>{c.name}</strong>
              {c.isPrimary && <span style={styles.badge}>Primary</span>}
            </div>
            <div style={styles.meta}>
              {c.relationship} · {c.phone}
              {c.email ? ` · ${c.email}` : ''}
            </div>
          </div>
          <div style={styles.actions}>
            <button onClick={() => onEdit(c)} style={styles.linkBtn}>
              Edit
            </button>
            <button onClick={() => onDelete(c._id)} style={{ ...styles.linkBtn, color: '#c0392b' }}>
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

const styles = {
  card: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 14px',
    border: '1px solid #e5e5e5',
    borderRadius: 8,
    background: '#fff',
  },
  nameRow: { display: 'flex', alignItems: 'center', gap: 8 },
  badge: { fontSize: 11, background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: 999 },
  meta: { fontSize: 13, color: '#666', marginTop: 2 },
  actions: { display: 'flex', gap: 12 },
  linkBtn: { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: 13 },
};
