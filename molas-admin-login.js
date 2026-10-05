// =====================================================
// MOLAS ADMIN LOGIN
// =====================================================

const SUPABASE_URL = "https://eidnzebqyxcpxbykybch.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_Q81zflk66ijoYEpT_pqL1g_S-cSJSpj";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);


// =====================================================
// DOM
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
  
  const loginForm =
    document.getElementById("molas-admin-login-form");
  
  const emailInput =
    document.getElementById("admin-email");
  
  const passwordInput =
    document.getElementById("admin-password");
  
  const passwordToggle =
    document.getElementById("molas-admin-password-toggle");
  
  const loginButton =
    document.getElementById("molas-admin-login-button");
  
  const loginError =
    document.getElementById("molas-admin-login-error");
  
  
  // =================================================
  // PASSWORD VISIBILITY
  // =================================================
  
  passwordToggle.addEventListener("click", () => {
    
    const isPassword =
      passwordInput.type === "password";
    
    passwordInput.type =
      isPassword ? "text" : "password";
    
    passwordToggle.innerHTML = isPassword ?
      '<i class="fa-solid fa-eye-slash"></i>' :
      '<i class="fa-solid fa-eye"></i>';
    
    passwordToggle.setAttribute(
      "aria-label",
      isPassword ? "Hide password" : "Show password"
    );
  });
  
  
  // =================================================
  // LOGIN
  // =================================================
  
  loginForm.addEventListener("submit", async (event) => {
    
    event.preventDefault();
    
    loginError.textContent = "";
    
    const email =
      emailInput.value.trim();
    
    const password =
      passwordInput.value;
    
    
    if (!email || !password) {
      loginError.textContent =
        "Please enter your email and password.";
      return;
    }
    
    
    // Disable button while signing in
    
    loginButton.disabled = true;
    
    loginButton.innerHTML = `
            <span>Signing in...</span>
            <i class="fa-solid fa-spinner fa-spin"></i>
        `;
    
    
    try {
      
      // =============================================
      // SIGN IN WITH SUPABASE
      // =============================================
      
      const { data, error } =
      await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      
      if (error) {
        throw error;
      }
      
      
      const user = data.user;
      
      
      if (!user) {
        throw new Error(
          "Unable to identify the signed-in user."
        );
      }
      
      
      // =============================================
      // VERIFY MOLAS ADMIN
      // =============================================
      
      const {
        data: adminRecord,
        error: adminError
      } = await supabaseClient
        .from("chat_admins")
        .select("id, user_id, active")
        .eq("user_id", user.id)
        .eq("active", true)
        .maybeSingle();
      
      
      if (adminError) {
        throw adminError;
      }
      
      
      // =============================================
      // NOT AN ACTIVE ADMIN
      // =============================================
      
      if (!adminRecord) {
        
        await supabaseClient.auth.signOut();
        
        loginError.textContent =
          "You are not authorized to access the MOLAS admin area.";
        
        resetLoginButton();
        
        return;
      }
      
      
      // =============================================
      // ADMIN VERIFIED
      // =============================================
      
      window.location.href =
        "molas-admin.html";
      
    } catch (error) {
      
      console.error(
        "MOLAS admin login error:",
        error
      );
      
      loginError.textContent =
        getLoginErrorMessage(error);
      
      resetLoginButton();
    }
    
    
    // =============================================
    // RESET BUTTON
    // =============================================
    
    function resetLoginButton() {
      
      loginButton.disabled = false;
      
      loginButton.innerHTML = `
                <span>Sign In</span>
                <i class="fa-solid fa-arrow-right"></i>
            `;
    }
    
  });
  
});


// =====================================================
// FRIENDLY ERROR MESSAGES
// =====================================================

function getLoginErrorMessage(error) {
  
  const message =
    error?.message?.toLowerCase() || "";
  
  
  if (
    message.includes("invalid login credentials")
  ) {
    return "Incorrect email or password.";
  }
  
  
  if (
    message.includes("email not confirmed")
  ) {
    return "Please confirm your email before signing in.";
  }
  
  
  if (
    message.includes("too many requests")
  ) {
    return "Too many login attempts. Please try again later.";
  }
  
  
  return error?.message || "Unable to sign in.";
}