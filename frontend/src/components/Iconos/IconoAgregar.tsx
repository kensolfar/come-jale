import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {}

export const IconoAgregar: React.FC<IconProps> = (props) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3V12M12 21V12M12 12H21M12 12H3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default IconoAgregar;
