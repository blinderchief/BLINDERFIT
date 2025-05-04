import React, { useState } from 'react';
import { Phone } from 'lucide-react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  error,
  placeholder = "Phone number",
  required = false,
  disabled = false,
  id = "phone",
  name = "phone"
}) => {
  const [focused, setFocused] = useState(false);
  
  // Default country code for India
  const defaultCountryCode = "+91";
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // If the input is empty and user is typing, add the default country code
    if (value === "" && inputValue.length === 1 && !inputValue.startsWith("+")) {
      inputValue = defaultCountryCode + inputValue;
    }
    
    // Only allow numbers and + sign
    if (/^[+\d]*$/.test(inputValue) || inputValue === "") {
      onChange(inputValue);
    }
  };
  
  const handleFocus = () => {
    setFocused(true);
    // If empty, prefill with country code
    if (value === "") {
      onChange(defaultCountryCode);
    }
  };
  
  const handleBlur = () => {
    setFocused(false);
  };

  return (
    <div>
      <label htmlFor={id} className="sr-only">{placeholder}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Phone className="h-5 w-5 text-gray-400" />
        </div>
        <input
          id={id}
          name={name}
          type="tel"
          autoComplete="tel"
          required={required}
          disabled={disabled}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`block w-full pl-10 pr-3 py-3 border ${
            error ? 'border-red-500' : 'border-gold/20'
          } bg-black text-white placeholder-gray-500 focus:ring-2 focus:ring-gold/50 focus:border-transparent`}
          placeholder={focused ? "" : placeholder + " (e.g. +91 9876543210)"}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      <p className="mt-2 text-xs text-gray-400">
        Enter your phone number with country code (+91 for India)
      </p>
    </div>
  );
};

export default PhoneInput;