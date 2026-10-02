document.getElementById("contactForm")?.addEventListener("submit", async e => {
 e.preventDefault(); const form=e.currentTarget, status=document.getElementById("formStatus"), btn=form.querySelector("button[type=submit]");
 const data=Object.fromEntries(new FormData(form).entries());
 if(!form.reportValidity()) return;
 const cfg=window.ENGINEER_POINT_CONFIG||{};
 const message=[
  "NEW ENQUIRY – ENGINEER POINT","--------------------------",
  `Name: ${data.name}`,`Email: ${data.email}`,`Phone: ${data.phone}`,
  `Service: ${data.service}`,`Budget: ${data.budget||"Not specified"}`,
  `Message: ${data.message}`
 ].join("\n");
 const number=String(cfg.WHATSAPP_NUMBER||"").replace(/\D/g,"");
 if(!number || number==="919000000000"){status.textContent="Please configure the real WhatsApp number in assets/js/config.js. The demo number is not a real contact.";return;}
 const waWindow=window.open("about:blank","_blank");\n btn.disabled=true;btn.textContent="Preparing enquiry…";
 try{
   if(window.epDbReady()){
     const {error}=await window.epSupabase.from("enquiries").insert([{name:data.name,email:data.email,phone:data.phone,service:data.service,budget:data.budget||null,message:data.message}]);
     if(error) console.warn("Enquiry database save failed:",error.message);
   }
   const emailConfigured=cfg.EMAILJS_PUBLIC_KEY&&cfg.EMAILJS_SERVICE_ID&&cfg.EMAILJS_TEMPLATE_ID;
   if(emailConfigured&&window.emailjs){
     try{
       await emailjs.send(cfg.EMAILJS_SERVICE_ID,cfg.EMAILJS_TEMPLATE_ID,{
         from_name:data.name,from_email:data.email,phone:data.phone,service:data.service,
         budget:data.budget||"Not specified",message:data.message,to_email:"engineerpoint1988@gmail.com"
       });
     }catch(err){console.error("EmailJS error:",err);status.textContent="WhatsApp will open. Email notification could not be sent; check EmailJS configuration.";}
   }else{status.textContent="WhatsApp will open. Email notification is not configured yet; follow README to enable it.";}
   if(waWindow){waWindow.opener=null;waWindow.location.href=`https://wa.me/${number}?text=${encodeURIComponent(message)}`;}else{status.textContent="Popup blocked. Please allow popups or use the floating WhatsApp button.";}
   form.reset();
 }catch(err){console.error(err);status.textContent="Something went wrong. Please try again or email us directly.";}
 finally{btn.disabled=false;btn.innerHTML='Send enquiry via WhatsApp <b>↗</b>';}
});