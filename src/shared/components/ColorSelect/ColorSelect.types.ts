export interface ColorOption {
  label: string;
  value: string;
  color?: string; // Defaults to value for the hex color code
}

export interface ColorSelectProps {
  id?: string;
  options: ColorOption[];
  value: ColorOption | undefined | null;
  onChange: (newValue: ColorOption | null) => void;
  placeholder?: string;
  noOptionsMessage?: (info: { inputValue: string }) => string;
  className?: string;
}
