import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ticketsApi } from '../services/api.js';
import CreateTicketModal from '../components/CreateTicketModal.jsx';

/** Returns the CSS badge class for a ticket status */
function statusBadge(status) {
  if (status === 'Abierto')     return 'badge badge-open';
  if (status === 'En Progreso') return 'badge badge-progress';
  return 'badge badge-closed';
}

/** Formats an ISO date string to a readable local date */
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-GT', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tickets,     setTickets]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [showModal,   setShowModal]   = useState(false);

  const isL1 = user?.role === 'L1';

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ticketsApi.getAll();
      setTickets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  function handleTicketCreated(newTicket) {
    setShowModal(false);
    setTickets((prev) => [newTicket, ...prev]);
  }

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

      {/* ── Main content ── */}
      <div className="container">
        <div className="page-header">
          <div>
            <h2>
              {isL1
                ? 'Todos los tickets'
                : 'Tickets escalados a L2'}
            </h2>
            {!isL1 && (
              <p style={{ fontSize: '.85rem', color: 'var(--color-muted)', marginTop: '.25rem' }}>
                Solo se muestran tickets con nivel L2.
              </p>
            )}
          </div>
          {isL1 && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              + Crear Ticket
            </button>
          )}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : tickets.length === 0 ? (
          <div className="card empty-state">
            <p>No hay tickets para mostrar.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Asunto</th>
                    <th>Tipo</th>
                    <th>Impacto</th>
                    <th>Estado</th>
                    <th>Nivel</th>
                    <th>Creado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.ticketId}>
                      <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.subject}
                      </td>
                      <td>{t.type}</td>
                      <td>{t.impact}</td>
                      <td><span className={statusBadge(t.status)}>{t.status}</span></td>
                      <td>
                        <span className={`badge ${t.currentLevel === 2 ? 'badge-l2' : 'badge-l1'}`}>
                          L{t.currentLevel}
                        </span>
                      </td>
                      <td>{fmtDate(t.createdAt)}</td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => navigate(`/tickets/${t.ticketId}`)}
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Create Ticket Modal (L1 only) ── */}
      {showModal && (
        <CreateTicketModal
          onClose={() => setShowModal(false)}
          onCreated={handleTicketCreated}
        />
      )}
    </>
  );
}
