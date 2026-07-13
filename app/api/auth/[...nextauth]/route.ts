import { handlers } from "@/auth";
export const { GET, POST } = handlers;

// Force Node.js runtime — postgres.js doesn't work in edge runtime
export const runtime = "nodejs";
