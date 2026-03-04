// src/pages/admin/SessionManagement.jsx
import React from 'react';

export default function SessionManagement({
  sessions = [],
  formData,
  setFormData,
  editMode,
  setEditMode,
  currentEditId,
  setCurrentEditId,
  loading,
  handleImageUpload,
  handleSubmit,
  prepareEdit,
  handleDeleteSlot,
  showConfirm,
  showToast = () => {}, // fallback if not passed
}) {
  const handleCancelEdit = () => {
    setEditMode(false);
    setCurrentEditId(null);
    setFormData({
      mentorName: '',
      companyName: '',
      room: '',
      photoUrl: '',
      linkedinUrl: '',
      websiteUrl: '',
      focus: '',
    });
    showToast("Edit mode cancelled", "info");
  };

  return (
    <div>
      {/* Form Section */}
      <div
        style={{
          background: 'white',
          padding: '32px',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          marginBottom: '48px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '28px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.9rem', fontWeight: 700 }}>
            {editMode ? 'Edit Mentor Slot' : 'Add New Mentor Slot'}
          </h2>

          {editMode && (
            <button
              onClick={handleCancelEdit}
              style={{
                padding: '10px 20px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px' }}>
          {/* Mentor Name */}
          <div>
            <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>
              Mentor Full Name *
            </label>
            <input
              type="text"
              value={formData.mentorName || ''}
              onChange={(e) => setFormData({ ...formData, mentorName: e.target.value })}
              required
              placeholder="e.g. Deepak Kumar"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '1rem',
              }}
            />
          </div>

          {/* Company / Organization */}
          <div>
            <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>
              Company / Organization
            </label>
            <input
              type="text"
              value={formData.companyName || ''}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="e.g. xAI, Google, Freelancer"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '1rem',
              }}
            />
          </div>

          {/* Room */}
          <div>
            <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>
              Room / Session Code *
            </label>
            <input
              type="text"
              value={formData.room || ''}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              required
              placeholder="e.g. R-101, Zoom-XYZ"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '1rem',
              }}
            />
          </div>

          {/* Social Links */}
          <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                LinkedIn Profile URL
              </label>
              <input
                type="url"
                value={formData.linkedinUrl || ''}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/your-name"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '1rem',
                }}
              />
            </div>

            <div>
              <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                Personal / Company Website
              </label>
              <input
                type="url"
                value={formData.websiteUrl || ''}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                placeholder="https://yourwebsite.com"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '1rem',
                }}
              />
            </div>
          </div>

          {/* Focus / Bio */}
          <div>
            <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>
              Short Bio / Focus Area
            </label>
            <textarea
              value={formData.focus || ''}
              onChange={(e) => setFormData({ ...formData, focus: e.target.value })}
              placeholder="e.g. Helping students build real-world AI projects and prepare for tech interviews..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '1rem',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>
              Mentor Photo (optional)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img
                src={
                  formData.photoUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.mentorName || 'Mentor')}&background=0f172a&color=39ff7f&size=128`
                }
                alt="Preview"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #e5e7eb',
                }}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ padding: '8px 0' }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px 24px',
              background: editMode ? '#f59e0b' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '1.05rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '16px',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Saving...' : (editMode ? 'Update Mentor Slot' : 'Create Mentor Slot')}
          </button>
        </form>
      </div>

      {/* Existing Sessions List */}
      <h3 style={{ margin: '48px 0 24px', fontSize: '1.6rem', fontWeight: 600 }}>
        Current Mentorship Slots
      </h3>

      {sessions.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#64748b', padding: '60px 0', fontSize: '1.1rem' }}>
          No mentorship slots created yet.
        </p>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {sessions.map((session) => (
            <div
              key={session.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
                flexWrap: 'wrap',
                gap: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                <img
                  src={
                    session.photoUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(session.mentorName || 'Mentor')}&background=0f172a&color=39ff7f&size=128`
                  }
                  alt={session.mentorName}
                  style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #e5e7eb',
                  }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>
                    {session.mentorName || 'Mentor'}
                  </div>

                  {session.companyName && (
                    <div style={{ color: '#475569', fontSize: '1rem', marginTop: '4px' }}>
                      {session.companyName}
                    </div>
                  )}

                  {session.focus && (
                    <div
                      style={{
                        color: '#64748b',
                        fontSize: '0.95rem',
                        marginTop: '6px',
                        maxWidth: '400px',
                        lineHeight: '1.4',
                      }}
                    >
                      {session.focus.substring(0, 90)}
                      {session.focus.length > 90 ? '...' : ''}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                {session.linkedinUrl && (
                  <a
                    href={session.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#0a66c2', fontSize: '1.6rem' }}
                    title="LinkedIn Profile"
                  >
                    <i className="fab fa-linkedin"></i>
                  </a>
                )}

                {session.websiteUrl && (
                  <a
                    href={session.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#1e40af', fontSize: '1.6rem' }}
                    title="Website"
                  >
                    <i className="fas fa-globe"></i>
                  </a>
                )}

                <button
                  onClick={() => prepareEdit(session)}
                  style={{
                    padding: '10px 20px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDeleteSlot(session.id)}
                  style={{
                    padding: '10px 20px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}