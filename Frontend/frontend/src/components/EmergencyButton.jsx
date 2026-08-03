import React, { useState } from 'react';
import { triggerEmergency } from '../api/contactApi';

export default function EmergencyButton() {
  const [status, setStatus] = useState('idle'); // idle | locating | sending | sent | error
  const [report, setReport] = useState(null);

  const handleTrigger = () => {
    setStatus('locating');
    setReport(null);

    if (!navigator.geolocation) {
      sendAlert({});
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => sendAlert({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => sendAlert({}), // location denied/unavailable — still send the alert
      { timeout: 5000 }
    );
  };

  const sendAlert = async (location) => {
    setStatus('sending');
    try {
      const res = await triggerEmergency(location);
      setReport(res);
      setStatus('sent');
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <button
        onClick={handleTrigger}
        disabled={status === 'locating' || status === 'sending'}
        style={{
          ...styles.button,
          background: status === 'sent' ? '#16a34a' : '#dc2626',
        }}
      >
        {status === 'idle' && 'SOS — Alert Trusted Contacts'}
        {status === 'locating' && 'Getting location…'}
        {status === 'sending' && 'Sending alert…'}
        {status === 'sent' && `Alert sent to ${report?.notifiedCount ?? ''} contact(s)`}
        {status === 'error' && 'Failed — tap to retry'}
      </button>
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
