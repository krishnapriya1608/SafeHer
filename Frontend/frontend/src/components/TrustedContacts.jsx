import React, { useEffect, useState } from 'react';
import ContactList from './ContactList';
import ContactForm from './ContactForm';
import EmergencyButton from './EmergencyButton';
import { contactApi } from '../api/contactApi';
// import { useAuth } from '../context/AuthContext'; // uncomment: use your existing auth context

export default function TrustedContacts({ userId: userIdProp }) {
  // const { user } = useAuth();
  // const userId = userIdProp || user?._id;
  const userId = userIdProp; // pass userId as a prop from the parent page/route, e.g. RoleDashboard

  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadContacts = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await contactApi.getContacts(userId);
      setContacts(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleAdd = async (form) => {
    await contactApi.addContact(userId, form);
    setShowForm(false);
    loadContacts();
  };

  const handleEdit = async (form) => {
    await contactApi.editContact(userId, editing._id, form);
    setEditing(null);
    loadContacts();
  };

  const handleDelete = async (contactId) => {
    if (!window.confirm('Remove this trusted contact?')) return;
    await contactApi.deleteContact(userId, contactId);
    loadContacts();
  };

  if (!userId) {
    return <p style={{ color: '#666' }}>Loading user…</p>;
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 20, fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ marginBottom: 4 }}>Trusted Contacts</h2>
      <p style={{ color: '#666', marginTop: 0, fontSize: 14 }}>
        These contacts get notified automatically if you trigger an emergency alert.
      </p>

      <div style={{ margin: '24px 0' }}>
        <EmergencyButton userId={userId} />
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
