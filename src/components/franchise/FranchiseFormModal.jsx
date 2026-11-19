import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Check, 
  Palette, 
  Sparkles, 
  Shield, 
  AlertCircle, 
  Upload, 
  Image as ImageIcon 
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  franchiseService, 
  isValidHexColor, 
  getContrastTextColor, 
  generateInitialsLogo 
} from '../../services/franchiseService';
import { toast } from 'sonner';

const PRESET_EMOJIS = ['👑', '⚡', '🔥', '🛡️', '🦁', '🦅', '🐯', '🐺', '🚀', '⭐', '🦈', '🎯', '🐉', '💎', '🌪️', '⚔️'];

const PRESET_PALETTES = [
  { name: 'Amethyst', hex: '#8875A8' },
  { name: 'Teal', hex: '#71999B' },
  { name: 'Copper', hex: '#B68B68' },
  { name: 'Sage', hex: '#84977B' },
  { name: 'Coral', hex: '#D97858' },
  { name: 'Champagne', hex: '#D4B879' },
  { name: 'Crimson', hex: '#D9534F' },
  { name: 'Cobalt', hex: '#3B82F6' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Amber', hex: '#F59E0B' },
];

export const FranchiseFormModal = ({
  isOpen,
  franchise = null, // null for create, object for edit
  onClose,
  onSaveSuccess,
}) => {
  const isEditing = Boolean(franchise?.id);

  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [color, setColor] = useState('#D97858');
  const [secondaryColor, setSecondaryColor] = useState('');
  const [logo, setLogo] = useState('');
  const [owner, setOwner] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize or reset form state
  useEffect(() => {
    if (franchise) {
      setName(franchise.name || '');
      setShortName(franchise.shortName || '');
      setColor(franchise.color || '#D97858');
      setSecondaryColor(franchise.secondaryColor || '');
      setLogo(franchise.logo || '');
      setOwner(franchise.owner || franchise.name || '');
      setDescription(franchise.description || '');
      setErrors({});
    } else {
      setName('');
      setShortName('');
      setColor('#D97858');
      setSecondaryColor('');
      setLogo('👑');
      setOwner('');
      setDescription('');
      setErrors({});
    }
  }, [franchise, isOpen]);

  // Auto-generate abbreviation as user types name if shortName is not manually customized
  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (!isEditing && (!shortName || shortName === generateInitialsLogo(name))) {
      setShortName(generateInitialsLogo(val));
    }
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, SVG, WebP)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image is too large. Max size is 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl === 'string') {
        setLogo(dataUrl);
        toast.success('Custom logo uploaded successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      name: name.trim(),
      shortName: shortName.trim().toUpperCase(),
      color: color.trim(),
      secondaryColor: secondaryColor.trim() || null,
      logo: logo.trim() || generateInitialsLogo(name),
      owner: owner.trim() || name.trim(),
      description: description.trim(),
    };

    const validation = franchiseService.validateFranchise(payload, franchise?.id || null);
    if (!validation.isValid) {
      setErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      toast.error(firstError);
      return;
    }

    setIsSubmitting(true);
    try {
      let savedFranchise;
      if (isEditing) {
        savedFranchise = franchiseService.updateFranchise(franchise.id, payload);
        toast.success(`Franchise "${savedFranchise.name}" updated successfully!`);
      } else {
        savedFranchise = franchiseService.createFranchise(payload);
        toast.success(`Franchise "${savedFranchise.name}" created successfully!`);
      }

      if (onSaveSuccess) onSaveSuccess(savedFranchise);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save franchise');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const contrastText = getContrastTextColor(color);
  const isImageLogo = logo.startsWith('data:image/') || logo.startsWith('http');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-xl bg-[#222F43] border border-[#39465A] rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden max-h-[92vh] flex flex-col justify-between"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#39465A] pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shadow-sm"
              style={{ backgroundColor: color, color: contrastText }}
            >
              {isImageLogo ? (
                <img src={logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
              ) : (
                logo || generateInitialsLogo(name || 'Franchise')
              )}
            </div>
            <div>
              <h2 className="font-heading font-black text-lg sm:text-xl text-[#F5F3EE]">
                {isEditing ? `Edit "${franchise?.name}"` : 'Add New Franchise'}
              </h2>
              <span className="text-[11px] font-mono text-[#AEB9CC]">
                {isEditing ? 'Update franchise branding & metadata' : 'Create a custom contender for PLAYZONE tournaments'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#2C394C] text-[#AEB9CC] hover:text-[#F5F3EE] hover:bg-[#39465A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Real-time Live Preview Pill */}
          <div className="p-3 rounded-2xl bg-[#2C394C] border border-[#39465A] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shadow border shrink-0 overflow-hidden"
                style={{ backgroundColor: color, color: contrastText, borderColor: `${color}cc` }}
              >
                {isImageLogo ? (
                  <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  logo || generateInitialsLogo(name || 'Franchise')
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-mono uppercase text-[#AEB9CC] block">LIVE BADGE PREVIEW</span>
                <span className="font-heading font-black text-sm text-[#F5F3EE] truncate block">
                  {name || 'Franchise Name'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span 
                className="px-2.5 py-1 rounded-lg text-xs font-mono font-black uppercase shadow-sm"
                style={{ backgroundColor: color, color: contrastText }}
              >
                {shortName || generateInitialsLogo(name || 'F')}
              </span>
            </div>
          </div>

          {/* Name & Abbreviation Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-heading font-bold text-[#F5F3EE] uppercase tracking-wider block">
                Franchise Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Royal Strikers"
                maxLength={40}
                required
                className={`w-full px-3.5 py-2.5 rounded-xl bg-[#111827] border text-sm text-[#F5F3EE] placeholder-[#AEB9CC]/40 focus:outline-none focus:ring-1 focus:ring-[#D97858] font-heading ${
                  errors.name ? 'border-rose-500' : 'border-[#39465A]'
                }`}
              />
              {errors.name && (
                <p className="text-[11px] font-mono text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-heading font-bold text-[#F5F3EE] uppercase tracking-wider block">
                Short Code <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={shortName}
                onChange={(e) => {
                  setShortName(e.target.value.toUpperCase());
                  if (errors.shortName) setErrors((prev) => ({ ...prev, shortName: undefined }));
                }}
                placeholder="e.g. RS"
                maxLength={6}
                required
                className={`w-full px-3.5 py-2.5 rounded-xl bg-[#111827] border text-sm text-[#F5F3EE] placeholder-[#AEB9CC]/40 focus:outline-none focus:ring-1 focus:ring-[#D97858] font-mono uppercase ${
                  errors.shortName ? 'border-rose-500' : 'border-[#39465A]'
                }`}
              />
              {errors.shortName && (
                <p className="text-[11px] font-mono text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.shortName}
                </p>
              )}
            </div>
          </div>

          {/* Color Selection: Primary HEX & Palette Presets */}
          <div className="space-y-2">
            <label className="text-xs font-heading font-bold text-[#F5F3EE] uppercase tracking-wider block">
              Primary Franchise Colour <span className="text-rose-400">*</span>
            </label>
            
            <div className="flex items-center gap-2.5">
              {/* Color input box */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111827] border border-[#39465A] flex-1">
                <input
                  type="color"
                  value={isValidHexColor(color) ? color : '#D97858'}
                  onChange={(e) => {
                    setColor(e.target.value);
                    if (errors.color) setErrors((prev) => ({ ...prev, color: undefined }));
                  }}
                  className="w-7 h-7 rounded-lg border-0 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => {
                    setColor(e.target.value);
                    if (errors.color) setErrors((prev) => ({ ...prev, color: undefined }));
                  }}
                  placeholder="#D97858"
                  maxLength={7}
                  className="bg-transparent font-mono text-xs uppercase text-[#F5F3EE] focus:outline-none w-24"
                />
              </div>

              {/* Optional Secondary color */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111827] border border-[#39465A] flex-1">
                <input
                  type="color"
                  value={isValidHexColor(secondaryColor) ? secondaryColor : '#39465A'}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-7 h-7 rounded-lg border-0 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  placeholder="Secondary (Opt)"
                  maxLength={7}
                  className="bg-transparent font-mono text-xs uppercase text-[#F5F3EE] focus:outline-none w-28"
                />
              </div>
            </div>

            {/* Quick Palette Swatches */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {PRESET_PALETTES.map((p) => (
                <button
                  key={p.hex}
                  type="button"
                  onClick={() => setColor(p.hex)}
                  className={`w-6 h-6 rounded-full border transition-transform ${
                    color.toLowerCase() === p.hex.toLowerCase()
                      ? 'scale-125 border-white ring-2 ring-white/40 shadow-sm'
                      : 'border-black/40 hover:scale-110'
                  }`}
                  style={{ backgroundColor: p.hex }}
                  title={p.name}
                />
              ))}
            </div>
            {errors.color && (
              <p className="text-[11px] font-mono text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.color}
              </p>
            )}
          </div>

          {/* Logo / Avatar / Preset Emoji */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-heading font-bold text-[#F5F3EE] uppercase tracking-wider block">
                Franchise Icon / Logo
              </label>
              <label className="cursor-pointer text-[11px] font-mono text-[#D4B879] hover:underline flex items-center gap-1">
                <Upload className="w-3 h-3" />
                <span>Upload Custom Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap p-2.5 rounded-2xl bg-[#111827] border border-[#39465A]">
              {PRESET_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setLogo(emoji)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-base transition-all ${
                    logo === emoji
                      ? 'bg-[#2C394C] border border-[#D97858] scale-110 shadow-sm'
                      : 'hover:bg-[#2C394C]/60 border border-transparent'
                  }`}
                >
                  {emoji}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setLogo(generateInitialsLogo(name || 'F'))}
                className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-xl bg-[#2C394C] border border-[#39465A] text-[#AEB9CC] hover:text-[#F5F3EE]"
                title="Use initials avatar"
              >
                Use Initials ({generateInitialsLogo(name || 'F')})
              </button>
            </div>
          </div>

          {/* Owner & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-heading font-bold text-[#F5F3EE] uppercase tracking-wider block">
                Owner / Manager Name
              </label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="e.g. Captain Jack"
                maxLength={30}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#111827] border border-[#39465A] text-sm text-[#F5F3EE] placeholder-[#AEB9CC]/40 focus:outline-none focus:ring-1 focus:ring-[#D97858] font-heading"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-heading font-bold text-[#F5F3EE] uppercase tracking-wider block">
                Description (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Aggressive bidders with big purse"
                maxLength={100}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#111827] border border-[#39465A] text-sm text-[#F5F3EE] placeholder-[#AEB9CC]/40 focus:outline-none focus:ring-1 focus:ring-[#D97858] font-heading"
              />
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[#39465A] flex items-center justify-end gap-2.5 shrink-0 mt-3">
          <Button
            variant="ghost"
            size="md"
            onClick={onClose}
            className="text-xs font-heading text-[#AEB9CC] hover:text-[#F5F3EE]"
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="font-heading text-xs font-black shadow-md bg-[#D97858] hover:bg-white text-[#F5F3EE] hover:text-[#111827] px-6 py-2.5"
          >
            <Check className="w-4 h-4 mr-1.5" />
            <span>{isEditing ? 'Save Changes' : 'Create Franchise'}</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
