let clientPromise;

export function getCloudConfig(env = import.meta.env || {}) {
  const url = env.VITE_SUPABASE_URL || "";
  const anonKey = env.VITE_SUPABASE_ANON_KEY || "";
  return { configured: Boolean(url && anonKey), url, anonKey };
}

export async function getCloudClient() {
  const config = getCloudConfig();
  if (!config.configured) return null;
  if (!clientPromise) {
    clientPromise = import("@supabase/supabase-js").then(({ createClient }) => createClient(config.url, config.anonKey, {
      auth: { persistSession: true, detectSessionInUrl: true },
    }));
  }
  return clientPromise;
}

export function createProgressRepository(client) {
  return {
    async load(userId) {
      const { data, error } = await client.from("learning_progress").select("progress").eq("user_id", userId).maybeSingle();
      if (error) throw error;
      return data?.progress || null;
    },
    async save(userId, progress) {
      const { error } = await client.from("learning_progress").upsert({ user_id: userId, progress, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
      if (error) throw error;
    },
  };
}

export async function signInWithGitHub() {
  const client = await getCloudClient();
  if (!client) throw new Error("cloud_not_configured");
  return client.auth.signInWithOAuth({ provider: "github", options: { redirectTo: window.location.href.split("#")[0] } });
}

export async function signInWithEmail(email) {
  const client = await getCloudClient();
  if (!client) throw new Error("cloud_not_configured");
  return client.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href.split("#")[0] } });
}

export async function signOutCloud() {
  const client = await getCloudClient();
  if (client) await client.auth.signOut();
}
