import type { AppRouter } from "@master-bot/api";
import { createTRPCReact } from "@trpc/react-query";

export const api = createTRPCReact<AppRouter>();

export { type RouterInputs, type RouterOutputs } from "@master-bot/api";
