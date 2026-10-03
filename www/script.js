// Supabase Yapılandırması
const SUPABASE_URL = 'https://tlsvemiagbctqvwrosup.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5B2oG-hRXxPXiHFyblZbHA_anIZHIIX';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let isLoginMode = true;

function toggleMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('form-title').innerText = isLoginMode ? 'Giriş Yap' : 'Kayıt Ol';
    document.getElementById('submit-btn').innerText = isLoginMode ? 'Giriş Yap' : 'Kayıt Ol';
    document.getElementById('toggle-text').innerText = isLoginMode ? 'Hesabın yok mu? Kayıt ol' : 'Zaten hesabın var mı? Giriş yap';
    document.getElementById('error-msg').innerText = '';
}

async function handleAuth() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMsg = document.getElementById('error-msg');
    errorMsg.innerText = '';

    if (!email || !password) {
        errorMsg.innerText = 'Lütfen tüm alanları doldurun.';
        return;
    }

    if (isLoginMode) {
        // Giriş Yapma İşlemi
        const { data, error } = await supabaseClient
            .from('user_profiles')
            .select('*')
            .eq('email', email)
            .eq('password', password)
            .single();

        if (error || !data) {
            errorMsg.innerText = 'Kullanıcı adı veya şifre yanlış.';
        } else {
            alert('Giriş başarılı!');
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('app-container').style.display = 'block';
        }
    } else {
        // Kayıt Olma İşlemi
        const { error } = await supabaseClient
            .from('user_profiles')
            .insert([{ email: email, password: password, full_name: 'Yeni Kullanıcı' }]);

        if (error) {
            errorMsg.innerText = 'Kayıt oluşturulamadı: ' + error.message;
        } else {
            alert('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
            toggleMode();
        }
    }
}

function handleLogout() {
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('auth-container').style.display = 'block';
}
