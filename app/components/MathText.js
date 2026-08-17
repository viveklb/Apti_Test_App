"use client";

import katex from "katex";

const delimitedMath = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^$\n]+?\$|\\\([^\n]+?\\\))/g;
const mathOnlyCharacters = /^[\s\dA-Za-z\\{}()[\].,+\-*/=<>%^_!|:;×÷±√∞≤≥≠≈π⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+$/u;

const superscripts = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁻": "-" };

function latexSource(value) {
  return value
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/gu, (match) => `^{${[...match].map((character) => superscripts[character]).join("")}}`)
    .replace(/√\s*(\{[^}]+\}|\([^)]*\)|[A-Za-z0-9.]+)/gu, (_, radicand) => String.raw`\sqrt{${radicand.replace(/^\{|\}$/g, "")}}`)
    .replaceAll("×", String.raw`\times `)
    .replaceAll("÷", String.raw`\div `)
    .replaceAll("±", String.raw`\pm `)
    .replaceAll("√", String.raw`\sqrt{}`)
    .replaceAll("∞", String.raw`\infty `)
    .replaceAll("≤", String.raw`\le `)
    .replaceAll("≥", String.raw`\ge `)
    .replaceAll("≠", String.raw`\ne `)
    .replaceAll("≈", String.raw`\approx `)
    .replaceAll("π", String.raw`\pi `);
}

function isMathOnly(value) {
  const text = value.trim();
  if (!text || !mathOnlyCharacters.test(text)) return false;
  return /(?:\\[A-Za-z]+|\^|_|[=<>×÷±√∞≤≥≠≈π⁰¹²³⁴⁵⁶⁷⁸⁹⁻]|\d\s*[+*/-]\s*\d)/u.test(text);
}

function mathHtml(source, displayMode) {
  return katex.renderToString(latexSource(source), {
    displayMode,
    throwOnError: false,
    strict: "ignore",
    trust: false,
    output: "htmlAndMathml",
  });
}

function MathFragment({ source, displayMode = false }) {
  return <span
    className={displayMode ? "math-fragment math-display" : "math-fragment"}
    dangerouslySetInnerHTML={{ __html: mathHtml(source, displayMode) }}
  />;
}

export default function MathText({ children, className = "", as: Element = "span" }) {
  const text = String(children ?? "");

  if (isMathOnly(text)) {
    return <Element className={`math-text math-only ${className}`.trim()}><MathFragment source={text.trim()} /></Element>;
  }

  const parts = text.split(delimitedMath);
  return <Element className={`math-text ${className}`.trim()}>{parts.map((part, index) => {
    if (!part) return null;
    if (part.startsWith("$$") && part.endsWith("$$")) return <MathFragment key={index} source={part.slice(2, -2)} displayMode />;
    if (part.startsWith("\\[") && part.endsWith("\\]")) return <MathFragment key={index} source={part.slice(2, -2)} displayMode />;
    if ((part.startsWith("$") && part.endsWith("$")) || (part.startsWith("\\(") && part.endsWith("\\)"))) {
      const offset = part.startsWith("$") ? 1 : 2;
      return <MathFragment key={index} source={part.slice(offset, -offset)} />;
    }
    return <span key={index}>{part}</span>;
  })}</Element>;
}
