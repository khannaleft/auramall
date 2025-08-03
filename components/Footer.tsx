import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary">
        <div className="container mx-auto px-4 py-8">
            <div className="border-t border-glass-border pt-8 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4">
                <p className="text-sm text-text-secondary">&copy; {new Date().getFullYear()} Aura Traditional. All Rights Reserved.</p>
                <div className="text-sm text-text-secondary flex gap-4">
                    <a href="#" className="hover:text-text-primary transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-text-primary transition-colors">Terms of Service</a>
                </div>
            </div>
        </div>
    </footer>
  );
};

export default Footer;
