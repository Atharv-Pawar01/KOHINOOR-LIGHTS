import React from "react";

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-gray-800 text-white flex items-center justify-center shadow-lg h-[40px]">
      <p className="text-sm">
        &copy; {new Date().getFullYear()} Kohinoor Lights. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
