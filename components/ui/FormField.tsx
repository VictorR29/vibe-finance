import React from 'react';
import { cn } from '../../utils/cn';

type FormFieldProps = {
  label: string;
  error?: string;
} & (
  | ({
      type: 'text' | 'number' | 'date' | 'email' | 'password';
      value: string | number;
      onChange: (value: string) => void;
    } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>)
  | ({ type: 'textarea'; value: string; onChange: (value: string) => void } & Omit<
      React.TextareaHTMLAttributes<HTMLTextAreaElement>,
      'onChange'
    >)
  | ({
      type: 'select';
      value: string;
      onChange: (value: string) => void;
      options: { value: string; label: string }[];
    } & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'>)
  | ({ type: 'checkbox'; checked: boolean; onChange: (checked: boolean) => void } & Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      'onChange' | 'checked'
    >)
);

export const FormField: React.FC<FormFieldProps> = props => {
  const { label, error } = props;

  const baseInputClasses =
    'block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white dark:placeholder-neutral-400';
  const errorClasses = 'border-error focus:ring-error focus:border-error';

  const renderInput = () => {
    switch (props.type) {
      case 'text':
      case 'number':
      case 'date':
      case 'email':
      case 'password':
        return (
          <input
            {...props}
            onChange={e => props.onChange(e.target.value)}
            className={cn(baseInputClasses, error && errorClasses)}
          />
        );
      case 'textarea':
        return (
          <textarea
            {...props}
            onChange={e => props.onChange(e.target.value)}
            className={cn(baseInputClasses, error && errorClasses)}
          />
        );
      case 'select':
        return (
          <select
            {...props}
            onChange={e => props.onChange(e.target.value)}
            className={cn(baseInputClasses, error && errorClasses)}
          >
            <option value="">Selecciona {label}</option>
            {props.options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <div className="flex items-center h-full">
            <input
              {...props}
              type="checkbox"
              checked={props.checked}
              onChange={e => props.onChange(e.target.checked)}
              className="h-4 w-4 text-primary border-neutral-300 rounded focus:ring-primary dark:border-neutral-500"
            />
          </div>
        );
    }
  };

  if (props.type === 'checkbox') {
    return (
      <div className="flex items-center gap-x-2">
        {renderInput()}
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </label>
        {error && <p className="mt-1 text-xs text-error">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
        {label}
      </label>
      {renderInput()}
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
};
