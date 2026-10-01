"use client";
import { useMemo, useState } from "react";
import { AlertTriangle, Check, ChevronDown, Circle, ClipboardCheck, Printer, Save } from "lucide-react";
import type { SalesOrder } from "@/lib/types";
type Step=NonNullable<SalesOrder["workflow"]>[number];
const template:Step[]=[
 {key:"requirement",label:"客户与需求确认",done:false,notes:"确认产品、规格、数量、目标价、目的国、认证和包装要求"},
 {key:"sample",label:"样品确认",done:false,notes:"记录样品费用、快递单号和客户确认结果；不需要样品时注明原因"},
 {key:"quote",label:"报价与利润复核",done:false,notes:"复核产品成本、包装、物流、汇率、手续费和利润，确认贸易条款"},
 {key:"pi",label:"PI / 合同确认",done:false,notes:"确认公司抬头、银行账户、产品明细、交期、付款和索赔条款"},
 {key:"deposit",label:"收到定金",done:false,notes:"银行到账后再安排生产，核对付款人和订单主体"},
 {key:"supplier",label:"供应商下单与采购",done:false,notes:"确认采购价、规格、包装、交期、质量标准和违约责任"},
 {key:"production",label:"生产跟进",done:false,notes:"记录开工、中期进度、包装材料和预计完工日期"},
 {key:"inspection",label:"验货与质量确认",done:false,notes:"检查数量、功能、尺寸、材质、外观、标签、包装和装箱资料"},
 {key:"balance",label:"收到尾款",done:false,notes:"按付款条款确认尾款到账；未到账不要贸然放货"},
 {key:"documents",label:"报关与单证",done:false,notes:"核对发票、装箱单、报关资料、原产地证、提单和客户要求文件"},
 {key:"shipment",label:"发运与物流追踪",done:false,notes:"确认货代、计费重、附加费、单号/提单、预计到达和异常联系人"},
 {key:"delivery",label:"客户签收",done:false,notes:"确认数量和包装是否正常，保存签收证明"},
 {key:"aftersales",label:"售后与复购",done:false,notes:"处理问题和索赔，询问销售反馈，安排复购跟进日期"},
];
const normalize=(order:SalesOrder)=>template.map(base=>order.workflow?.find(item=>item.key===base.key)||base);
export default function WorkflowManager({initialOrders}:{initialOrders:SalesOrder[]}){
 const [orders,setOrders]=useState(()=>initialOrders.map(order=>({...order,workflow:normalize(order)}))),[selected,setSelected]=useState(initialOrders[0]?.id||""),[notice,setNotice]=useState("");
 const order=orders.find(item=>item.id===selected);const today=new Date().toISOString().slice(0,10);
 const summary=useMemo(()=>orders.map(item=>{const steps=normalize(item),done=steps.filter(x=>x.done).length,overdue=steps.filter(x=>!x.done&&x.due&&x.due<today).length;return{item,done,overdue,percent:Math.round(done/steps.length*100)}}),[orders,today]);
 function updateStep(key:string,patch:Partial<Step>){setOrders(items=>items.map(item=>item.id===selected?{...item,workflow:normalize(item).map(step=>step.key===key?{...step,...patch}:step)}:item));}
 async function save(){if(!order)return;const response=await fetch("/api/admin/orders",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(order)});setNotice(response.ok?"业务流程已保存":"保存失败，请重试");}
 function toggle(step:Step){const done=!step.done;updateStep(step.key,{done,completedAt:done?new Date().toISOString():""});}
 return <div className="workflow-admin"><header><div><small>END-TO-END WORKFLOW</small><h1>业务流程工作台</h1><p>从客户确认到售后复购逐项执行。每一步都可以设置截止日期、负责人和操作记录。</p></div><div><button className="workflow-print" onClick={()=>window.print()}><Printer/> 打印流程</button><button onClick={save}><Save/> 保存流程</button></div></header>
 <div className="workflow-overview">{summary.length===0?<div className="empty"><ClipboardCheck/><h3>还没有订单</h3><p>请先在“订单履约”中创建订单，再开始执行完整流程。</p></div>:summary.map(({item,done,overdue,percent})=><button key={item.id} className={selected===item.id?"active":""} onClick={()=>setSelected(item.id)}><span><b>{item.orderNo}</b><small>{item.customer}</small></span><i>{percent}%</i><em><u style={{width:`${percent}%`}}/></em><small>{done}/{template.length} 已完成{overdue?` · ${overdue} 项逾期`:""}</small></button>)}</div>
 {order&&<><section className="workflow-summary"><div><span>当前订单</span><b>{order.orderNo} · {order.customer}</b><small>{order.productSummary}</small></div><div><span>贸易条款</span><b>{order.incoterm} · {order.destination||"目的地未填"}</b><small>{order.paymentTerm}</small></div><div><span>收款</span><b>{order.currency} {order.paid.toLocaleString()} / {order.amount.toLocaleString()}</b><small>未收 {order.currency} {Math.max(0,order.amount-order.paid).toLocaleString()}</small></div></section><p className="crm-notice">{notice}</p><div className="workflow-steps">{normalize(order).map((step,index)=>{const late=!step.done&&Boolean(step.due&&step.due<today);return <article key={step.key} className={`${step.done?"done":""} ${late?"late":""}`}><button className="step-toggle" onClick={()=>toggle(step)}>{step.done?<Check/>:<Circle/>}</button><div className="step-number">{String(index+1).padStart(2,"0")}</div><div className="step-main"><header><div><h2>{step.label}</h2>{step.done&&<span>完成于 {step.completedAt?new Date(step.completedAt).toLocaleDateString("zh-CN"):today}</span>}{late&&<span className="late-label"><AlertTriangle/> 已逾期</span>}</div><ChevronDown/></header><div className="step-fields"><label>截止日期<input type="date" value={step.due||""} onChange={e=>updateStep(step.key,{due:e.target.value})}/></label><label>负责人<input value={step.owner||""} placeholder="自己 / 供应商 / 货代" onChange={e=>updateStep(step.key,{owner:e.target.value})}/></label><label className="wide">检查要点与执行记录<textarea value={step.notes||""} onChange={e=>updateStep(step.key,{notes:e.target.value})}/></label></div></div></article>})}</div></>}
 </div>;
}
