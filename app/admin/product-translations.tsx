"use client";
import type {Product} from "@/lib/types";
export default function ProductTranslations({product,onChange}:{product:Product;onChange:(value:Product["translations"])=>void}){
  return <details className="product-seo"><summary>多语言产品文案（法语 / 德语 / 西班牙语，选填）</summary><p>各语言共用产品和图片。名称、介绍可单独填写；留空时名称使用术语翻译，原始英文技术资料仍可查看。修改后保存产品。</p>{([["fr","法语"],["de","德语"],["es","西班牙语"]]as const).map(([code,label])=><div className="admin-grid" key={code}><label>{label}产品名称<input lang={code} value={product.translations?.[code]?.name||""} onChange={e=>onChange({...product.translations,[code]:{...product.translations?.[code],name:e.target.value}})} maxLength={200}/></label><label className="wide">{label}产品介绍<textarea lang={code} value={product.translations?.[code]?.description||""} onChange={e=>onChange({...product.translations,[code]:{...product.translations?.[code],description:e.target.value}})} maxLength={10000}/></label></div>)}</details>;
}
