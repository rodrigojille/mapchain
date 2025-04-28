import React from 'react';
import { Box } from '@mantine/core';

interface LogoProps {
  size?: number;
  color?: string;
}

export default function Logo({ size = 40, color }: LogoProps) {
  return (
    <Box
      sx={(theme) => ({
        width: size,
        height: size,
        borderRadius: size / 5,
        background: `linear-gradient(135deg, ${theme.colors.blue[6]} 0%, ${theme.colors.indigo[9]} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: theme.shadows.md,
      })}
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2L2 7L12 12L22 7L12 2Z"
          fill="white"
        />
        <path
          d="M2 17L12 22L22 17"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 12L12 17L22 12"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
}
