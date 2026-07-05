import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextVitals,
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
    rules: {
      "@next/next/no-img-element": "off"
    }
  }
];

export default eslintConfig;
