
import React from 'react';
import type { Persona } from '../types';

interface PersonaSelectorProps {
    personas: Persona[];
    activePersonaId: string;
    onSelectPersona: (id: string) => void;
}

const PersonaSelector: React.FC<PersonaSelectorProps> = ({ personas, activePersonaId, onSelectPersona }) => {
    return (
        <div className="flex space-x-2 bg-gray-800/50 p-1 rounded-full">
            {personas.map(persona => {
                const isActive = persona.id === activePersonaId;
                const activeClass = isActive ? `bg-${persona.color}-500 text-white` : 'text-gray-300 hover:bg-gray-700/50';

                return (
                    <button
                        key={persona.id}
                        onClick={() => onSelectPersona(persona.id)}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all duration-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white`}
                        title={persona.name}
                    >
                        <div className={`${activeClass} p-1.5 rounded-full transition-colors duration-300`}>
                           <persona.icon className="w-5 h-5" />
                        </div>
                        <span className={`hidden sm:inline transition-all duration-300 ${isActive ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0'} overflow-hidden whitespace-nowrap`}>
                            {persona.name}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default PersonaSelector;
