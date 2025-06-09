import type { ValidationBadgeProps } from '../types/validation';

export const ValidationBadge = ({ isValid, text, ariaLabel }: ValidationBadgeProps) => (
  <div
    className={`validation-badge ${isValid ? 'success' : 'error'}`}
    role="status"
    aria-label={ariaLabel}
  >
    <span className="badge-icon" aria-hidden="true">
      {isValid ? "✓" : "!"}
    </span>
    <span className="badge-text">{text}</span>
  </div>
);