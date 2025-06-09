"use client"

import Link from "next/link";

const Topbar = () => {
  return (
    <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-[1720px] flex justify-between items-center p-5 bg-[#FCFDFD] border-b border-[#D3DBDF] z-100">
      <div className="flex items-center gap-5">
        <Link href='/'><img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749337982/Customizer_w0ruf6.png" alt="Logo" /></Link>
        <img className="cursor-pointer" src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749338157/menu_ymar4a.png" alt="menu" />
      </div>

      <div className="flex items-center gap-5">
        <button className="px-4 py-1.5 text-gray-400 text-[14px] bg-[#EBEFFA] border border-[#A7B6BE] rounded-md">Save</button>
        <img className="cursor-pointer" src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749338383/Buttons_klifkp.png" alt="user" />
      </div>
    </div>
  );
};

export default Topbar;