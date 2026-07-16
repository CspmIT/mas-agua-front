import React from 'react'
import { Box, Button } from '@mui/material'

// --- Primitivos visuales del modulo de bombeo, compartidos con el popup del diagrama ---
const STATUS_TONES = {
  success: { bg: 'rgba(16, 185, 129, 0.14)', text: '#065f46', dot: '#10b981', dBg: 'rgba(16, 185, 129, 0.22)', dText: '#6ee7b7' },
  neutral: { bg: 'rgba(148, 163, 184, 0.2)', text: '#334155', dot: '#64748b', dBg: 'rgba(148, 163, 184, 0.25)', dText: '#cbd5e1' },
  warning: { bg: 'rgba(216, 98, 29, 0.14)', text: '#7c2d12', dot: '#d8621d', dBg: 'rgba(251, 146, 60, 0.22)', dText: '#fdba74' },
  error: { bg: 'rgba(225, 29, 72, 0.14)', text: '#881337', dot: '#e11d48', dBg: 'rgba(244, 63, 94, 0.22)', dText: '#fca5a5' },
}

export const StatusChip = ({ label, tone = 'neutral', pulse = false }) => {
  const c = STATUS_TONES[tone] || STATUS_TONES.neutral
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.9,
        px: 1.5,
        py: 0.5,
        borderRadius: '999px',
        fontSize: '0.78rem',
        fontWeight: 600,
        letterSpacing: '0.01em',
        backgroundColor: c.bg,
        color: c.text,
        'body.dark &': { backgroundColor: c.dBg, color: c.dText },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: 7,
          height: 7,
          borderRadius: '50%',
          backgroundColor: c.dot,
          flexShrink: 0,
          ...(pulse && {
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              backgroundColor: c.dot,
              animation: 'statusPing 1.8s cubic-bezier(0, 0, 0.2, 1) infinite',
            },
            '@keyframes statusPing': {
              '0%': { transform: 'scale(1)', opacity: 0.55 },
              '100%': { transform: 'scale(2.6)', opacity: 0 },
            },
          }),
        }}
      />
      {label}
    </Box>
  )
}

const ACTION_VARIANTS = {
  amber: { bg: '#d8621d', hover: '#b94f15', shadow: 'rgba(216, 98, 29, 0.4)' },
  green: { bg: '#10b981', hover: '#059669', shadow: 'rgba(16, 185, 129, 0.4)' },
  red: { bg: '#e11d48', hover: '#be123c', shadow: 'rgba(225, 29, 72, 0.4)' },
}

export const ActionPill = ({ label, variant, disabled, onClick }) => {
  const v = ACTION_VARIANTS[variant] || ACTION_VARIANTS.green
  return (
    <Button
      size='small'
      disabled={disabled}
      onClick={onClick}
      disableElevation
      sx={{
        minWidth: 54,
        borderRadius: '999px',
        textTransform: 'none',
        fontWeight: 700,
        fontSize: '0.72rem',
        letterSpacing: '0.06em',
        px: 1.75,
        py: 0.6,
        color: '#ffffff',
        backgroundColor: v.bg,
        boxShadow: `0 2px 8px ${v.shadow}`,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          backgroundColor: v.hover,
          transform: 'translateY(-1px)',
          boxShadow: `0 4px 12px ${v.shadow}`,
        },
        '&:active': { transform: 'translateY(0)' },
        '&.Mui-disabled': {
          backgroundColor: 'rgba(148, 163, 184, 0.18)',
          color: 'rgba(100, 116, 139, 0.55)',
          boxShadow: 'none',
        },
        'body.dark &.Mui-disabled': {
          backgroundColor: 'rgba(75, 85, 99, 0.3)',
          color: 'rgba(156, 163, 175, 0.45)',
        },
      }}
    >
      {label}
    </Button>
  )
}
