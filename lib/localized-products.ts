import type { Product } from "./types";
import type { Locale } from "./languages";
export function translatedProduct(product: Product, locale: Locale) {
  const custom=product.translations?.[locale];
  const terms:Record<Locale,Array<[string,string]>>={
    fr:[["Pruning Shears","Sécateur"],["Pruning Scissors","Ciseaux de taille"],["Garden Tools","Outils de jardin"],["SK5 Carbon Steel","Acier au carbone SK5"],["SK5 Steel","Acier SK5"],["Red / Silver","Rouge / Argent"],["Red/Silver","Rouge/Argent"],["Gray / Red","Gris / Rouge"],["Safety Lock","Verrou de sécurité"],["Gold-tone","Doré"],["Bypass","À coupe franche"]],
    de:[["Pruning Shears","Gartenschere"],["Pruning Scissors","Gartenschere"],["Garden Tools","Gartenwerkzeuge"],["SK5 Carbon Steel","SK5-Kohlenstoffstahl"],["SK5 Steel","SK5-Stahl"],["Red / Silver","Rot / Silber"],["Red/Silver","Rot/Silber"],["Gray / Red","Grau / Rot"],["Safety Lock","Sicherheitsverschluss"],["Gold-tone","Goldfarben"],["Bypass","Bypass"]],
    es:[["Pruning Shears","Tijeras de podar"],["Pruning Scissors","Tijeras de podar"],["Garden Tools","Herramientas de jardín"],["SK5 Carbon Steel","Acero al carbono SK5"],["SK5 Steel","Acero SK5"],["Red / Silver","Rojo / Plata"],["Red/Silver","Rojo/Plata"],["Gray / Red","Gris / Rojo"],["Safety Lock","Cierre de seguridad"],["Gold-tone","Dorado"],["Bypass","De bypass"]]
  };
  const translate=(value:string)=>terms[locale].reduce((text,[en,local])=>text.replace(new RegExp(en,"gi"),local),value);
  return {name:custom?.name?.trim()||translate(product.name),description:custom?.description?.trim()||"",material:translate(product.material),category:translate(product.category)};
}
