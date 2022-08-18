// @ts-check
import transpile from "next-transpile-modules";
/**
 * Don't be scared of the generics here.
 * All they do is to give us autocompletion when using this.
 *
 * @template {import('next').NextConfig} T
 * @param {T} config - A generic parameter that flows through to the return type
 * @constraint {{import('next').NextConfig}}
 */
function defineNextConfig(config) {
  return config;
}

const withTM = transpile(["@master-bot/api", "@master-bot/react"]);

export default withTM(
  defineNextConfig({
    reactStrictMode: true,
    swcMinify: true,
    experimental: {
      externalDir: true,
    },
  })
);
