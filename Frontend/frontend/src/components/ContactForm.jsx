import React, { useState, useEffect } from 'react';

const RELATIONSHIPS = ['parent', 'sibling', 'spouse', 'friend', 'colleague', 'guardian', 'other'];

export default function ContactForm({ initialData, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    relationship: 'friend',
    phone: '',
    email: '',
    isPrimary: false,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) setForm({ ...form, ...initialData });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!/^\+?[1-9]\d{7,14}$/.test(form.phone)) e.phone = 'Enter a valid phone number, e.g. +919876543210';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field) => (ev) => {
    const value = field === 'isPrimary' ? ev.target.checked : ev.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSubmit(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <label style={styles.label}>
        Name
        <input style={styles.input} value={form.name} onChange={handleChange('name')} placeholder="Contact's full name" />
        {errors.name && <span style={styles.error}>{errors.name}</span>}
      </label>

      <label style={styles.label}>
        Relationship
        <select style={styles.input} value={form.relationship} onChange={handleChange('relationship')}>
          {RELATIONSHIPS.map((r) => (
            <option key={r} value={r}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </option>
          ))}
        </select>
      </label>

      <label style={styles.label}>
        Phone number
        <input style={styles.input} value={form.phone} onChange={handleChange('phone')} placeholder="+919876543210" />
        {errors.phone && <span style={styles.error}>{errors.phone}</span>}
      </label>

      <label style={styles.label}>
        Email (optional)
        <input style={styles.input} value={form.email} onChange={handleChange('email')} placeholder="name@example.com" />
        {errors.email && <span style={styles.error}>{errors.email}</span>}
      </label>

      <label style={styles.checkboxLabel}>
        <input type="checkbox" checked={form.isPrimary} onChange={handleChange('isPrimary')} />
        Mark as primary contact
      </label>

      <div style={styles.actions}>
        <button type="button" onClick={onCancel} style={styles.secondaryBtn}>
          Cancel
        </button>
        <button type="submit" disabled={saving} style={styles.primaryBtn}>
          {saving ? 'Saving…' : initialData ? 'Save changes' : 'Add contact'}
        </button>
      </div>
    </form>
  );
}

const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 380 },
  label: { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, color: '#333' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#333' },
  input: { padding: '8px 10px', borderRadius: 6, border: '1px solid #ccc', fontSize: 14 },
  error: { color: '#c0392b', fontSize: 12 },
  actions: { display: 'flex', gap: 10, marginTop: 6 },
  primaryBtn: { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' },
  secondaryBtn: { background: '#eee', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' },
};
