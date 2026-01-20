const API_BASE_URL = "https://safetyapi.squareweb.app";
const API_ADMIN_TOKEN = "41d411ce99f7f2fcb4a8046c4e64d738";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: unknown;
  };
  requestId?: string;
  timestamp?: string;
}

export interface OverviewData {
  keys: number;
  users: number;
  products: number;
  activeKeys: number;
}

export interface KeyActionResponse {
  licenseKeyMasked: string;
  expiresAt?: string;
  paused?: boolean;
  banned?: boolean;
  reason?: string;
  oldDiscordId?: string;
}

export interface KeyInfoData {
  licenseKey: string;
  licenseKeyMasked: string;
  productId: string;
  status: {
    paused: boolean;
    banned: boolean;
    expired: boolean;
  };
  hwid?: string;
  discordId?: string;
  expiresAt?: string;
  createdAt?: string;
  lastUsed?: string;
  banReason?: string;
}

export interface BulkActionResponse {
  matched: number;
  modified: number;
}

export interface MaintenanceData {
  enabled: boolean;
  message: string;
}

// Products
export interface Product {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  page: number;
  limit: number;
  total: number;
  pages: number;
  items: Product[];
}

// Keys List
export interface KeyItem {
  id: string;
  prefix: string;
  code: string;
  product: { id: string; name: string };
  createdAt: string;
  expiresAt: string;
  usedBy: string | null;
  usedAt: string | null;
  hwid: string | null;
  paused: boolean;
  banned: boolean;
  banReason: string | null;
}

export interface KeysResponse {
  page: number;
  limit: number;
  total: number;
  pages: number;
  items: KeyItem[];
}

// Users
export interface UserItem {
  discordId: string;
  key: string;
  linkedAt: string | null;
  username: string;
  globalName: string;
  tag: string;
  avatarUrl: string;
  fetchedAt: string | null;
  paused: boolean;
  banned: boolean;
  banReason: string | null;
}

export interface UsersResponse {
  page: number;
  limit: number;
  total: number;
  pages: number;
  items: UserItem[];
}

export interface SyncDiscordResponse {
  user: {
    discordId: string;
    discordUsername: string;
    discordGlobalName: string;
    discordTag: string;
    discordAvatarUrl: string;
    discordFetchedAt: string;
  };
  member: {
    nick: string | null;
    rolesCount: number | null;
  };
}

// Audit Logs
export interface AuditLogItem {
  _id: string;
  requestId: string;
  level: "INFO" | "WARN" | "ERROR";
  event: string;
  route: string;
  method: string;
  statusCode: number;
  latencyMs: number;
  ip: string;
  userAgent: string;
  keyMasked: string | null;
  hwidMasked: string | null;
  discordIdMasked: string | null;
  message: string;
  meta: Record<string, unknown>;
  createdAt: string;
}

export interface AuditLogsResponse {
  page: number;
  limit: number;
  total: number;
  pages: number;
  items: AuditLogItem[];
}

// Privacy Settings
export interface PrivacySettings {
  censorEnabled: boolean;
}

// Security Settings
export interface SecuritySettings {
  hwidLockGlobal: boolean;
}

// Webhook Settings
export interface WebhookSettings {
  enabled: boolean;
  url: string | null;
  minLevel: "INFO" | "WARN" | "ERROR";
  username: string | null;
  avatarUrl: string | null;
  allowSensitive: boolean;
}

// Create Keys
export interface CreateKeysItem {
  id: string;
  code: string;
  expiresAt: string;
}

// Settings
export interface SettingsData {
  apiBaseUrl: string;
  apiVersion: string;
  rateLimit: number;
  timeout: number;
  keyPrefix: string;
  webhooksEnabled: boolean;
  stats?: {
    totalKeys: number;
    activeKeys: number;
    totalUsers: number;
    totalProducts: number;
  };
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_ADMIN_TOKEN}`,
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data: ApiResponse<T> = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      message: "Network error",
      error: {
        code: "NETWORK_ERROR",
        details: error,
      },
    };
  }
}

// Overview
export async function getOverview(): Promise<ApiResponse<OverviewData>> {
  return apiRequest<OverviewData>("/v1/admin/overview");
}

// Key Management
export async function getKeyInfo(
  licenseKey: string
): Promise<ApiResponse<KeyInfoData>> {
  return apiRequest<KeyInfoData>("/v1/admin/key/info", {
    method: "POST",
    body: JSON.stringify({ licenseKey }),
  });
}

export async function getKeyById(
  id: string
): Promise<ApiResponse<{ item: KeyItem }>> {
  return apiRequest<{ item: KeyItem }>(`/v1/admin/keys/${id}`);
}

export async function getUserByDiscordId(
  discordId: string
): Promise<ApiResponse<{ item: UserItem }>> {
  return apiRequest<{ item: UserItem }>(`/v1/admin/users/${discordId}`);
}

export async function resetKeyHwid(
  licenseKey: string
): Promise<ApiResponse<KeyActionResponse>> {
  return apiRequest<KeyActionResponse>("/v1/admin/key/reset-hwid", {
    method: "POST",
    body: JSON.stringify({ licenseKey }),
  });
}

export async function unlinkKey(
  licenseKey: string
): Promise<ApiResponse<KeyActionResponse>> {
  return apiRequest<KeyActionResponse>("/v1/admin/key/unlink", {
    method: "POST",
    body: JSON.stringify({ licenseKey }),
  });
}

export async function addKeyDays(
  licenseKey: string,
  days: number
): Promise<ApiResponse<KeyActionResponse>> {
  return apiRequest<KeyActionResponse>("/v1/admin/key/add-days", {
    method: "POST",
    body: JSON.stringify({ licenseKey, days }),
  });
}

export async function pauseKey(
  licenseKey: string,
  paused: boolean
): Promise<ApiResponse<KeyActionResponse>> {
  return apiRequest<KeyActionResponse>("/v1/admin/key/pause", {
    method: "POST",
    body: JSON.stringify({ licenseKey, paused }),
  });
}

export async function banKey(
  licenseKey: string,
  banned: boolean,
  reason?: string
): Promise<ApiResponse<KeyActionResponse>> {
  return apiRequest<KeyActionResponse>("/v1/admin/key/ban", {
    method: "POST",
    body: JSON.stringify({ licenseKey, banned, reason }),
  });
}

// Bulk Actions
export async function pauseAllActiveKeys(
  paused: boolean
): Promise<ApiResponse<BulkActionResponse>> {
  return apiRequest<BulkActionResponse>("/v1/admin/actives/pause-all", {
    method: "POST",
    body: JSON.stringify({ paused }),
  });
}

export async function resetAllHwid(): Promise<ApiResponse<BulkActionResponse>> {
  return apiRequest<BulkActionResponse>("/v1/admin/actives/reset-hwid-all", {
    method: "POST",
  });
}

export async function addDaysToAllActiveKeys(
  days: number
): Promise<ApiResponse<BulkActionResponse>> {
  return apiRequest<BulkActionResponse>("/v1/admin/actives/add-days-all", {
    method: "POST",
    body: JSON.stringify({ days }),
  });
}

// Maintenance
export async function setMaintenance(
  enabled: boolean,
  message?: string
): Promise<ApiResponse<MaintenanceData>> {
  return apiRequest<MaintenanceData>("/v1/admin/maintenance", {
    method: "POST",
    body: JSON.stringify({ enabled, message }),
  });
}

// Products
export async function getProducts(
  page = 1,
  limit = 25,
  q?: string
): Promise<ApiResponse<ProductsResponse>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (q) params.append("q", q);
  return apiRequest<ProductsResponse>(`/v1/admin/products?${params}`);
}

export async function createProduct(
  name: string,
  hwidLockEnabled = true
): Promise<ApiResponse<{ product: Product }>> {
  return apiRequest<{ product: Product }>("/v1/admin/products", {
    method: "POST",
    body: JSON.stringify({ name, hwidLockEnabled }),
  });
}

export async function updateProduct(
  id: string,
  data: { name?: string }
): Promise<ApiResponse<{ product: Product }>> {
  return apiRequest<{ product: Product }>(`/v1/admin/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function setProductHwidLock(
  id: string,
  enabled: boolean
): Promise<ApiResponse<{ product: Product }>> {
  return apiRequest<{ product: Product }>(`/v1/admin/products/${id}/hwid-lock`, {
    method: "PUT",
    body: JSON.stringify({ enabled }),
  });
}

// Keys List
export async function getKeys(
  page = 1,
  limit = 25,
  options?: { q?: string; status?: string; productId?: string }
): Promise<ApiResponse<KeysResponse>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (options?.q) params.append("q", options.q);
  if (options?.status) params.append("status", options.status);
  if (options?.productId) params.append("productId", options.productId);
  return apiRequest<KeysResponse>(`/v1/admin/keys?${params}`);
}

export async function createKeys(payload: {
  productId: string;
  days: number;
  quantity?: number;
  prefix?: string;
}): Promise<ApiResponse<{ items: CreateKeysItem[] }>> {
  return apiRequest<{ items: CreateKeysItem[] }>("/v1/admin/keys/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Users
export async function getUsers(
  page = 1,
  limit = 25,
  q?: string
): Promise<ApiResponse<UsersResponse>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (q) params.append("q", q);
  return apiRequest<UsersResponse>(`/v1/admin/users?${params}`);
}

export async function syncUserDiscord(
  discordId: string
): Promise<ApiResponse<SyncDiscordResponse>> {
  return apiRequest<SyncDiscordResponse>("/v1/admin/users/sync-discord", {
    method: "POST",
    body: JSON.stringify({ discordId }),
  });
}

// Audit Logs
export async function getAuditLogs(
  page = 1,
  limit = 25,
  filters?: {
    level?: string;
    event?: string;
    route?: string;
    method?: string;
    statusCode?: number;
    requestId?: string;
    discordIdMasked?: string;
    from?: string;
    to?: string;
    q?: string;
  }
): Promise<ApiResponse<AuditLogsResponse>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.append(key, String(value));
      }
    });
  }
  return apiRequest<AuditLogsResponse>(`/v1/admin/audit-logs?${params}`);
}

export async function getAuditLogById(
  id: string
): Promise<ApiResponse<{ item: AuditLogItem }>> {
  return apiRequest<{ item: AuditLogItem }>(`/v1/admin/audit-logs/${id}`);
}

// Privacy Settings
export async function getPrivacySettings(): Promise<ApiResponse<PrivacySettings>> {
  return apiRequest<PrivacySettings>("/v1/admin/settings/privacy");
}

export async function setPrivacySettings(
  censorEnabled: boolean
): Promise<ApiResponse<PrivacySettings>> {
  return apiRequest<PrivacySettings>("/v1/admin/settings/privacy", {
    method: "PUT",
    body: JSON.stringify({ censorEnabled }),
  });
}

// Security Settings
export async function getSecuritySettings(): Promise<ApiResponse<SecuritySettings>> {
  return apiRequest<SecuritySettings>("/v1/admin/settings/security");
}

export async function setSecuritySettings(
  hwidLockGlobal: boolean
): Promise<ApiResponse<SecuritySettings>> {
  return apiRequest<SecuritySettings>("/v1/admin/settings/security", {
    method: "PUT",
    body: JSON.stringify({ hwidLockGlobal }),
  });
}

// Webhook Settings
export async function getWebhookSettings(): Promise<ApiResponse<WebhookSettings>> {
  return apiRequest<WebhookSettings>("/v1/admin/settings/webhooks");
}

export async function setWebhookSettings(
  data: Partial<WebhookSettings>
): Promise<ApiResponse<WebhookSettings>> {
  return apiRequest<WebhookSettings>("/v1/admin/settings/webhooks", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Settings (mock for now, can be replaced with real endpoint)
export async function getSettings(): Promise<ApiResponse<SettingsData>> {
  // Try to get overview data for stats
  const overview = await getOverview();
  
  return {
    success: true,
    message: "Settings retrieved",
    data: {
      apiBaseUrl: API_BASE_URL,
      apiVersion: "v2.0.0",
      rateLimit: 100,
      timeout: 30,
      keyPrefix: "SAFE-",
      webhooksEnabled: true,
      stats: overview.success && overview.data ? {
        totalKeys: overview.data.keys,
        activeKeys: overview.data.activeKeys,
        totalUsers: overview.data.users,
        totalProducts: overview.data.products,
      } : undefined,
    },
  };
}
