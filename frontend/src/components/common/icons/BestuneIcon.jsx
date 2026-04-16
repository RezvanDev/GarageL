import React from 'react';

export const BestuneIcon = ({ color = 'currentColor', size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    stroke={color}
    strokeWidth="6"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M 50 10 C 25 15, 15 35, 15 55 C 15 80, 50 95, 50 95 C 50 95, 85 80, 85 55 C 85 35, 75 15, 50 10 Z" />
    <path d="M 47 25 L 57 25 L 57 75 L 47 75 Z" fill={color} stroke="none" />
    <path d="M 37 40 L 47 25 L 57 25 L 47 40 Z" fill={color} stroke="none" />
  </svg>
);
