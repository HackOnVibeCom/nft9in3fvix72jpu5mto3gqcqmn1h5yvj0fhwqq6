import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "../../src/app/globals.css";
import { PortfolioEditor } from "../../src/components/portfolio-editor";
import { PublicPortfolioView, type PortfolioPublicSnapshot } from "../../src/components/public-portfolio-view";
import { PrivatePortfolioPreviewView } from "../../src/components/private-portfolio-preview-view";

const projects = [
  { id:"project-one", name:"one", fullName:"jane/one", url:"https://github.com/jane/one", primaryLanguage:"TypeScript", languages:{TypeScript:10,React:3}, stars:8, forks:1, analysis:{approved:true,approvedTitle:"First approved project",approvedSummary:"An evidence based summary for the first repository."} },
  { id:"project-two", name:"two", fullName:"jane/two", url:"https://github.com/jane/two", primaryLanguage:"Python", languages:{Python:10}, stars:3, forks:0, analysis:{approved:true,approvedTitle:"Second approved project",approvedSummary:"An evidence based summary for the second repository."} },
  { id:"project-pending", name:"pending", fullName:"jane/pending", url:"https://github.com/jane/pending", primaryLanguage:"Rust", languages:{Rust:10}, stars:0, forks:0, analysis:{approved:false,approvedTitle:null,approvedSummary:null} },
];
const initial = { displayName:"Jane Developer",headline:"Software developer",biography:"Building useful tools.",location:"Lagos",linkedinUrl:null,websiteUrl:null,slug:"jane-dev",publishedSlug:null,published:false,publishedAt:null,githubUsername:"jane" };
type FixtureDraft={displayName:string;headline:string;biography:string;location:string|null;linkedinUrl:string|null;websiteUrl:string|null;slug:string;publishedSlug:string|null;published:boolean;publishedAt:string|null;githubUsername:string|null;projectIds:string[]};
let draft:FixtureDraft = {...initial,projectIds:[]}; let publicSnapshot:PortfolioPublicSnapshot|null=null;
function response(data:unknown,status=200){return Promise.resolve(new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json"}}));}
window.fetch = (async(input:RequestInfo|URL,init?:RequestInit)=>{
 const url=String(input);
 if(url.endsWith("/api/portfolio")&&(!init?.method||init.method==="GET"))return response({portfolio:draft,projects,projectIds:draft.projectIds});
 if(url.endsWith("/api/portfolio")&&init?.method==="PUT"){draft={...draft,...JSON.parse(String(init.body))};return response({ok:true});}
 if(url.endsWith("/api/portfolio")&&init?.method==="POST"){
  const {action}=JSON.parse(String(init.body));
  if(action==="unpublish"){publicSnapshot=null;draft.published=false;draft.publishedSlug=null;}
  else {draft.published=true;draft.publishedSlug=draft.slug;publicSnapshot={displayName:draft.displayName,headline:draft.headline,biography:draft.biography,location:draft.location,linkedinUrl:draft.linkedinUrl,websiteUrl:draft.websiteUrl,githubUsername:"jane",avatarUrl:null,projects:draft.projectIds.map(id=>{const p=projects.find(x=>x.id===id)!;return{id:p.id,title:p.analysis.approvedTitle!,summary:p.analysis.approvedSummary!,url:p.url,primaryLanguage:p.primaryLanguage,technologies:Object.keys(p.languages),stars:p.stars,forks:p.forks,repositoryUpdatedAt:null};})};}
  window.dispatchEvent(new Event("fixture-state-change"));return response({ok:true,slug:draft.slug});
 }
 return response({error:"Unexpected fixture request"},500);
}) as typeof fetch;
(navigator as Navigator&{share?:(payload:{url:string})=>Promise<void>}).share=async(payload={url:""})=>{(window as Window&{__shared?:boolean;__sharedUrl?:string}).__shared=true;(window as Window&{__sharedUrl?:string}).__sharedUrl=payload.url;};

function Fixture(){const[view,setView]=useState("editor"),[,setVersion]=useState(0);useEffect(()=>{const listener=()=>setVersion(v=>v+1);window.addEventListener("fixture-state-change",listener);return()=>window.removeEventListener("fixture-state-change",listener);},[]);return <><nav aria-label="Fixture views" className="flex gap-2 border-b border-zinc-800 p-4"><button onClick={()=>setView("editor")}>Editor</button><button onClick={()=>setView("preview")}>Preview</button><button onClick={()=>setView("public")}>Public portfolio</button></nav>{view==="editor"?<PortfolioEditor appOrigin="http://127.0.0.1:4173"/>:view==="preview"?<PrivatePortfolioPreviewView displayName={draft.displayName} headline={draft.headline} location={draft.location} biography={draft.biography} projects={draft.projectIds.map(id=>{const p=projects.find(x=>x.id===id)!;return{id:p.id,title:p.analysis.approvedTitle,summary:p.analysis.approvedSummary};})}/>:publicSnapshot?<PublicPortfolioView data={publicSnapshot} referralCode="fixture-referral-code"/>:<main className="p-10"><h1>Portfolio not found</h1></main>}</>}
createRoot(document.getElementById("root")!).render(<Fixture/>);
