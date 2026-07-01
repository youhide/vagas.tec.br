import { describe, expect, it } from "vitest";
import { Label } from "@/types/job";
import { parseCompany, parseLocationType, parseSeniority } from "./parse";

function labels(...names: string[]): Label[] {
  return names.map((name) => ({ name, color: "#000000" }));
}

describe("parseLocationType", () => {
  it.each([
    ["[Remoto] Dev Backend", [], "remoto"],
    ["Dev Backend", ["Remoto"], "remoto"],
    ["Dev 100% remote", [], "remoto"],
    ["Dev Home Office", [], "remoto"],
    ["[São Paulo] Dev Híbrido", [], "hibrido"],
    ["Dev remoto ou híbrido", [], "hibrido"],
    ["[SP] Dev Presencial", [], "presencial"],
    ["Dev On-site", [], "presencial"],
    ["Dev Backend Pleno", [], null],
  ] as const)("%s + labels %j -> %s", (title, labelNames, expected) => {
    expect(parseLocationType(title, labels(...labelNames))).toBe(expected);
  });
});

describe("parseSeniority", () => {
  it.each([
    ["Dev Júnior", [], ["junior"]],
    ["Dev Jr", [], ["junior"]],
    ["Dev Pleno", [], ["pleno"]],
    ["Dev Sênior", [], ["senior"]],
    ["Dev Sr", [], ["senior"]],
    ["Dev", ["Pleno", "Sênior"], ["pleno", "senior"]],
    ["Dev Pleno/Sênior", [], ["pleno", "senior"]],
    ["Dev Backend", [], []],
  ] as const)("%s + labels %j -> %j", (title, labelNames, expected) => {
    expect(parseSeniority(title, labels(...labelNames))).toEqual(expected);
  });
});

describe("parseCompany", () => {
  it.each([
    ["Desenvolvedor Backend na ACME", "ACME"],
    ["Dev Frontend Pleno no Nubank", "Nubank"],
    ["Pessoa Desenvolvedora em Stone Pagamentos", "Stone Pagamentos"],
    ["Dev Fullstack @ PicPay", "PicPay"],
    // Sem padrão confiável -> null (nunca chutar)
    ["Desenvolvedor Backend Pleno", null],
    ["Dev na empresa", null],
    ["Vaga remota no Brasil", null],
    ["[Remoto] Dev trabalhando em home office", null],
  ] as const)("%s -> %s", (title, expected) => {
    expect(parseCompany(title)).toBe(expected);
  });
});
