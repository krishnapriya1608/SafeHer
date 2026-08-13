import React, { useEffect, useState } from 'react';
import ContactList from './ContactList';
import ContactForm from './ContactForm';
import EmergencyButton from './EmergencyButton';
import { contactApi } from '../api/contactApi';
import { Link } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';

export default function TrustedContacts({ userId: userIdProp }) {
  // const { user } = useAuth();
  // const userId = userIdProp || user?._id;
  const userId = userIdProp;

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
    return (
      <div style={styles.loadingContainer}>
        <p style={{ color: '#4D5842', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
          Loading profile…
        </p>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* Google Font Embed for Editorial Typography */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Italiana&family=Montserrat:wght@300;400;500;600&family=Sacramento&display=swap');
      `}</style>

      <div style={styles.contentWrapper}>
        
        {/* TOP BAR / DASHBOARD NAVIGATION */}
        <div style={styles.topNav}>
          <Link
            to="/dashboard/user"
            className="group relative inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 shadow-sm transition-all hover:border-emerald-500/30 hover:bg-zinc-800/90 hover:text-white"
          >
            <LayoutDashboard size={14} className="text-emerald-400 transition-transform group-hover:scale-110" />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* HERO / HEADER SECTION */}
        <section style={styles.heroSection}>
          <div style={styles.heroTextContainer}>
            <div style={styles.topTag}>
              <span>SAFETY WITH PURPOSE</span>
              <span style={{ fontSize: 10 }}> ☼ </span>
              <span>CARE WITH SOUL</span>
            </div>

            <h1 style={styles.mainTitle}>SAFETY NETWORK</h1>

            <p style={styles.subtextHeading}>
              ALERT SYSTEM • TRUSTED CIRCLE • EMERGENCY READY
            </p>

            <blockquote style={styles.quoteBlock}>
              “ Building a thoughtful support system that connects, protects, and gives you peace of mind wherever you go. ”
            </blockquote>

            <span style={styles.signature}>Your Personal Support</span>
          </div>

          {/* Editorial Portrait Image */}
          <div style={styles.heroImageWrapper}>
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
              alt="Editorial Portrait"
              style={styles.heroImg}
            />
          </div>
        </section>

        {/* ORGANIC WAVED GREEN SECTION */}
        <div style={styles.waveDivider}>
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={styles.svgWave}>
            <path d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,40 L1200,120 L0,120 Z" fill="#4D5842" />
          </svg>
        </div>

        <section style={styles.aboutSection}>
          <div style={styles.aboutContent}>
            <div style={styles.leafIllustration}>🪴</div>
            <div>
              <h3 style={styles.aboutTitle}>ABOUT THIS CIRCLE —</h3>
              <p style={styles.aboutText}>
                Your trusted contacts are your immediate line of emergency response. When you trigger an alert, these individuals receive instant notifications containing your location and status.
              </p>
              <p style={styles.aboutText}>
                Keep this network updated with individuals who can respond swiftly in times of need.
              </p>
            </div>
          </div>
        </section>

        {/* EMERGENCY ACTION SECTION */}
        <section style={styles.actionSection}>
          <span style={styles.sectionCategory}>IMMEDIATE ACTION</span>
          <h2 style={styles.sectionTitle}>EMERGENCY TRIGGER</h2>
          <div style={styles.emergencyCard}>
            <EmergencyButton userId={userId} />
          </div>
        </section>

        {/* CONTACTS MANAGEMENT SECTION */}
        <section style={styles.contactsSection}>
          <span style={styles.sectionCategory}>CURRENT NETWORK</span>
          <h2 style={styles.sectionTitle}>SELECTED CONTACTS</h2>

          {loading ? (
            <p style={styles.loadingText}>Retrieving trusted network…</p>
          ) : (
            <div style={styles.contactListWrapper}>
              <ContactList
                contacts={contacts}
                onEdit={(c) => {
                  setEditing(c);
                  setShowForm(true);
                }}
                onDelete={handleDelete}
              />
            </div>
          )}

          {showForm ? (
            <div style={styles.formCard}>
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
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <button
                onClick={() => setShowForm(true)}
                style={styles.primaryBtn}
              >
                + ADD TRUSTED CONTACT
              </button>
            </div>
          )}
        </section>

        {/* BOTTOM TWO-TONE FOOTER BANNERS */}
        <footer style={styles.footerGrid}>
          {/* Terracotta Block: Process */}
          <div style={styles.terracottaCard}>
            <span style={styles.footerHeader}>MY PROCESS —</span>
            <div style={styles.processIconsGrid}>
              <div style={styles.processStep}>
                <div style={styles.iconBlob}>01</div>
                <strong>ADD</strong>
                <p style={{ margin: '4px 0 0 0' }}>Register contacts</p>
              </div>
              <div style={styles.processStep}>
                <div style={styles.iconBlob}>02</div>
                <strong>VERIFY</strong>
                <p style={{ margin: '4px 0 0 0' }}>Confirm details</p>
              </div>
              <div style={styles.processStep}>
                <div style={styles.iconBlob}>03</div>
                <strong>CONNECT</strong>
                <p style={{ margin: '4px 0 0 0' }}>Instant alerts</p>
              </div>
              <div style={styles.processStep}>
                <div style={styles.iconBlob}>04</div>
                <strong>PROTECT</strong>
                <p style={{ margin: '4px 0 0 0' }}>Peace of mind</p>
              </div>
            </div>
          </div>

          {/* Sage Block: Services */}
          <div style={styles.sageCard}>
            <span style={styles.footerHeader}>SERVICES —</span>
            <ul style={styles.servicesList}>
              <li>✦ REAL-TIME GEOLOCATION</li>
              <li>✦ AUTOMATED SMS & EMAIL</li>
              <li>✦ ONE-TAP DISPATCH</li>
              <li>✦ 24/7 NETWORK READY</li>
            </ul>
          </div>
        </footer>

      </div>
    </div>
  );
}

// Corrected Inline Styles
const styles = {
  pageContainer: {
    backgroundColor: '#EAE5D9', // Warm beige background
    color: '#2C2B29',
    fontFamily: '"Montserrat", sans-serif',
    minHeight: '100vh',
  },
  contentWrapper: {
    maxWidth: '1800px', 
    backgroundColor: '#F3EFE6', // Soft light linen card
    boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  topNav: {
    padding: '24px 48px 0 48px',
    display: 'flex',
    justifyContent: 'flex-start',
  },
  heroSection: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: 32,
    padding: '24px 48px 20px 48px',
    alignItems: 'center',
  },
  heroTextContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  topTag: {
    fontSize: 10,
    letterSpacing: '2px',
    color: '#A35232',
    fontWeight: 600,
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  mainTitle: {
    fontFamily: '"Italiana", serif',
    fontSize: 'clamp(36px, 5vw, 58px)',
    fontWeight: 400,
    color: '#4D5842',
    margin: 0,
    lineHeight: 0.95,
    letterSpacing: '2px',
  },
  subtextHeading: {
    fontSize: 10,
    letterSpacing: '2.5px',
    color: '#A35232',
    fontWeight: 600,
    marginTop: 12,
    marginBottom: 24,
  },
  quoteBlock: {
    fontSize: 14,
    lineHeight: 1.6,
    color: '#635E54',
    fontStyle: 'italic',
    margin: '0 0 16px 0',
    fontFamily: 'Georgia, serif',
  },
  signature: {
    fontFamily: '"Sacramento", cursive',
    fontSize: 32,
    color: '#A35232',
  },
  heroImageWrapper: {
    width: '100%',
    height: 380,
    borderRadius: '120px 120px 0 0',
    overflow: 'hidden',
  },
  heroImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  waveDivider: {
    marginTop: -40,
    lineHeight: 0,
  },
  svgWave: {
    width: '100%',
    height: 60,
  },
  aboutSection: {
    backgroundColor: '#4D5842',
    color: '#F3EFE6',
    padding: '10px 48px 48px 48px',
  },
  aboutContent: {
    display: 'flex',
    gap: 24,
    alignItems: 'flex-start',
  },
  leafIllustration: {
    fontSize: 40,
    lineHeight: 1,
  },
  aboutTitle: {
    fontFamily: '"Italiana", serif',
    letterSpacing: '2px',
    fontSize: 16,
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 13,
    lineHeight: 1.7,
    fontWeight: 300,
    color: '#E0DDD3',
    margin: '0 0 8px 0',
  },
  actionSection: {
    padding: '48px 48px 20px 48px',
    textAlign: 'center',
  },
  sectionCategory: {
    fontSize: 10,
    letterSpacing: '2px',
    color: '#A35232',
    fontWeight: 600,
    display: 'block',
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: '"Italiana", serif',
    fontSize: 24,
    letterSpacing: '2px',
    color: '#4D5842',
    margin: '0 0 24px 0',
    fontWeight: 400,
  },
  emergencyCard: {
    backgroundColor: '#FAF7F0',
    border: '1px solid #E2DCCE',
    padding: 24,
    display: 'inline-block',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 8px 20px rgba(163, 82, 50, 0.08)',
  },
  contactsSection: {
    padding: '20px 48px 48px 48px',
  },
  contactListWrapper: {
    backgroundColor: '#FAF7F0',
    padding: 24,
    border: '1px solid #E2DCCE',
  },
  loadingText: {
    textAlign: 'center',
    color: '#635E54',
    fontStyle: 'italic',
  },
  formCard: {
    marginTop: 24,
    backgroundColor: '#FAF7F0',
    padding: 24,
    border: '1px solid #E2DCCE',
  },
  primaryBtn: {
    backgroundColor: '#A35232',
    color: '#FFFFFF',
    border: 'none',
    padding: '14px 32px',
    fontSize: 11,
    letterSpacing: '2px',
    fontWeight: 600,
    cursor: 'pointer',
    textTransform: 'uppercase',
    transition: 'opacity 0.2s ease',
  },
  footerGrid: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr',
  },
  terracottaCard: {
    backgroundColor: '#A35232',
    color: '#FAF7F0',
    padding: 36,
  },
  sageCard: {
    backgroundColor: '#BAC2B2',
    color: '#2C2B29',
    padding: 36,
  },
  footerHeader: {
    fontSize: 12,
    letterSpacing: '2px',
    fontWeight: 600,
    display: 'block',
    marginBottom: 24,
  },
  processIconsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12,
    textAlign: 'center',
  },
  processStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontSize: 10,
  },
  iconBlob: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    marginBottom: 8,
  },
  servicesList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    fontSize: 11,
    letterSpacing: '1.5px',
    lineHeight: 2.2,
    fontWeight: 500,
  },
  loadingContainer: {
    padding: 60,
    textAlign: 'center',
  },
};