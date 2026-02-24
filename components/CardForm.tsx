import React, { useState } from 'react';
import { UserInput } from '../types';
import { THEMES } from '../constants';

interface CardFormProps {
  onSubmit: (input: UserInput) => void;
  isSubmitting: boolean;
}

export const CardForm: React.FC<CardFormProps> = ({ onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState<UserInput>({
    sender_name: '',
    recipient_name: '',
    wish_text: '',
    optional_theme: 'Auto-Select',
    deck_title: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sender_name || !formData.recipient_name || !formData.wish_text) return;
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] relative overflow-hidden">
      {/* Decorative Shine */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-mint/10 rounded-full blur-2xl"></div>

      <h2 className="text-3xl font-display mb-6 text-center text-text-dark tracking-wide">
        INITIATE <span className="text-mint">SEQUENCE</span>
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">From (Sender)</label>
            <input
              type="text"
              name="sender_name"
              value={formData.sender_name}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-text-dark placeholder-gray-400 focus:ring-2 focus:ring-mint focus:border-mint outline-none transition-all font-medium"
              placeholder="Your Name"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">To (Recipient)</label>
            <input
              type="text"
              name="recipient_name"
              value={formData.recipient_name}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-text-dark placeholder-gray-400 focus:ring-2 focus:ring-mint focus:border-mint outline-none transition-all font-medium"
              placeholder="Their Name"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Special Note</label>
            <span className="text-xs text-gray-400 font-mono">{formData.wish_text.length}/200</span>
          </div>
          <textarea
            name="wish_text"
            value={formData.wish_text}
            onChange={handleChange}
            maxLength={200}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-text-dark placeholder-gray-400 focus:ring-2 focus:ring-mint focus:border-mint outline-none h-32 resize-none transition-all font-medium"
            placeholder="Write your special note here... (e.g., 'I hope you have the most adventurous year yet!')"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Theme</label>
            <div className="relative">
              <select
                name="optional_theme"
                value={formData.optional_theme}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-text-dark focus:ring-2 focus:ring-mint focus:border-mint outline-none appearance-none cursor-pointer transition-all font-medium"
              >
                {THEMES.map(theme => (
                  <option key={theme} value={theme} className="bg-white text-text-dark">{theme}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                ▼
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Deck Title</label>
            <input
              type="text"
              name="deck_title"
              value={formData.deck_title}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-text-dark placeholder-gray-400 focus:ring-2 focus:ring-mint focus:border-mint outline-none transition-all font-medium"
              placeholder="e.g. 'Wedding Series'"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 mt-4 bg-gradient-to-r from-mint to-teal-400 hover:from-mint/90 hover:to-teal-400/90 text-white font-display text-xl tracking-wider rounded-xl shadow-[0_4px_15px_rgba(0,201,167,0.4)] transform transition-all hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(0,201,167,0.5)] disabled:opacity-50 disabled:cursor-not-allowed border-2 border-white/20"
        >
          {isSubmitting ? 'FORGING...' : 'GENERATE CARD'}
        </button>
      </form>
    </div>
  );
};