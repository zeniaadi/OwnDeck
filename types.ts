export interface UserInput {
  sender_name: string;
  recipient_name: string;
  wish_text: string;
  optional_theme: string;
  deck_title?: string;
}

export interface Ability {
  name: string;
  cost_icons: string[];
  description: string;
  power_value?: string | number;
}

export interface CardSpec {
  sender_name: string;
  recipient_name: string;
  wish_text: string;
  tone: string;
  mood: string;
  theme_keywords: string[];
  selected_design_theme: string;
  color_palette: string[];
  card_archetype: string;
  short_tagline: string;
  deck_title?: string;
}

export interface CardCopy {
  card_title: string;
  primary_stat_name: string;
  primary_stat_value: number | string;
  abilities: Ability[];
  flavor_quote: string;
}

export interface ArtPromptPackage {
  art_prompt: string;
  negative_prompt: string;
  composition_notes: string;
}

export interface RenderSpec {
  positions?: any; // Flexible, as we might not use exact coords
  fonts?: string[];
  colors?: string[];
  overlays?: string[];
}

export interface ExportSettings {
  resolution_notes?: string;
}

export interface CardData {
  card_spec: CardSpec;
  card_copy: CardCopy;
  art_prompt_package: ArtPromptPackage;
  render_spec: RenderSpec;
  export_settings: ExportSettings;
}