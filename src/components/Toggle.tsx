import { Switch } from 'lucide-react';

interface ToggleProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    label: string;
}

export function Toggle({ enabled, onChange, label }: ToggleProps) {
    return (
        <button
            onClick={() => onChange(!enabled)}
            className={`flex items-center justify-between w-full p-4 rounded-lg border-2 transition-colors
        ${enabled ? 'border-white bg-white/10' : 'border-white/10 hover:border-white/30'}`}
        >
            <span className="text-lg">{label}</span>
            <div className="relative">
                <div
                    className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out
                        ${enabled ? 'bg-white' : 'bg-gray-600'}`}
                >
                    <div
                        className={`absolute top-1 left-1 bg-black w-4 h-4 rounded-full transition-transform duration-200 ease-in-out
                            ${enabled ? 'translate-x-6' : 'translate-x-0'}`}
                    />
                </div>
            </div>
        </button>
    );
}