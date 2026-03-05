import { useState, useRef, useEffect } from 'react';
import { CreateTicketPayload, TicketPriority } from '@/types';
import styles from './CreateTicketModal.module.css';

interface FormErrors {
  title?:       string;
  client?:      string;
  description?: string;
}

interface CreateTicketModalProps {
  onClose:  () => void;
  onSubmit: (payload: CreateTicketPayload) => Promise<void>;
}

const INITIAL_FORM: CreateTicketPayload = {
  title:       '',
  client:      '',
  description: '',
  priority:    'medium',
};

export function CreateTicketModal({ onClose, onSubmit }: CreateTicketModalProps) {
  const [form, setForm]           = useState<CreateTicketPayload>(INITIAL_FORM);
  const [errors, setErrors]       = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus first input on mount
  useEffect(() => { firstInputRef.current?.focus(); }, []);

  // Close on Escape key
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  function setField<K extends keyof CreateTicketPayload>(key: K, value: CreateTicketPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.title.trim())       e.title       = 'Título é obrigatório';
    if (!form.client.trim())      e.client      = 'Cliente é obrigatório';
    if (!form.description.trim()) e.description = 'Descrição é obrigatória';
    return e;
  }

  async function handleSubmit() {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.title} id="modal-title">// novo chamado</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar modal">×</button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Title */}
          <Field label="Título" required error={errors.title}>
            <input
              ref={firstInputRef}
              id="field-title"
              className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
              placeholder="Descreva o problema em uma linha"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
            />
          </Field>

          <div className={styles.row}>
            {/* Client */}
            <Field label="Cliente" required error={errors.client}>
              <input
                id="field-client"
                className={`${styles.input} ${errors.client ? styles.inputError : ''}`}
                placeholder="Nome do cliente"
                value={form.client}
                onChange={(e) => setField('client', e.target.value)}
              />
            </Field>

            {/* Priority */}
            <Field label="Prioridade" required>
              <select
                id="field-priority"
                className={styles.select}
                value={form.priority}
                onChange={(e) => setField('priority', e.target.value as TicketPriority)}
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </Field>
          </div>

          {/* Description */}
          <Field label="Descrição" required error={errors.description}>
            <textarea
              id="field-description"
              className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
              placeholder="Detalhe o problema, contexto e impacto"
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
            />
          </Field>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.btnGhost} onClick={onClose} disabled={submitting}>
            Cancelar
          </button>
          <button className={styles.btnSubmit} onClick={handleSubmit} disabled={submitting}>
            {submitting
              ? <><Spinner /> Criando…</>
              : 'Criar chamado'
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────
function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>
        {label} {required && <span aria-hidden="true">*</span>}
      </label>
      {children}
      {error && <span className={styles.fieldError} role="alert">{error}</span>}
    </div>
  );
}

function Spinner() {
  return (
    <span
      style={{ display:'inline-block', width:12, height:12, border:'1.5px solid currentColor',
               borderTopColor:'transparent', borderRadius:'50%', animation:'spin .8s linear infinite' }}
      aria-hidden="true"
    />
  );
}
