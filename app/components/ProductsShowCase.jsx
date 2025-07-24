import React from 'react'
import { useRouter } from "next/navigation";

const ProductsShowCase = ({ products }) => {

    const router = useRouter();
    return (
        <>
            <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
                <div className="flex items-center justify-between px-6 py-3 max-w-[1720px] mx-auto">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749337982/Customizer_w0ruf6.png" alt="" />
                            <button
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                aria-label="Toggle Sidebar"
                            >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749338383/Buttons_klifkp.png" alt="" />
                </div>
            </div>

            <div className="flex justify-center items-center min-h-screen pt-24 pb-8 px-2">
                <div className="w-full max-w-7xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="p-3 border rounded cursor-pointer w-full max-w-xs bg-white transition hover:shadow-lg flex flex-col items-center"
                                onClick={() => router.push(`/customizer/${product.id}`)}
                            >
                                <img src={product.image} alt={product.description} className="w-full h-44 object-contain" />
                                <div className="mt-2 text-center">
                                    <p className="font-semibold text-sm">{product.description}</p>
                                    <p className="text-xs text-gray-500">Size: {product.size}</p>
                                    <p className="text-xs text-gray-500">Color: {product.color}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProductsShowCase