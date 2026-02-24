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
    <div className="bg-stone-900/80 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-white bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-rose-400">
        Initiate Card Sequence
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-stone-400 font-bold">From (Sender)</label>
            <input
              type="text"
              name="sender_name"
              value={formData.sender_name}
              onChange={handleChange}
              className="w-full bg-stone-950/50 border border-stone-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              placeholder="Your Name"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-stone-400 font-bold">To (Recipient)</label>
            <input
              type="text"
              name="recipient_name"
              value={formData.recipient_name}
              onChange={handleChange}
              className="w-full bg-stone-950/50 border border-stone-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              placeholder="Their Name"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-xs uppercase tracking-wider text-stone-400 font-bold">Special Note for Recipient</label>
            <span className="text-xs text-stone-500">{formData.wish_text.length}/200</span>
          </div>
          <textarea
            name="wish_text"
            value={formData.wish_text}
            onChange={handleChange}
            maxLength={200}
            className="w-full bg-stone-950/50 border border-stone-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none h-32 resize-none transition-all"
            placeholder="Write your special note here... (e.g., 'I hope you have the most adventurous year yet!')"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-stone-400 font-bold">Theme</label>
            <select
              name="optional_theme"
              value={formData.optional_theme}
              onChange={handleChange}
              className="w-full bg-stone-950/50 border border-stone-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none appearance-none cursor-pointer transition-all"
            >
              {THEMES.map(theme => (
                <option key={theme} value={theme}>{theme}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-stone-400 font-bold">Deck Title (Optional)</label>
            <input
              type="text"
              name="deck_title"
              value={formData.deck_title}
              onChange={handleChange}
              className="w-full bg-stone-950/50 border border-stone-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. 'Wedding Series'"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 mt-4 bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 text-white font-bold rounded-lg shadow-lg shadow-orange-900/50 transform transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Forging...' : 'Generate Card'}
        </button>
      </form>
    </div>
  );
};