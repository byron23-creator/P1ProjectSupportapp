import React, { useState, useEffect } from 'react';
import { ticketsApi, productsApi } from '../services/api.js';

const TICKET_TYPES = [
  'Incidente',
  'Requerimiento',
  'Consulta',
  'Problema',
  'Cambio',
];

const IMPACT_LEVELS = [
  'Crítico',
  'Alto',
  'Medio',
  'Bajo',
];

/**
 * CreateTicketModal
 * Modal form for L1 agents to create a new support ticket.
 *
 * Props:
 *   onClose   - called when the modal should be dismissed
 *   onCreated - called with the newly created Ticket entity
 */
export default function CreateTicketModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    productId:   '',
    subject:     '',
    description: '',
    type:        TICKET_TYPES[0],
    impact:      IMPACT_LEVELS[2], // default: Medio
  });

  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    productsApi
      .getAll()
      .then((data) => {
        setProducts(data);
        if (data.length > 0) {
          setForm((prev) => ({ ...prev, productId: data[0].productId }));
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingProducts(false));
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Basic client-side validation
    if (!form.productId.trim()) {
      setError('El ID del producto es requerido.');
      return;
    }
    if (!form.subject.trim()) {
      setError('El asunto es requerido.');
      return;
    }
    if (!form.description.trim()) {
      setError('La descripción es requerida.');
      return;
    }

    setLoading(true);
    try {
      const newTicket = await ticketsApi.create({
        productId:   form.productId.trim(),
        subject:     form.subject.trim(),
        description: form.description.trim(),
        type:        form.type,
        impact:      form.impact,
      });
      onCreated(newTicket);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Close on overlay click
  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title">Crear nuevo ticket</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {/* Product */}
          <div className="form-group">
            <label htmlFor="productId">Producto *</label>
            <select
              id="productId"
              name="productId"
              className="form-control"
              value={form.productId}
              onChange={handleChange}
              disabled={loadingProducts || products.length === 0}
              required
            >
              {loadingProducts && <option value="">Cargando productos…</option>}
              {!loadingProducts && products.length === 0 && (
                <option value="">No hay productos disponibles</option>
              )}
              {products.map((p) => (
                <option key={p.productId} value={p.productId}>
                  {p.productName}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div className="form-group">
            <label htmlFor="subject">Asunto *</label>
            <input
              id="subject"
              name="subject"
              type="text"
              className="form-control"
              placeholder="Describe brevemente el problema"
              value={form.subject}
              onChange={handleChange}
              maxLength={500}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Descripción *</label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              placeholder="Detalla el problema, pasos para reproducirlo, etc."
              value={form.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          {/* Type */}
          <div className="form-group">
            <label htmlFor="type">Tipo</label>
            <select
              id="type"
              name="type"
              className="form-control"
              value={form.type}
              onChange={handleChange}
            >
              {TICKET_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Impact */}
          <div className="form-group">
            <label htmlFor="impact">Impacto</label>
            <select
              id="impact"
              name="impact"
              className="form-control"
              value={form.impact}
              onChange={handleChange}
            >
              {IMPACT_LEVELS.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creando…' : 'Crear Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
