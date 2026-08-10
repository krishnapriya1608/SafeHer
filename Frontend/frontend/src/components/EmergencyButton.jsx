import React, { useState, useEffect } from 'react';
import { contactApi } from '../api/contactApi';
import { emergencyApi } from '../api/emergencyApi';
import { dashboardApi } from '../api/dashboardApi';

export default function EmergencyButton({ userId }) {
  const [status, setStatus] = useState('idle'); // idle | locating | sending | sent | partial | error
  const [contactsResult, setContactsResult] = useState(null);
  const [volunteerResult, setVolunteerResult] = useState(null);
  const [profile, setProfile] = useState(null);

  // Preload dashboard profile (phone/medicalNotes) so it's ready by the time SOS is pressed
  useEffect(() => {
    if (!userId) return;
    dashboardApi.getDashboard(userId)
      .then((res) => setProfile(res.data))
      .catch(() => setProfile(null)); // non-fatal — alert still sends without it
  }, [userId]);

  const handleTrigger = () => {
    setStatus('locating');
    setContactsResult(null);
    setVolunteerResult(null);

    if (!navigator.geolocation) {
      sendAlerts({});
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => sendAlerts({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => sendAlerts({}), // location denied/unavailable — still send the alert
      { timeout: 5000 }
    );
  };

  const sendAlerts = async (location) => {
    setStatus('sending');

    const username = localStorage.getItem('username') || 'A user';
    const email = localStorage.getItem('email') || '';

    const [contactsRes, volunteerRes] = await Promise.allSettled([
      // System B: notify trusted contacts directly
      contactApi.triggerEmergency(userId, location),

      // System A: create emergency visible to volunteers/police
      emergencyApi.createEmergency({
        userId,
        username,
        email, // required by Emergency schema
        latitude: location.lat ?? null,
        longitude: location.lng ?? null,
        message: 'SOS emergency alert triggered',
        phone: profile?.phone || '',
        medicalNotes: profile?.medicalNotes || '',
      }),
    ]);

    setContactsResult(contactsRes);
    setVolunteerResult(volunteerRes);

    const contactsOk = contactsRes.status === 'fulfilled';
    const volunteerOk = volunteerRes.status === 'fulfilled';

    if (contactsOk && volunteerOk) {
      setStatus('sent');
    } else if (contactsOk || volunteerOk) {
      setStatus('partial');
    } else {
      setStatus('error');
    }

    if (!contactsOk) console.error('Trusted contact alert failed:', contactsRes.reason);
    if (!volunteerOk) console.error('Volunteer alert failed:', volunteerRes.reason);
  };

  const notifiedCount =
    contactsResult?.status === 'fulfilled' ? contactsResult.value?.data?.notifiedCount : null;

  return (
    <div style={{ textAlign: 'center' }}>
      <button
        onClick={handleTrigger}
        disabled={status === 'locating' || status === 'sending'}
        style={{
          ...styles.button,
          background: status === 'sent' ? '#16a34a' : status === 'partial' ? '#d97706' : '#dc2626',
        }}
      >
        {status === 'idle' && 'SOS — Alert Trusted Contacts & Volunteers'}
        {status === 'locating' && 'Getting location…'}
        {status === 'sending' && 'Sending alert…'}
        {status === 'sent' && `Alert sent — ${notifiedCount ?? ''} contact(s) notified, volunteers alerted`}
        {status === 'partial' && 'Partial send — check details below'}
        {status === 'error' && 'Failed — tap to retry'}
      </button>

      {status === 'partial' && (
        <div style={{ marginTop: 8, fontSize: 13 }}>
          <p style={{ color: contactsResult?.status === 'fulfilled' ? '#16a34a' : '#c0392b', margin: 2 }}>
            Trusted contacts: {contactsResult?.status === 'fulfilled' ? 'notified' : 'failed to notify'}
          </p>
          <p style={{ color: volunteerResult?.status === 'fulfilled' ? '#16a34a' : '#c0392b', margin: 2 }}>
            Volunteers: {volunteerResult?.status === 'fulfilled' ? 'alerted' : 'failed to alert'}
          </p>
        </div>
      )}

      {status === 'error' && (
        <p style={{ color: '#c0392b', marginTop: 8, fontSize: 13 }}>
          Alert failed to send. Please call emergency services directly if this is urgent.
        </p>
      )}
    </div>
  );
}

const styles = {
  button: {
    color: '#fff',
    border: 'none',
    borderRadius: 999,
    padding: '18px 32px',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(220,38,38,0.35)',
  },
};