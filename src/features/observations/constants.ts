export const DESCRIPTOR_LABELS: Record<string, string> = {
  clear: "Clair", cloudy: "Trouble", foamy: "Mousseux", bubbly: "Bulleux",
  separated: "Séparé", sediment: "Sédiment", mold_suspected: "Moisissure suspectée", scoby_growth: "Croissance SCOBY",
  neutral: "Neutre", yeasty: "Levuré", fruity: "Fruité", acidic: "Acide",
  vinegar: "Vinaigré", sulfur: "Soufré", alcoholic: "Alcoolisé", unpleasant: "Désagréable",
  sweet: "Sucré", balanced: "Équilibré", bitter: "Amer", bland: "Fade", overfermented: "Surfermenté",
  liquid: "Liquide", thick: "Épais", syrupy: "Sirupeux", creamy: "Crémeux", elastic: "Élastique", collapsed: "Retombé",
  none: "Aucune", low: "Faible", medium: "Moyenne", high: "Élevée", peak: "Pic", declining: "En baisse",
  contamination_suspected: "Contamination suspectée", too_acidic: "Trop acide",
  no_activity: "Pas d'activité", excessive_pressure: "Pression excessive", off_smell: "Odeur anormale",
  other: "Autre",
};

export function descriptorLabel(d: string): string {
  return DESCRIPTOR_LABELS[d] ?? d.replace(/_/g, " ");
}
