import { Label, LocationType, Seniority } from "@/types/job";

// Extrai facetas (modelo de trabalho, senioridade, empresa) do título e das
// labels da issue. As comunidades usam convenções fortes ("Remoto", "Pleno",
// "CLT"), mas não são garantidas — os parsers são conservadores e retornam
// null/[] quando não há sinal claro.

const COMBINING_DIACRITICS = /[̀-ͯ]/g;

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(COMBINING_DIACRITICS, "");
}

function haystack(title: string, labels: Label[]): string {
  return normalize(`${title} ${labels.map((l) => l.name).join(" ")}`);
}

export function parseLocationType(
  title: string,
  labels: Label[]
): LocationType | null {
  const text = haystack(title, labels);

  // Híbrido primeiro: anúncios híbridos costumam mencionar "remoto" também
  if (/\bhibrido\b|\bhybrid\b/.test(text)) return "hibrido";
  if (/\bremoto\b|\bremote\b|\bhome ?office\b/.test(text)) return "remoto";
  if (/\bpresencial\b|\bon-?site\b/.test(text)) return "presencial";

  return null;
}

export function parseSeniority(title: string, labels: Label[]): Seniority[] {
  const text = haystack(title, labels);
  const result: Seniority[] = [];

  if (/\bjunior\b|\bjr\b/.test(text)) result.push("junior");
  if (/\bpleno\b|\bmid-?level\b/.test(text)) result.push("pleno");
  if (/\bsenior\b|\bsr\b|\bespecialista\b/.test(text)) result.push("senior");

  return result;
}

// Convenção comum nos títulos: "Desenvolvedor X na ACME" / "... @ ACME".
// Retorna null quando não há um padrão confiável — melhor omitir do que
// atribuir a vaga à comunidade errada (usado no JSON-LD hiringOrganization).
export function parseCompany(title: string): string | null {
  const match = title.match(
    /\s(?:na|no|em|@)\s+([A-ZÀ-Ú][\w&.\-À-ú ]{1,40})\s*$/
  );
  if (!match) return null;

  const company = match[1].trim();
  // Descarta capturas que são claramente localização/modelo, não empresa
  if (/^(remoto|hibrido|híbrido|presencial|brasil|home ?office)$/i.test(company)) {
    return null;
  }
  return company;
}
