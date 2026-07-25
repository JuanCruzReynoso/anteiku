/**
 * Shared status label maps for orders, payments, and subscriptions.
 * All display layers MUST use these constants for consistency.
 */

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  completed: "Completado",
  failed: "Fallido",
  refunded: "Reembolsado",
};

export const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  active: "Activa",
  paused: "Pausada",
  cancelled: "Cancelada",
  past_due: "Vencida",
};

export const ROLE_LABELS: Record<string, { label: string; className: string }> = {
  customer: {
    label: "Cliente",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  admin: {
    label: "Administrador",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  },
  owner: {
    label: "Propietario",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
};
