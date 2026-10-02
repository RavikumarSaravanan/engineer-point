const $=s=>document.querySelector(s);
async function requireAdmin(){
 if(!window.epDbReady()){alert("Supabase is not configured. Update assets/js/config.js first.");location.href="login.html";return false;}
 const {data:{session}}=await epSupabase.auth.getSession();
 if(!session){location.href="login.html";return false;}
 $("#adminEmail")&&($("#adminEmail").textContent=session.user.email);
 return true;
}
document.addEventListener("DOMContentLoaded",async()=>{
 if($("#loginForm")){
  $("#loginForm").addEventListener("submit",async e=>{e.preventDefault();const f=new FormData(e.currentTarget);$("#loginStatus").textContent="Signing in…";const {error}=await epSupabase.auth.signInWithPassword({email:f.get("email"),password:f.get("password")});if(error){$("#loginStatus").textContent=error.message;return;}location.href="dashboard.html";});
  if(!window.epDbReady())$("#loginStatus").textContent="Add your Supabase URL and anon key in assets/js/config.js.";
 }
 if($("#projectsTable")){if(await requireAdmin())await loadAdmin();}
 $("#logoutBtn")?.addEventListener("click",async()=>{await epSupabase.auth.signOut();location.href="login.html";});
 bindForms();
});
async function loadAdmin(){await Promise.all([loadProjects(),loadReviews()]);}
async function loadProjects(){
 const {data,error}=await epSupabase.from("projects").select("*").order("created_at",{ascending:false});
 if(error){$("#projectsTable").innerHTML=`<tr><td colspan="4">${esc(error.message)}</td></tr>`;return;}
 $("#projectCount").textContent=data.length;
 $("#projectsTable").innerHTML=data.map(p=>`<tr><td><div class="table-project">${p.image_url?`<img src="${esc(p.image_url)}" alt="">`:""}<b>${esc(p.title)}</b></div></td><td>${esc(p.category)}</td><td><span class="status-pill ${p.published?"":"draft"}">${p.published?"Published":"Draft"}</span></td><td><button class="action-btn" data-edit-project="${p.id}">Edit</button><button class="action-btn delete" data-delete-project="${p.id}">Delete</button></td></tr>`).join("")||'<tr><td colspan="4">No projects added yet.</td></tr>';
}
async function loadReviews(){
 const {data,error}=await epSupabase.from("reviews").select("*").order("created_at",{ascending:false});
 if(error){$("#reviewsTable").innerHTML=`<tr><td colspan="4">${esc(error.message)}</td></tr>`;return;}
 $("#reviewCount").textContent=data.length;
 $("#reviewsTable").innerHTML=data.map(r=>`<tr><td><b>${esc(r.customer_name)}</b><br>${esc(r.role||"")}</td><td>${"★".repeat(r.rating)}</td><td><span class="status-pill ${r.published?"":"draft"}">${r.published?"Published":"Draft"}</span></td><td><button class="action-btn" data-edit-review="${r.id}">Edit</button><button class="action-btn delete" data-delete-review="${r.id}">Delete</button></td></tr>`).join("")||'<tr><td colspan="4">No reviews added yet.</td></tr>';
}
function bindForms(){
 $("#addProjectBtn")?.addEventListener("click",()=>showForm("projectForm"));
 $("#cancelProject")?.addEventListener("click",()=>$("#projectForm").classList.add("hidden"));
 $("#addReviewBtn")?.addEventListener("click",()=>showForm("reviewForm"));
 $("#cancelReview")?.addEventListener("click",()=>$("#reviewForm").classList.add("hidden"));
 $("#projectForm")?.addEventListener("submit",saveProject);
 $("#reviewForm")?.addEventListener("submit",saveReview);
 $("#projectsTable")?.addEventListener("click",async e=>{
  const edit=e.target.closest("[data-edit-project]"),del=e.target.closest("[data-delete-project]");
  if(edit){const {data}=await epSupabase.from("projects").select("*").eq("id",edit.dataset.editProject).single();if(data){const f=$("#projectForm");fill(f,data);f.querySelector('[name="published"]').checked=data.published;f.classList.remove("hidden");f.scrollIntoView({behavior:"smooth"});}}
  if(del&&confirm("Delete this project? Its uploaded image will remain in storage; remove it manually if no longer needed.")){const {error}=await epSupabase.from("projects").delete().eq("id",del.dataset.deleteProject);if(error)alert(error.message);else loadProjects();}
 });
 $("#reviewsTable")?.addEventListener("click",async e=>{
  const edit=e.target.closest("[data-edit-review]"),del=e.target.closest("[data-delete-review]");
  if(edit){const {data}=await epSupabase.from("reviews").select("*").eq("id",edit.dataset.editReview).single();if(data){const f=$("#reviewForm");fill(f,data);f.querySelector('[name="published"]').checked=data.published;f.classList.remove("hidden");f.scrollIntoView({behavior:"smooth"});}}
  if(del&&confirm("Delete this review?")){const {error}=await epSupabase.from("reviews").delete().eq("id",del.dataset.deleteReview);if(error)alert(error.message);else loadReviews();}
 });
}
function showForm(id){const f=$("#"+id);f.reset();f.querySelector('[name="id"]').value="";f.classList.remove("hidden");f.scrollIntoView({behavior:"smooth"});}
function fill(form,data){Object.entries(data).forEach(([k,v])=>{const el=form.elements.namedItem(k);if(el&&el.type!=="file"&&el.type!=="checkbox")el.value=v??"";});}
async function saveProject(e){
 e.preventDefault();const f=e.currentTarget,d=Object.fromEntries(new FormData(f).entries()),status=$("#projectStatus");status.textContent="Saving…";
 let image_url=null;
 const file=f.elements.image.files[0];
 if(file){if(file.size>5*1024*1024){status.textContent="Image must be smaller than 5 MB.";return;}if(!["image/jpeg","image/png","image/webp"].includes(file.type)){status.textContent="Use JPG, PNG or WebP.";return;}
  const path=`${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,"-")}`;
  const up=await epSupabase.storage.from("portfolio-images").upload(path,file,{upsert:false});
  if(up.error){status.textContent=up.error.message;return;}
  image_url=epSupabase.storage.from("portfolio-images").getPublicUrl(path).data.publicUrl;
 }
 const payload={title:d.title,category:d.category,description:d.description,project_url:d.project_url||null,sort_order:Number(d.sort_order)||0,published:f.elements.published.checked};
 if(image_url)payload.image_url=image_url;
 if(!d.id&&!image_url){status.textContent="Please select a project image.";return;}
 const result=d.id?await epSupabase.from("projects").update(payload).eq("id",d.id):await epSupabase.from("projects").insert([payload]);
 if(result.error){status.textContent=result.error.message;return;}
 status.textContent="Project saved.";f.reset();f.classList.add("hidden");await loadProjects();
}
async function saveReview(e){
 e.preventDefault();const f=e.currentTarget,d=Object.fromEntries(new FormData(f).entries()),payload={customer_name:d.customer_name,role:d.role,review_text:d.review_text,rating:Number(d.rating),published:f.elements.published.checked};
 const status=$("#reviewStatus");status.textContent="Saving…";
 const result=d.id?await epSupabase.from("reviews").update(payload).eq("id",d.id):await epSupabase.from("reviews").insert([payload]);
 if(result.error){status.textContent=result.error.message;return;}status.textContent="Review saved.";f.reset();f.classList.add("hidden");await loadReviews();
}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}