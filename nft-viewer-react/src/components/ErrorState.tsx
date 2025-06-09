interface ErrorStateProps {
  error: string;
}

export const ErrorState = ({ error }: ErrorStateProps) => (
  <p className="error" role="alert" aria-live="assertive">
    {error}
  </p>
);