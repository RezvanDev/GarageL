import React from 'react';

export const BMWMIcon = ({ color = 'currentColor', size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 1000 353"
    fill={color}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <polygon fillOpacity="0.3" points="352.9,0 147.1,352.9 0,352.9 205.9,0 "/>
    <polygon fillOpacity="0.6" points="500,0 294.1,352.9 147.1,352.9 352.9,0 "/>
    <polygon fillOpacity="0.85" points="647.1,0 441.2,352.9 294.1,352.9 500,0 "/>
    <polygon fillOpacity="1" points="782.2,0 782.2,145.9 867.3,0 1000,0 1000,352.9 875.8,352.9 875.8,207.1 790.7,352.9 673.4,352.9 673.4,207.1 588.2,352.9 441.2,352.9 647.1,0" />
  </svg>
);
