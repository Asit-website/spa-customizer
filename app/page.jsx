"use client";

import { useState, useEffect } from "react";
import ProductsShowCase from "./components/ProductsShowCase";
import { backendProducts } from "./productsData"; 

export default function Home() {

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const paragraph = `Discover high-quality customizable mockups at Pacdora,
  including packaging mockups like boxes and bottles,
  apparel mockups like T-shirts and hoodies, and iPhone mockups.`;

  if (!isClient) return null;

  return (
    <>
      <ProductsShowCase products={backendProducts} />
    </>
  );
}
