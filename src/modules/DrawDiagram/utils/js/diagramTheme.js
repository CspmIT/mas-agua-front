const primaryGradient = 'linear-gradient(135deg, #5ea5f0 0%, #2c6aa0 100%)';
const primaryGradientBright = 'linear-gradient(135deg, #7fc3f7 0%, #368bed 100%)';
const dangerGradient = 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)';
const primaryShadow = '0 4px 14px rgba(94, 165, 240, 0.35)';
const primaryShadowHover = '0 8px 24px rgba(94, 165, 240, 0.45)';
const dangerShadow = '0 4px 14px rgba(239, 68, 68, 0.35)';
const dangerShadowHover = '0 8px 24px rgba(239, 68, 68, 0.45)';
const navbarBg = 'linear-gradient(90deg, #2c6aa0 0%, #1f4e79  50%, #1f4e79  100%)';
const sidebarBg = 'linear-gradient(180deg, #2c6aa0 0%, #1f4e79  50%, #1f4e79  100%)';

export const panelShellSx = {
  borderRadius: '12px',
  border: '1px solid #1f4e79',
  backgroundColor: '#f8fafc',
  'body.dark &': {
    border: '1px solid rgba(255, 255, 255, 0.06)',
    backgroundColor: 'rgba(17, 24, 39, 0.85)',
  },
};

export const floatingPanelSx = {
  ...panelShellSx,
  boxShadow: '0 10px 30px rgba(15, 42, 68, 0.18)',
  'body.dark &': {
    ...panelShellSx['body.dark &'],
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
  },
};

export const navbarShellSx = {
  borderRadius: '12px 12px 0 0',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  background: navbarBg,
  color: '#f8fafc',
};

export const sidebarShellSx = {
  borderRight: '1px solid rgba(255, 255, 255, 0.1)',
  background: sidebarBg,
  color: '#f8fafc',
};

export const canvasAreaSx = {
  background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
  'body.dark &': {
    background:
      'linear-gradient(180deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
  },
};

export const primaryPillSx = {
  borderRadius: '999px',
  textTransform: 'none',
  fontWeight: 500,
  px: 1.75,
  py: 0.5,
  minHeight: 0,
  fontSize: '0.78rem',
  background: primaryGradient,
  boxShadow: primaryShadow,
  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
  '&:hover': {
    background: primaryGradient,
    boxShadow: primaryShadowHover,
    transform: 'translateY(-1px)',
  },
  '&:active': { transform: 'translateY(0)' },
};

export const ghostPillSx = {
  borderRadius: '999px',
  textTransform: 'none',
  fontWeight: 500,
  px: 1.75,
  py: 0.5,
  minHeight: 0,
  fontSize: '0.78rem',
  borderColor: 'rgba(15, 42, 68, 0.14)',
  color: '#475569',
  '&:hover': {
    borderColor: '#2c6aa0',
    backgroundColor: 'rgba(44, 106, 160, 0.06)',
  },
  'body.dark &': {
    borderColor: 'rgba(255,255,255,0.14)',
    color: '#cbd5e1',
    '&:hover': {
      borderColor: '#5ea5f0',
      backgroundColor: 'rgba(94, 165, 240, 0.1)',
    },
  },
};

export const iconButtonPrimarySx = {
  width: 40,
  height: 40,
  borderRadius: '10px',
  color: '#ffffff',
  background: primaryGradient,
  boxShadow: primaryShadow,
  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
  '&:hover': {
    background: primaryGradient,
    boxShadow: primaryShadowHover,
    transform: 'translateY(-1px)',
  },
  '&:active': { transform: 'translateY(0)' },
  '&.Mui-disabled': {
    background: 'rgba(100, 116, 139, 0.3)',
    color: 'rgba(255, 255, 255, 0.5)',
    boxShadow: 'none',
  },
};

export const iconButtonGhostSx = {
  width: 40,
  height: 40,
  borderRadius: '10px',
  color: '#475569',
  backgroundColor: 'transparent',
  border: '1px solid rgba(15, 42, 68, 0.12)',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: '#2c6aa0',
    color: '#2c6aa0',
    backgroundColor: 'rgba(44, 106, 160, 0.06)',
  },
  'body.dark &': {
    color: '#cbd5e1',
    borderColor: 'rgba(255, 255, 255, 0.14)',
    '&:hover': {
      borderColor: '#5ea5f0',
      color: '#5ea5f0',
      backgroundColor: 'rgba(94, 165, 240, 0.1)',
    },
  },
};

export const iconButtonToggledSx = {
  ...iconButtonPrimarySx,
  background: 'linear-gradient(135deg, #1f4e79 0%, #0f2a44 100%)',
  boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.25)',
  '&:hover': {
    background: 'linear-gradient(135deg, #1f4e79 0%, #0f2a44 100%)',
    boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.3)',
  },
};

export const iconButtonDangerSx = {
  ...iconButtonPrimarySx,
  background: dangerGradient,
  boxShadow: dangerShadow,
  '&:hover': {
    background: dangerGradient,
    boxShadow: dangerShadowHover,
    transform: 'translateY(-1px)',
  },
};

export const toolbarDividerSx = {
  height: 28,
  alignSelf: 'center',
  mx: 0.5,
  borderColor: 'rgba(15, 42, 68, 0.12)',
  'body.dark &': {
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
};

export const iconButtonOnDarkSx = {
  width: 40,
  height: 40,
  borderRadius: '10px',
  color: '#f8fafc',
  border: '1px solid rgba(255, 255, 255, 0.35)',
  backgroundColor: 'transparent',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: '#ffffff',
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
};

export const iconButtonOnDarkPrimarySx = {
  width: 40,
  height: 40,
  borderRadius: '10px',
  color: '#ffffff',
  background: 'linear-gradient(135deg, #5ea5f0 0%, #368bed 100%)',
  boxShadow:
    '0 4px 14px rgba(54, 139, 237, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #5ea5f0 0%, #368bed 100%)',
    boxShadow:
      '0 8px 24px rgba(54, 139, 237, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
    transform: 'translateY(-1px)',
  },
  '&:active': { transform: 'translateY(0)' },
};

export const iconButtonSaveSx = {
  width: 40,
  height: 40,
  borderRadius: '10px',
  color: '#ffffff',
  background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
  boxShadow: '0 4px 14px rgba(5, 150, 105, 0.45)',
  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
    boxShadow: '0 8px 24px rgba(5, 150, 105, 0.6)',
    transform: 'translateY(-1px)',
  },
  '&:active': { transform: 'translateY(0)' },
};

export const iconButtonOnDarkToggledSx = {
  width: 40,
  height: 40,
  borderRadius: '10px',
  color: '#ffffff',
  background: 'linear-gradient(135deg, #5ea5f0 0%, #368bed 100%)',
  borderColor: 'transparent',
  boxShadow:
    '0 4px 14px rgba(54, 139, 237, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
  '&:hover': {
    background: 'linear-gradient(135deg, #5ea5f0 0%, #368bed 100%)',
    boxShadow:
      '0 6px 18px rgba(54, 139, 237, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
  },
};

export const toolbarDividerOnDarkSx = {
  height: 28,
  alignSelf: 'center',
  mx: 0.5,
  border: 'none',
  width: '1px',
  background:
    'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)',
};

export const panelTitleClass =
  'text-sm font-semibold tracking-tight text-slate-800 dark:text-gray-100';

export const panelLabelClass =
  'text-xs font-medium text-slate-600 dark:text-gray-400';
