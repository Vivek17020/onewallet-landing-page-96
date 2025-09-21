import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  validationRules?: ValidationRule[];
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  showValidationIcon?: boolean;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label,
  validationRules = [],
  onValidationChange,
  validateOnChange = true,
  validateOnBlur = true,
  showValidationIcon = true,
  className = '',
  value,
  onChange,
  onBlur,
  ...props
}) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [touched, setTouched] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const validate = (inputValue: string) => {
    const newErrors: string[] = [];
    
    validationRules.forEach(rule => {
      if (!rule.test(inputValue)) {
        newErrors.push(rule.message);
      }
    });

    setErrors(newErrors);
    onValidationChange?.(newErrors.length === 0, newErrors);
    return newErrors.length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange?.(e);
    
    if (validateOnChange && touched) {
      validate(newValue);
      setShowErrors(true);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    onBlur?.(e);
    
    if (validateOnBlur) {
      validate(e.target.value);
      setShowErrors(true);
    }
  };

  useEffect(() => {
    if (value !== undefined && touched) {
      validate(String(value));
    }
  }, [value, validationRules]);

  const hasErrors = errors.length > 0;
  const isValid = !hasErrors && touched && String(value || '').length > 0;

  return (
    <div className="space-y-2">
      {label && (
        <Label 
          htmlFor={props.id}
          className={hasErrors && showErrors ? 'text-destructive' : ''}
        >
          {label}
        </Label>
      )}
      
      <div className="relative">
        <Input
          {...props}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`
            ${className}
            ${hasErrors && showErrors ? 'border-destructive focus-visible:ring-destructive' : ''}
            ${isValid ? 'border-green-500 focus-visible:ring-green-500' : ''}
            ${showValidationIcon && (hasErrors || isValid) ? 'pr-10' : ''}
          `}
        />
        
        {showValidationIcon && showErrors && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {hasErrors ? (
              <AlertCircle className="w-4 h-4 text-destructive" />
            ) : isValid ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : null}
          </div>
        )}
      </div>
      
      {showErrors && errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

// Common validation rules
export const ValidationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    test: (value) => value.trim().length > 0,
    message,
  }),
  
  minLength: (min: number, message?: string): ValidationRule => ({
    test: (value) => value.length >= min,
    message: message || `Must be at least ${min} characters`,
  }),
  
  maxLength: (max: number, message?: string): ValidationRule => ({
    test: (value) => value.length <= max,
    message: message || `Must be no more than ${max} characters`,
  }),
  
  email: (message = 'Please enter a valid email address'): ValidationRule => ({
    test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),
  
  number: (message = 'Please enter a valid number'): ValidationRule => ({
    test: (value) => !isNaN(Number(value)) && value.trim() !== '',
    message,
  }),
  
  positiveNumber: (message = 'Please enter a positive number'): ValidationRule => ({
    test: (value) => !isNaN(Number(value)) && Number(value) > 0,
    message,
  }),
  
  range: (min: number, max: number, message?: string): ValidationRule => ({
    test: (value) => {
      const num = Number(value);
      return !isNaN(num) && num >= min && num <= max;
    },
    message: message || `Must be between ${min} and ${max}`,
  }),
  
  ethereum: {
    address: (message = 'Please enter a valid Ethereum address'): ValidationRule => ({
      test: (value) => /^0x[a-fA-F0-9]{40}$/.test(value),
      message,
    }),
    
    amount: (message = 'Please enter a valid amount'): ValidationRule => ({
      test: (value) => {
        const num = Number(value);
        return !isNaN(num) && num > 0 && num <= 1000000;
      },
      message,
    }),
  },
};