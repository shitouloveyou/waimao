import { getProducts } from "@/lib/store";
import Storefront from "./storefront";

export const dynamic = "force-dynamic";

export default async function Home() {
  return <Storefront initialProducts={await getProducts()} />;
}
