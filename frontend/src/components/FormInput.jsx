import { AlertCircle } from 'lucide-react'; // Error icon

/**
 * REUSABLE FORM INPUT
 * 
 * Purpose: A standardized text box used across all forms (Login, Register, Profile).
 * It includes an icon on the left and an optional error message below.
 */
const FormInput = ({ label, icon: Icon, error, ...props }) => {
  return (
    <div className="space-y-2">
      {/* Field Label (e.g., "Email Address") */}
      {label && <label className="text-sm font-medium text-slate-300 ml-1">{label}</label>}
      
      {/* Input wrapper to hold the icon and the input field */}
      <div className="relative group">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-white transition-colors" />
        )}
        <input
          {...props} // Standard input props like type, value, onChange
          className={`w-full ${Icon ? 'pl-12' : 'px-4'} pr-4 py-3 bg-white/5 border ${
            error ? 'border-red-500/50' : 'border-white/10'
          } rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all ${
            props.className || ''
          }`}
        />
      </div>

      {/* Error message shown if the 'error' prop is provided */}
      {error && (
        <div className="flex items-center gap-2 mt-1 ml-1 text-red-400 text-xs animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FormInput;
