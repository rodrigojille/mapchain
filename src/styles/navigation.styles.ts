import { createStyles } from '@mantine/styles';

export const useStyles = createStyles((theme) => ({
  header: {
    backgroundColor: theme.fn.rgba(theme.colors.dark[8], 0.95),
    backdropFilter: 'blur(10px)',
    borderBottom: `1px solid ${theme.fn.rgba(theme.colors.gray[8], 0.5)}`,
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },

  inner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
    padding: `0 ${theme.spacing.md}`,

    [theme.fn.smallerThan('sm')]: {
      justifyContent: 'flex-start',
    },
  },

  links: {
    [theme.fn.largerThan('sm')]: {
      width: 'auto',
    },

    [theme.fn.smallerThan('sm')]: {
      display: 'none',
    },
  },

  burger: {
    marginRight: theme.spacing.md,

    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },

  dropdown: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 0,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    borderTopWidth: 0,
    overflow: 'hidden',
    backgroundColor: theme.fn.rgba(theme.colors.dark[8], 0.95),
    backdropFilter: 'blur(10px)',
    padding: theme.spacing.sm,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xs,

    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },

  link: {
    lineHeight: 1,
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.radius.sm,
    textDecoration: 'none',
    color: theme.colors.gray[3],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,
    transition: 'all 150ms ease',

    '&:hover': {
      backgroundColor: theme.fn.rgba(theme.white, 0.05),
      color: theme.white,
    },
  },

  linkActive: {
    '&, &:hover': {
      backgroundColor: theme.fn.rgba(theme.white, 0.1),
      color: theme.fn.primaryColor(),
    },
  },

  user: {
    color: theme.colors.gray[3],
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.radius.sm,
    transition: 'all 150ms ease',

    '&:hover': {
      backgroundColor: theme.fn.rgba(theme.white, 0.05),
      color: theme.white,
    },
  },

  userActive: {
    backgroundColor: theme.fn.rgba(theme.white, 0.1),
  },

  logo: {
    fontSize: 24,
    fontWeight: 900,
    textDecoration: 'none',
    background: theme.fn.linearGradient(45, '#00ff87', '#60efff'),
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    transition: 'transform 150ms ease',

    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
}));
