import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  form: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    width: '98%',
    gap: 20,
    marginTop: 90,
  },
  radioButtonGroup: {
    display: 'flex',
    gap: 20,
    flexDirection: 'row',
    textAlign: 'left',
  },
  statusInfo: {
    position: 'absolute',
    top: 70,
  },
  authFormButton: {
    cursor: 'pointer',
    top: '8px',
    right: '12px',
    width: '120px',
    minHeight: '44px',
    backgroundPosition: 'center',
    color: 'white',
    background: theme.palette.secondary.main,
    border: 'none',
    padding: '0',
  },

  quill: {
    width: '100%',
    minHeight: '150px',
    '& a': {
      color: '#06c!important',
    },
    '& span': {
      color: 'inherit!important',
    },
    '& .ql-container': {
      minHeight: '150px',
    },
    '& .ql-fill': {
      fill: theme.palette.type === 'dark' ? 'white' : 'black',
      color: theme.palette.type === 'dark' ? 'white' : 'black',
    },
    '& .ql-snow': {
      fill: theme.palette.type === 'dark' ? 'white' : 'black',
      color: theme.palette.type === 'dark' ? 'white' : 'black',
    },
    '& .ql-stroke': {
      stroke: theme.palette.type === 'dark' ? 'white' : 'black',
      color: theme.palette.type === 'dark' ? 'white' : 'black',
    },
    '& .ql-picker-label': {
      color: theme.palette.type === 'dark' ? 'white' : 'black',
    },
  },
}));

export default useStyles;