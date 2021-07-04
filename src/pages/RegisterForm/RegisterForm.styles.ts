import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  authForm: {
    display: 'flex',
    maxWidth: '314px',
    margin: '60px 0 0 0',
    flexDirection: 'column',
    border: 'none',
    padding: '0',
    width: '288px',
    gap: 20,
    alignItems: 'center',
  },

  authFormInputContainer: {
    position: 'relative',
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 35,
    width: '100%',
    border: 'none',
  },

  authFormSubmitContainer: {
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
  },
  authFormRegisterError: {
    display: 'grid',
    placeItems: 'center',
  },
  authFormButtonContainer: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  },

  authFormButton: {
    cursor: 'pointer',
    width: '100%',
    maxWidth: '230px',
    minHeight: '44px',
    backgroundPosition: 'center',
    background: theme.palette.secondary.main,
    border: 'none',
    padding: '0',
  },

  authFormInput: {
    backgroundColor: theme.palette.background.paper,
    filter: 'none',
    borderColor: 'transparent',
    borderRadius: '4px',
    border: 'none',
    width: '100%',
    color: '#ffff',
    position: 'relative',

    '& input:-webkit-autofill': {
      '-webkit-box-shadow': `0 0 0px 1000px #4040 inset`,
      transitionDelay: '9999s',
    },
  },
}));

export default useStyles;
