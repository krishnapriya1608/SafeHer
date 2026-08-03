import React, { useEffect, useState } from 'react';
import ContactList from './ContactList';
import ContactForm from './ContactForm';
import EmergencyButton from './EmergencyButton';
import { getContacts, addContact, editContact, deleteContact } from '../api/contactApi';

export default function TrustedContacts() {
  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const res = await getContacts();
      setContacts(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleAdd = async (form) => {
    await addContact(form);
    setShowForm(false);
    loadContacts();
  };

  const handleEdit = async (form) => {
    await editContact(editing._id, form);
    setEditing(null);
    loadContacts();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this trusted contact?')) return;
    await deleteContact(id);
    loadContacts();
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 20, fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ marginBottom: 4 }}>Trusted Contacts</h2>
      <p style={{ color: '#666', marginTop: 0, fontSize: 14 }}>
        These contacts get notified automatically if you trigger an emergency alert.
      </p>

      <div style={{ margin: '24px 0' }}>
        <EmergencyButton />
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <ContactList
          contacts={contacts}
          onEdit={(c) => {
            setEditing(c);
            setShowForm(true);
          }}
          onDelete={handleDelete}
        />
      )}

      {showForm ? (
        <div style={{ marginTop: 20 }}>
          <ContactForm
            initialData={editing}
            onSubmit={editing ? handleEdit : handleAdd}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          style={{
            marginTop: 20,
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '10px 18px',
            cursor: 'pointer',
          }}
        >
          + Add contact
        </button>
      )}
    </div>
  );
}
