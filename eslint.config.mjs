import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(["node_modules/**"]),
  {
    rules: {
      // o pacote é uma lib, não uma app Next — não há diretório de páginas para a regra inspecionar
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  {
    // DÍVIDA: arquivos portados do d7-frontend, onde já falham o lint da mesma forma.
    // Funcionam em produção hoje; corrigir junto com a origem, não isoladamente.
    files: [
      "src/ui/date-picker-popover.tsx",
      "src/ui/date-range-picker.tsx",
      "src/ui/image-analyzer.tsx",
      "src/ui/multi-select.tsx",
      "src/ui/select.tsx",
    ],
    rules: {
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
