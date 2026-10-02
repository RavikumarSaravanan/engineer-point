document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("mainNav"), toggle = document.getElementById("menuToggle");
  toggle?.addEventListener("click", () => { const open = nav.classList.toggle("open"); toggle.setAttribute("aria-expanded", String(open)); toggle.textContent = open ? "✕" : "☰"; });
  nav?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => { nav.classList.remove("open"); toggle?.setAttribute("aria-expanded","false"); toggle.textContent="☰"; }));
  document.getElementById("year").textContent = new Date().getFullYear();
  const reveal = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting){e.target.classList.add("visible");reveal.unobserve(e.target);} }), {threshold:.12});
  document.querySelectorAll(".reveal").forEach(el => reveal.observe(el));
  const wa = window.ENGINEER_POINT_CONFIG?.WHATSAPP_NUMBER || "919000000000";
  document.getElementById("floatingWhatsApp").href = `https://wa.me/${wa}?text=${encodeURIComponent("Hello Engineer Point, I would like to know more about your services.")}`;
  document.querySelectorAll(".service-enquire").forEach(btn => btn.addEventListener("click", () => {
    const select = document.querySelector('[name="service"]'); if(select) select.value = btn.dataset.service;
    document.getElementById("contact").scrollIntoView({behavior:"smooth"});
    document.querySelector('[name="name"]')?.focus({preventScroll:true});
  }));
  loadPublicContent();
});

async function loadPublicContent(){
  if(!window.epDbReady()) return;
  const db=window.epSupabase;
  const [projects,reviews]=await Promise.all([
    db.from("projects").select("id,title,category,description,image_url,project_url,sort_order").eq("published",true).order("sort_order").order("created_at",{ascending:false}),
    db.from("reviews").select("id,customer_name,role,review_text,rating").eq("published",true).order("created_at",{ascending:false})
  ]);
  if(!projects.error) renderProjects(projects.data||[]);
  if(!reviews.error) renderReviews(reviews.data||[]);
}
let allProjects=[];
function renderProjects(items){allProjects=items;drawProjects("All");}
function drawProjects(filter){
  const grid=document.getElementById("portfolioGrid"); if(!grid)return;
  const items=filter==="All"?allProjects:allProjects.filter(x=>x.category===filter);
  if(!items.length){grid.innerHTML='<div class="empty-state">No published projects in this category yet.</div>';return;}
  grid.innerHTML=items.map(p=>`<article class="project-card"><img src="${safeAttr(p.image_url)}" alt="${safeAttr(p.title)}" loading="lazy"><div class="project-info"><small>${safeText(p.category)}</small><h3>${safeText(p.title)}</h3><p>${safeText(p.description||"")}</p>${p.project_url?`<a href="${safeAttr(p.project_url)}" target="_blank" rel="noopener">View project ↗</a>`:""}</div></article>`).join("");
}
document.getElementById("portfolioFilters")?.addEventListener("click",e=>{const b=e.target.closest("[data-filter]");if(!b)return;document.querySelectorAll(".filter-btn").forEach(x=>x.classList.remove("active"));b.classList.add("active");drawProjects(b.dataset.filter);});
function renderReviews(items){
 const grid=document.getElementById("reviewsGrid");if(!grid)return;
 if(!items.length){grid.innerHTML='<div class="empty-state">Customer testimonials will appear here once added and published by the admin.</div>';return;}
 grid.innerHTML=items.map(r=>`<article class="review-card"><div class="review-stars" aria-label="${Number(r.rating)||5} out of 5 stars">${"★".repeat(Math.max(1,Math.min(5,Number(r.rating)||5)))}</div><blockquote>“${safeText(r.review_text)}”</blockquote><div class="review-person"><span class="review-avatar">${safeText((r.customer_name||"C").slice(0,1).toUpperCase())}</span><span><b>${safeText(r.customer_name)}</b><small>${safeText(r.role||"Customer")}</small></span></div></article>`).join("");
}
function safeText(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function safeAttr(v){return safeText(v).replace(/`/g,"&#96;");}
window.safeText=safeText; window.safeAttr=safeAttr;