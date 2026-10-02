(() => {
  const cfg = window.ENGINEER_POINT_CONFIG || {};
  const configured = cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY &&
    !cfg.SUPABASE_URL.includes("YOUR_") && !cfg.SUPABASE_ANON_KEY.includes("YOUR_");
  window.epSupabase = configured && window.supabase
    ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY)
    : null;
  window.epDbReady = () => Boolean(window.epSupabase);
})();