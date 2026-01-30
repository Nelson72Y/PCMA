// 請將下方的 URL 與 Key 替換為您在 Supabase Dashboard 取得的資訊
// 位置：Project Settings -> API
const SUPABASE_URL = '您的_SUPABASE_URL';
const SUPABASE_ANON_KEY = '您的_SUPABASE_ANON_KEY';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
