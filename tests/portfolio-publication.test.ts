import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks=vi.hoisted(()=>({revalidate:vi.fn()}));
vi.mock("server-only",()=>({}));
vi.mock("next/cache",()=>({revalidatePath:mocks.revalidate}));
import { removePublishedProjects } from "@/lib/portfolio-publication";

describe("published project invalidation",()=>{
 beforeEach(()=>vi.clearAllMocks());
 it("removes deleted or ineligible projects from public snapshots and draft selections",async()=>{
  const update=vi.fn();const deleteMany=vi.fn();const findMany=vi.fn().mockResolvedValue([{id:"pf1",publishedSlug:"jane",published:true,publishedSnapshot:{displayName:"Jane",projects:[{id:"p1"},{id:"p2"}]}}]);
  await removePublishedProjects({portfolio:{findMany,update},portfolioProject:{deleteMany}} as never,["p1"]);
  expect(update).toHaveBeenCalledWith({where:{id:"pf1"},data:{published:true,publishedSlug:"jane",publishedSnapshot:{displayName:"Jane",projects:[{id:"p2"}]}}});
  expect(deleteMany).toHaveBeenCalledWith({where:{projectId:{in:["p1"]}}});expect(mocks.revalidate).toHaveBeenCalledWith("/p/jane");
 });
 it("does not expose or write unpublished snapshots, but still clears invalid selections",async()=>{
  const update=vi.fn();const deleteMany=vi.fn();const findMany=vi.fn().mockResolvedValue([{id:"pf1",publishedSlug:null,published:false,publishedSnapshot:{projects:[{id:"p1"}]}}]);
  await removePublishedProjects({portfolio:{findMany,update},portfolioProject:{deleteMany}} as never,["p1"]);
  expect(update).not.toHaveBeenCalled();expect(deleteMany).toHaveBeenCalled();expect(mocks.revalidate).not.toHaveBeenCalled();
 });
 it("unpublishes when no eligible published projects remain",async()=>{
  const update=vi.fn();const findMany=vi.fn().mockResolvedValue([{id:"pf1",publishedSlug:"jane",published:true,publishedSnapshot:{displayName:"Jane",projects:[{id:"p1"}]}}]);
  await removePublishedProjects({portfolio:{findMany,update},portfolioProject:{deleteMany:vi.fn()}} as never,["p1"]);
  expect(update).toHaveBeenCalledWith({where:{id:"pf1"},data:{published:false,publishedSlug:null,publishedSnapshot:{displayName:"Jane",projects:[]}}});expect(mocks.revalidate).toHaveBeenCalledWith("/p/jane");
 });
});
