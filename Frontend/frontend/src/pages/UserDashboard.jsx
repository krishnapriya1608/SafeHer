// UserDashboard.jsx
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/dashboard";

export default function UserDashboard() {
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    notes: ""
  });

  const [contacts, setContacts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [status, setStatus] = useState("Safe");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();

    setProfile(data.profile);
    setContacts(data.contacts);
    setAlerts(data.alerts);
    setStatus(data.status);
  };

  const saveProfile = async () => {
    await fetch(`${API_URL}/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile)
    });

    alert("Profile updated successfully");
  };

  const addContact = async () => {
    const newContact = {
      name: "New Contact",
      relation: "Emergency Contact",
      phone: "+91 90000 00000"
    };

    const res = await fetch(`${API_URL}/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newContact)
    });

    const data = await res.json();
    setContacts(data.contacts);
  };

  const deleteContact = async (contactId) => {
    const res = await fetch(`${API_URL}/contacts/${contactId}`, {
      method: "DELETE"
    });

    const data = await res.json();
    setContacts(data.contacts);
  };

  const updateStatus = async (nextStatus) => {
    const res = await fetch(`${API_URL}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus })
    });

    const data = await res.json();
    setStatus(data.status);
    setAlerts(data.alerts);
  };

  return (
    <div>
      <h1>User Dashboard</h1>

      <section>
        <h2>Edit Profile</h2>

        <input
          value={profile.fullName}
          placeholder="Full Name"
          onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
        />

        <input
          value={profile.email}
          placeholder="Email"
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
        />

        <input
          value={profile.phone}
          placeholder="Phone"
          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
        />

        <input
          value={profile.location}
          placeholder="Location"
          onChange={(e) => setProfile({ ...profile, location: e.target.value })}
        />

        <textarea
          value={profile.notes}
          placeholder="Medical Notes"
          onChange={(e) => setProfile({ ...profile, notes: e.target.value })}
        />

        <button onClick={saveProfile}>Save Profile</button>
      </section>

      <section>
        <h2>Current Status: {status}</h2>

        <button onClick={() => updateStatus("Safe")}>Safe</button>
        <button onClick={() => updateStatus("Need Help")}>Need Help</button>
        <button onClick={() => updateStatus("Emergency")}>Emergency</button>
      </section>

      <section>
        <h2>Emergency Contacts</h2>
        <button onClick={addContact}>Add Contact</button>

        {contacts.map((contact) => (
          <div key={contact._id}>
            <strong>{contact.name}</strong>
            <p>{contact.relation} - {contact.phone}</p>
            <button onClick={() => deleteContact(contact._id)}>Delete</button>
          </div>
        ))}
      </section>

      <section>
        <h2>Recent Alerts</h2>

        {alerts.map((alert, index) => (
          <div key={index}>
            <strong>{alert.title}</strong>
            <p>{alert.detail}</p>
            <small>{alert.level}</small>
          </div>
        ))}
      </section>
    </div>
  );
}