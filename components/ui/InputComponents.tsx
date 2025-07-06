
import React, { useRef, forwardRef } from 'react';
import { ICONS } from '../../constants';
import { Button } from './ButtonComponents';


interface InputBaseProps {
  label: string;
  id: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  containerClassName?: string;
}

interface TextInputProps extends InputBaseProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'id' | 'className'> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TextInput: React.FC<TextInputProps> = ({ label, id, value, onChange, className, labelClassName, inputClassName, containerClassName, ...props }) => {
  return (
    <div className={`mb-3 ${containerClassName ?? ''}`}>
      <label htmlFor={id} className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName ?? ''}`}>
        {label}
      </label>
      <input
        type="text"
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${inputClassName ?? ''}`}
        {...props}
      />
    </div>
  );
};


interface NumberInputProps extends InputBaseProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'id' | 'className'> {
  value: number | string; // Allow string for intermediate input states
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const NumberInput: React.FC<NumberInputProps> = ({ label, id, value, onChange, className, labelClassName, inputClassName, containerClassName, ...props }) => {
  return (
    <div className={`mb-3 ${containerClassName ?? ''}`}>
      <label htmlFor={id} className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName ?? ''}`}>
        {label}
      </label>
      <input
        type="number"
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${inputClassName ?? ''}`}
        {...props}
      />
    </div>
  );
};

interface SliderInputProps extends Omit<InputBaseProps, 'inputClassName'> {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (newValue: number) => void;
  sliderClassName?: string;
  numberInputClassName?: string;
  disabled?: boolean; // Added disabled prop
}

export const SliderInput: React.FC<SliderInputProps> = ({
  label,
  id,
  min,
  max,
  step,
  value,
  onChange,
  className,
  labelClassName,
  sliderClassName,
  numberInputClassName,
  containerClassName,
  disabled, // Destructure disabled prop
}) => {
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseFloat(e.target.value);
    if (!isNaN(numValue)) {
      // Clamp value to min/max to prevent out-of-bounds typed values
      // though native input type=number with min/max attributes often handles this.
      onChange(Math.min(max, Math.max(min, numValue)));
    } else if (e.target.value === "" || e.target.value === "-") {
        // Allow temporarily empty or just a minus sign without calling onChange
        // The actual value prop will hold the last valid number.
    }
  };

  // Ensure value passed to inputs is within min/max bounds, primarily for initial render
  const displayValue = Math.min(max, Math.max(min, value));

  return (
    <div className={`mb-3 ${containerClassName ?? ''} ${className ?? ''}`}>
      <label htmlFor={`${id}-number`} className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName ?? ''} ${disabled ? 'text-gray-400' : ''}`}>
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="range"
          id={`${id}-slider`}
          min={min}
          max={max}
          step={step}
          value={displayValue}
          onChange={handleSliderChange}
          disabled={disabled} // Pass disabled to range input
          className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 flex-grow ${sliderClassName ?? ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label={`${label} slider`}
        />
        <input
          type="number"
          id={`${id}-number`}
          min={min}
          max={max}
          step={step}
          value={displayValue} // Display the controlled value
          onChange={handleNumberInputChange}
          disabled={disabled} // Pass disabled to number input
          className={`w-24 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${numberInputClassName ?? ''} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
      </div>
    </div>
  );
};


interface SelectInputProps<T extends string> extends InputBaseProps, Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'className'> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const SelectInput = <T extends string,>({ label, id, options, value, onChange, className, labelClassName, inputClassName, containerClassName, ...props }: SelectInputProps<T>) => {
  return (
    <div className={`mb-3 ${containerClassName ?? ''}`}>
      <label htmlFor={id} className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName ?? ''}`}>
        {label}
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${inputClassName ?? ''}`}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

interface TextAreaProps extends InputBaseProps, Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'className'> {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    rows?: number;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    ({ label, id, value, onChange, rows = 3, className, labelClassName, inputClassName, containerClassName, ...props }, ref) => {
    return (
        <div className={`mb-3 ${containerClassName ?? ''}`}>
            {label && <label htmlFor={id} className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName ?? ''}`}>{label}</label>}
            <textarea
                id={id}
                name={id}
                rows={rows}
                value={value}
                onChange={onChange}
                ref={ref}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-none ${inputClassName ?? ''}`}
                {...props}
            />
        </div>
    );
});


interface FileInputButtonProps {
  onFileSelect: (file: File) => void;
  label: string;
  accept?: string;
  className?: string;
  buttonVariant?: 'primary' | 'secondary' | 'ghost';
}

export const FileInputButton: React.FC<FileInputButtonProps> = ({ onFileSelect, label, accept="image/png, image/jpeg, image/gif", className, buttonVariant }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!accept.split(',').map(s=>s.trim()).includes(file.type)) {
          alert(`Unsupported file type. Please upload one of: ${accept}`);
          if(fileInputRef.current) fileInputRef.current.value = ''; 
          return;
      }
      onFileSelect(file);
      if(fileInputRef.current) fileInputRef.current.value = ''; // Reset to allow re-uploading same file
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />
      <Button 
        onClick={handleButtonClick} 
        className={`w-full ${className ?? ''}`}
        leftIcon={ICONS.upload}
        variant={buttonVariant || 'secondary'}
      >
        {label}
      </Button>
    </>
  );
};
