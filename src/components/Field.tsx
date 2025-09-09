interface FieldProps {
  label: string;
  helperText?: string;
  children: React.ReactNode;
  tooltip?: string;
  className?: string;
}

export const Field = ({ label, children, tooltip, helperText, className }: FieldProps) => {
  return (
    <div className={`flex flex-col gap-1 ${className || ""}`}>
      <label className="text-dark text-sm">{label}</label>
      {children}
      {helperText && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
};
