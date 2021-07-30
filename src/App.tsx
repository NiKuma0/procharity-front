import { Container, CssBaseline, ThemeProvider } from '@material-ui/core';
import { createMuiTheme } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Redirect, Route, Switch, useHistory } from 'react-router-dom';
import ky from 'ky';
import AuthForm, { LoginFormValues } from './pages/AuthForm/AuthForm';
import Header from './components/Header/Header';
import Dashboard, { UserData, UsersTableData } from './pages/Dashboard/Dashboard';
import RegisterForm, { RegisterFormValues } from './pages/RegisterForm/RegisterForm';
import ResetPassword, { ResetPasswordFormValues } from './pages/ResetPassword/ResetPassword';
import { themeLight, themeDark } from './App.theme';
import useLocalStorage from './hooks/useLocalStorage';
import RichTextEditor, { RichTextEditorFormValues } from './pages/RichTextEditor/RichTextEditor';
import useStyles from './App.styles';
import Invite, { InviteFormValues } from './pages/Invite/Invite';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Users from './pages/Users/Users';

interface StatusI<Data> {
  status: string;
  statusMessage: null | string;
  isStatusLabelOpen: boolean;
  data: Data | null;
}

function App() {
  const history = useHistory();
  const [themeColor, setThemeColor] = useLocalStorage<boolean>('theme', true);
  const [userToken, setUserToken] = useLocalStorage<string | boolean>('user', false);
  const [refreshToken, setRefreshToken] = useLocalStorage<string | boolean>('refresh_token', false);
  const removeToken = () => {
    setUserToken(false);
    setRefreshToken(false);
  };
  const [status, setStatus] = useState<StatusI<UserData | UsersTableData>>({
    status: 'idle',
    statusMessage: null,
    isStatusLabelOpen: false,
    data: null,
  });

  const handleCloseError = () => setStatus({ ...status, statusMessage: null, isStatusLabelOpen: false });

  const getUsers = async () => {
    try {
      const response = await ky(`${process.env.REACT_APP_API_ADDRESS}/analytics/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        throwHttpErrors: false,
        retry: {
          limit: 2,
          methods: ['get'],
          statusCodes: [401],
        },
        hooks: {
          beforeRetry: [
            // eslint-disable-next-line consistent-return
            async ({ request, options, error, retryCount }) => {
              if (retryCount === 1) {
                setUserToken(false);
                setRefreshToken(false);
                history.push('/');
                return ky.stop;
              }
            },
          ],
          afterResponse: [
            // eslint-disable-next-line consistent-return
            async (request, options, res) => {
              if (res.status === 401) {
                const resp = await ky.post(`${process.env.REACT_APP_API_ADDRESS}/auth/token_refresh/`, {
                  headers: {
                    Authorization: `Bearer ${refreshToken}`,
                  },
                });

                if (resp.status === 200) {
                  const token = await resp.json();
                  request.headers.set('Authorization', `Bearer ${token.access_token}`);
                  setUserToken(token.access_token as string);
                  setRefreshToken(token.refresh_token as string);
                  return ky(request);
                }
                if (resp.status === 401) {
                  setUserToken(false);
                  setRefreshToken(false);
                  history.push('/');
                }
              }
            },
          ],
        },
      });

      if (response.status === 200) {
        const userData: UserData = (await response.json()) as UserData;

        return userData;
      }
      const error = await response.json();

      throw new Error(error.message);
    } catch (e: any) {
      return Promise.reject(e.message);
    }
  };

  const getUsersData = async (page: number, limit: number) => {
    try {
      setStatus({ ...status, status: 'pending' });
      const response = await ky(`${process.env.REACT_APP_API_ADDRESS}/users/?page=${page}&limit=${limit}`, {
        retry: {
          limit: 2,
          methods: ['get'],
          statusCodes: [401],
        },
        hooks: {
          beforeRetry: [
            // eslint-disable-next-line consistent-return
            async ({ request, options, error, retryCount }) => {
              if (retryCount === 1) {
                setUserToken(false);
                setRefreshToken(false);
                history.push('/');
                return ky.stop;
              }
            },
          ],
          afterResponse: [
            // eslint-disable-next-line consistent-return
            async (request, options, res) => {
              if (res.status === 401) {
                const resp = await ky.post(`${process.env.REACT_APP_API_ADDRESS}/auth/token_refresh/`, {
                  headers: {
                    Authorization: `Bearer ${refreshToken}`,
                  },
                });

                if (resp.status === 200) {
                  const token = await resp.json();
                  request.headers.set('Authorization', `Bearer ${token.access_token}`);
                  setUserToken(token.access_token as string);
                  setRefreshToken(token.refresh_token as string);
                  return ky(request);
                }
                if (resp.status === 401) {
                  setUserToken(false);
                  setRefreshToken(false);
                  history.push('/');
                }
              }
            },
          ],
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('user') ?? '')}`,
        },
      });

      if (response.status === 200) {
        const userData = (await response.json()) as UsersTableData;
        return userData;
      }
      const error = await response.json();

      throw new Error(error);
    } catch (e: any) {
      return Promise.reject(e.message);
    }
  };

  const onInvite = async (data: InviteFormValues) => {
    try {
      const response = await ky.post(`${process.env.REACT_APP_API_ADDRESS}/auth/invitation/`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
        throwHttpErrors: false,
      });

      if (response.status === 200) {
        const result = (await response.json()) as { message: string };

        return result;
      }
      const error = await response.json();
      throw new Error(error.message);
    } catch (e: any) {
      return Promise.reject(e);
    }
  };

  const onLogin = async (data: LoginFormValues) => {
    try {
      const response = await ky.post(`${process.env.REACT_APP_API_ADDRESS}/auth/login/`, {
        json: {
          ...data,
        },
        throwHttpErrors: false,
      });

      if (response.status === 200) {
        const token: { access_token: string; refresh_token: string } = await response.json();
        setUserToken(token.access_token);
        setRefreshToken(token.refresh_token);
        history.push('/dashboard');
        return Promise.resolve();
      }
      const error = await response.json();
      throw new Error(error.message);
    } catch (e: any) {
      return Promise.reject(e);
    }
  };

  const onResetPassword = async (data: ResetPasswordFormValues) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_ADDRESS}/auth/password_reset/`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      });

      if (response.status === 200) {
        const result = await response.json();
        return result;
      }
      const error = await response.json();
      throw new Error(error.message);
    } catch (e: any) {
      return Promise.reject(e);
    }
  };

  const onSubmitMessage = async (data: RichTextEditorFormValues) => {
    const stripTags = data.message.replace(/(<p[^>]+?>|<p>)/gim, '');
    const replaceEnclosedTag = stripTags.replace(/(<br[^>]+?>|<br>|<\/p>)/gim, '\n');
    const normalizedData = { message: replaceEnclosedTag };
    try {
      const response = await ky.post(`${process.env.REACT_APP_API_ADDRESS}/send_telegram_notification/`, {
        json: {
          has_mailing: data.has_mailing,
          ...normalizedData,
        },
        retry: {
          limit: 2,
          methods: ['post'],
          statusCodes: [401],
        },
        throwHttpErrors: false,
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        hooks: {
          afterResponse: [
            // eslint-disable-next-line consistent-return
            async (request, options, res) => {
              if (res.status === 401) {
                const resp = await ky.post(`${process.env.REACT_APP_API_ADDRESS}/auth/token_refresh/`, {
                  headers: {
                    Authorization: `Bearer ${refreshToken}`,
                  },
                });
                const token = await resp.json();

                request.headers.set('Authorization', `Bearer ${token.access_token}`);
                if (resp.status === 200) {
                  setUserToken(token.access_token as string);
                  setRefreshToken(token.refresh_token as string);
                  return ky(request);
                }
                history.push('/');
              }
            },
          ],
        },
      });
      if (response.status === 200) {
        const result = await response.json();
        return result;
      }
      const error = await response.json();
      throw new Error(error.message);
    } catch (e: any) {
      return Promise.reject(e.message);
    }
  };

  const onRegister = async (data: RegisterFormValues, params: { id: string }) => {
    try {
      const dataForRegistration = data;
      delete dataForRegistration?.passwordConfirmation;
      const response = await ky.post(`${process.env.REACT_APP_API_ADDRESS}/auth/register/`, {
        json: {
          ...data,
          token: params.id,
        },
        throwHttpErrors: false,
      });

      if (response.status === 200) {
        history.push('/');
        return Promise.resolve();
      }
      const error = await response.json();
      throw new Error(error.message);
    } catch (e: any) {
      return Promise.reject(e);
    }
  };

  const handleSetTheme = () => {
    setThemeColor(!themeColor);
  };

  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const handleDrawerOpen = () => {
    setMenuOpen(true);
  };

  const handleDrawerClose = () => {
    setMenuOpen(false);
  };
  const classes = useStyles();
  useEffect(() => {
    const handleSetThemeLocal = () => {
      setThemeColor(themeColor);
    };
    if (localStorage.getItem('theme') === null) {
      handleSetThemeLocal();
    }
  }, [setThemeColor, themeColor]);
  const theme = themeColor ? themeDark : themeLight;

  const themeOptions = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          ...theme.palette,
        },
        overrides: {
          MuiFormHelperText: {
            root: {
              position: 'absolute',
              bottom: '-19px',
              whiteSpace: 'nowrap',
              margin: 0,
              textAlign: 'left',
            },
            contained: {
              marginLeft: '0',
              marginRight: 0,
            },
          },
          MuiOutlinedInput: {
            input: {
              '&:-webkit-autofill': {
                transitionDelay: '9999s',
                '-webkit-text-fill-color': themeColor ? '#fff' : 'black',
              },
            },
            notchedOutline: {
              borderColor: themeColor ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.2)',
            },
          },
          MuiButton: {
            root: {
              cursor: 'pointer',
              width: '120px',
              minHeight: '44px',
              backgroundPosition: 'center',
              border: 'none',
              padding: '0',
              '&:hover': {
                backgroundColor: !themeColor ? '#303f9f' : '#8852E1',
              },
            },
          },
          MuiIconButton: {
            root: {
              '&.Mui-disabled': {
                filter: 'contrast(0)',
              },
            },
            disabled: {},
          },
          MuiSvgIcon: {
            root: {
              fill: themeColor ? 'white' : 'black',
            },
          },
          MuiTextField: {
            root: {
              '&:hover': {
                borderColor: '#8852E1',
              },
            },
          },
          MuiLink: {
            root: {
              filter: themeColor ? 'brightness(1.5)' : 'brightness(1.0)',
            },
          },
          MuiContainer: {
            root: {
              width: '100%',
              maxWidth: '100%',
              paddingLeft: 0,
              paddingRight: 0,
              marginLeft: 0,
              marginRight: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              '@media (min-width: 600px)': {
                paddingLeft: 0,
                paddingRight: 0,
              },
            },
            maxWidthLg: {
              width: '100%',
              maxWidth: '100%',
              '@media (min-width: 1280px)': {
                width: '100%',
                maxWidth: '100%',
              },
            },
          },
          MuiCssBaseline: {
            '@global': {
              body: {
                overflow: 'auto',
                backgroundColor: themeColor ? '#06091F' : '#f9f9f9',
              },
            },
          },
        },
      }),
    [theme.palette, themeColor],
  );

  return (
    <ThemeProvider theme={themeOptions}>
      <CssBaseline />

      <Container>
        <Header
          isMenuOpen={isMenuOpen}
          isDark={themeColor}
          removeToken={removeToken}
          handleSetTheme={handleSetTheme}
          handleDrawerOpen={handleDrawerOpen}
          handleDrawerClose={handleDrawerClose}
          handleCloseError={handleCloseError}
        />

        <Switch>
          <Route exact path="/">
            {/* <StatusLabel
              isStatusLabelOpen={isStatusLabelOpen}
              statusMessage={statusMessage}
              isError={requestStatus}
              handleCloseError={handleCloseError}
            /> */}
            {!userToken ? <AuthForm onLogin={onLogin} /> : <Redirect exact from="/" to="/dashboard" />}
          </Route>

          <ProtectedRoute
            condition={userToken}
            component={
              <main
                className={clsx(classes.content, {
                  [classes.contentShift]: isMenuOpen,
                })}>
                <Dashboard fetchUserStats={getUsers} />
              </main>
            }
            path="/dashboard"
          />
          <ProtectedRoute
            condition={userToken}
            component={
              <main
                className={clsx(classes.content, {
                  [classes.contentShift]: isMenuOpen,
                })}>
                <RichTextEditor onSubmit={onSubmitMessage} />
              </main>
            }
            path="/send"
          />
          <ProtectedRoute
            condition={userToken}
            component={
              <main
                className={clsx(classes.content, {
                  [classes.contentShift]: isMenuOpen,
                })}>
                <Users fetchUserData={getUsersData} />
              </main>
            }
            path="/users"
          />
          <ProtectedRoute
            condition={userToken}
            component={
              <main
                className={clsx(classes.content, {
                  [classes.contentShift]: isMenuOpen,
                })}>
                <Invite onSubmit={onInvite} />
              </main>
            }
            path="/invite"
          />
          {/* <Route path="/invite">
            <main
              className={clsx(classes.content, {
                [classes.contentShift]: isMenuOpen,
              })}>
              <Invite onSubmit={onInvite} />
            </main>
          </Route> */}

          <Route path="/register/:id">
            <RegisterForm onSubmit={onRegister} />
          </Route>
          <Route path="/reset_password">
            <ResetPassword onSubmit={onResetPassword} />
          </Route>
          <Redirect to="/" />
        </Switch>
      </Container>
    </ThemeProvider>
  );
}

export default App;
