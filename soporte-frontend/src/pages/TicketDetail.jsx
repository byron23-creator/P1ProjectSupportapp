import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ticketsApi, commentsApi } from '../services/api.js';

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-GT', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function StatusBadge({ status }) {
  const cls =
    status === 'Abierto'     ? 'badge badge-open'     :
    status === 'En Progreso' ? 'badge badge-progress'  :
                               'badge badge-closed';
  return <span className={cls}>{status}</span>;
}

function LevelBadge({ level }) {
  return (
    <span className={`badge ${level === 2 ? 'badge-l2' : 'badge-l1'}`}>
      L{level}
    </span>
  );
}

export default function TicketDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { user, logout } = useAuth();

  const isL1 = user?.role === 'L1';

  const [ticket,   setTicket]   = useState(null);
  const [comments, setComments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [actionMsg, setActionMsg] = useState('');

  // Comment form state
  const [commentText, setCommentText] = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [commentErr,  setCommentErr]  = useState('');
  const textareaRef = useRef(null);

  // ── Fetch ticket + comments ──────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [t, c] = await Promise.all([
        ticketsApi.getById(id),
        commentsApi.getByTicket(id),
      ]);
      setTicket(t);
      setComments(c);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Actions ──────────────────────────────────────────────────────────────
  async function handleEscalar() {
    if (!window.confirm('¿Escalar este ticket a L2?')) return;
    setActionMsg('');
    try {
      const updated = await ticketsApi.escalar(id);
      setTicket(updated);
      setActionMsg('Ticket escalado a L2 correctamente.');
    } catch (err) {
      setActionMsg(`Error: ${err.message}`);
    }
  }

  async function handleCerrar() {
    if (!window.confirm('¿Cerrar este ticket?')) return;
    setActionMsg('');
    try {
      const updated = await ticketsApi.cerrar(id);
      setTicket(updated);
      setActionMsg('Ticket cerrado correctamente.');
    } catch (err) {
      setActionMsg(`Error: ${err.message}`);
    }
  }

  async function handleDownloadPdf() {
    try {
      const blob = await ticketsApi.downloadPdf(id);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `ticket-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setActionMsg(`Error al generar PDF: ${err.message}`);
    }
  }

  // ── Add comment ──────────────────────────────────────────────────────────
  async function handleAddComment(e) {
    e.preventDefault();
    setCommentErr('');
    if (!commentText.trim()) {
      setCommentErr('El comentario no puede estar vacío.');
      return;
    }
    setSubmitting(true);
    try {
      const newComment = await commentsApi.create(id, commentText.trim());
      // Enrich with current user info for immediate display
      setComments((prev) => [
        ...prev,
        {
          ...newComment,
          authorName: user?.fullName || user?.full_name || 'Tú',
          authorRole: user?.role,
        },
      ]);
      setCommentText('');
      textareaRef.current?.focus();
    } catch (err) {
      setCommentErr(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────
  const isClosed = ticket?.status === 'Cerrado';

  return (
    <>
      {/* ── Navbar ── */}
      <nav className="navbar">
        <span className="navbar__brand">🛠 Micro-Soporte</span>
        <div className="navbar__user">
          <span>{user?.fullName || user?.full_name}</span>
          <span className="navbar__role">{user?.role}</span>
          <button className="btn btn-sm btn-logout" onClick={logout}>Cerrar sesión</button>
        </div>
      </nav>

      <div className="container ticket-detail">
        {/* Back link */}
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: '1rem' }}
          onClick={() => navigate('/dashboard')}
        >
          ← Volver al Dashboard
        </button>

        {loading && <div className="spinner-wrap"><div className="spinner" /></div>}
        {error   && <div className="alert alert-error">{error}</div>}

        {ticket && (
          <>
            {/* ── Ticket Info Card ── */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '.75rem' }}>{ticket.subject}</h2>

              <div className="ticket-meta">
                <StatusBadge status={ticket.status} />
                <LevelBadge  level={ticket.currentLevel} />
                <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>
                  {ticket.type}
                </span>
                <span className="badge" style={{ background: '#fef9c3', color: '#713f12' }}>
                  Impacto: {ticket.impact}
                </span>
              </div>

              <p style={{ color: 'var(--color-muted)', fontSize: '.8rem', marginBottom: '1rem' }}>
                Creado: {fmtDate(ticket.createdAt)}
              </p>

              <p style={{ lineHeight: 1.7 }}>{ticket.description}</p>

              {/* ── Action buttons ── */}
              {actionMsg && (
                <div className={`alert ${actionMsg.startsWith('Error') ? 'alert-error' : 'alert-success'}`}
                     style={{ marginTop: '1rem' }}>
                  {actionMsg}
                </div>
              )}

              <div className="ticket-actions">
                {/* Escalar: only L1, only if not already L2 and not closed */}
                {isL1 && ticket.currentLevel === 1 && !isClosed && (
                  <button className="btn btn-warning" onClick={handleEscalar}>
                    ⬆ Escalar a L2
                  </button>
                )}

                {/* Cerrar: L1 or L2, only if not already closed */}
                {!isClosed && (
                  <button className="btn btn-danger" onClick={handleCerrar}>
                    ✕ Cerrar Ticket
                  </button>
                )}

                {/* PDF download: always available */}
                <button className="btn btn-ghost" onClick={handleDownloadPdf}>
                  ⬇ Descargar PDF
                </button>
              </div>
            </div>

            {/* ── Comments Section ── */}
            <div className="card comments-section">
              <h3>💬 Comentarios ({comments.length})</h3>

              {comments.length === 0 ? (
                <p style={{ color: 'var(--color-muted)', fontSize: '.875rem', marginBottom: '1rem' }}>
                  Aún no hay comentarios. ¡Sé el primero!
                </p>
              ) : (
                <div className="comment-list">
                  {comments.map((c) => (
                    <div key={c.commentId} className="comment-item">
                      <div className="comment-header">
                        <span className="comment-author">{c.authorName}</span>
                        <span className={`badge ${c.authorRole === 'L2' ? 'badge-l2' : 'badge-l1'}`}>
                          {c.authorRole}
                        </span>
                        <span>·</span>
                        <span>{fmtDate(c.createdAt)}</span>
                      </div>
                      <p className="comment-content">{c.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add comment form — disabled if ticket is closed */}
              {isClosed ? (
                <p style={{ color: 'var(--color-muted)', fontSize: '.85rem', fontStyle: 'italic' }}>
                  Este ticket está cerrado. No se pueden agregar más comentarios.
                </p>
              ) : (
                <form onSubmit={handleAddComment}>
                  {commentErr && <div className="alert alert-error">{commentErr}</div>}
                  <div className="comment-form">
                    <textarea
                      ref={textareaRef}
                      className="form-control"
                      rows={3}
                      placeholder="Escribe un comentario…"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      disabled={submitting}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={submitting}
                      style={{ alignSelf: 'flex-end' }}
                    >
                      {submitting ? 'Enviando…' : 'Comentar'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
