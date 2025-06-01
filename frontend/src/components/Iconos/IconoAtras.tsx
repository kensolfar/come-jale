import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {}

export const IconoAtras: React.FC<IconProps> = (props) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.5 16.5L4 12M4 12L8.5 7.5M4 12L20 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default IconoAtras;
