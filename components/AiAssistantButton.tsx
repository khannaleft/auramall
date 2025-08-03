"use client";

import React from 'react';
import Icon from './Icon';

interface AiAssistantButtonProps {
    onClick: () => void;
}

const AiAssistantButton: React.FC<AiAssistantButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 bg-accent text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-300 z-40"
            aria-label="Open AI Assistant"
        >
            <Icon name="sparkles" className="w-8 h-8" />
        </button>
    );
};

export default AiAssistantButton;