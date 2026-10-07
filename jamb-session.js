/* =====================================================
   MOLAS JAMB RESOURCE SESSION
   10-MINUTE INACTIVITY PROTECTION
====================================================== */

const JAMB_SESSION_KEY = "molas_jamb_last_activity";
const JAMB_INACTIVITY_LIMIT = 2 * 60 * 1000;


/* =====================================================
   RECORD ACTIVITY
====================================================== */

function updateJambActivity() {
  
  localStorage.setItem(
    JAMB_SESSION_KEY,
    Date.now().toString()
  );
  
}


/* =====================================================
   CHECK IF SESSION IS STILL ACTIVE
====================================================== */

function isJambActivityActive() {
  
  const lastActivity =
    Number(
      localStorage.getItem(
        JAMB_SESSION_KEY
      )
    );
  
  if (!lastActivity) {
    return false;
  }
  
  return (
    Date.now() - lastActivity <
    JAMB_INACTIVITY_LIMIT
  );
  
}


/* =====================================================
   PROTECT JAMB RESOURCE
====================================================== */

async function protectJambResourcePage() {
  
  const {
    data,
    error
  } = await supabaseClient.auth.getSession();
  
  
  if (error || !data.session) {
    
    localStorage.removeItem(
      JAMB_SESSION_KEY
    );
    
    window.location.replace(
      "account.html?resource=jamb"
    );
    
    return false;
  }
  
  
  if (!isJambActivityActive()) {
    
    await supabaseClient.auth.signOut();
    
    localStorage.removeItem(
      JAMB_SESSION_KEY
    );
    
    window.location.replace(
      "account.html?resource=jamb"
    );
    
    return false;
  }
  
  
  updateJambActivity();
  
  return true;
  
}


/* =====================================================
   ACTIVITY LISTENERS
====================================================== */

[
  "click",
  "touchstart",
  "keydown",
  "scroll"
].forEach(eventName => {
  
  document.addEventListener(
    eventName,
    updateJambActivity,
    {
      passive: true
    }
  );
  
});