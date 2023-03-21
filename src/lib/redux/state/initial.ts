export type User = {
  isLogged: boolean,
  userName: string,
  identification: string,
  token: string
};

const initialUser: User = {
  isLogged: false,
  userName: '',
  identification: '',
  token: '',
};

export type Error = {
  hasGenericError: boolean,
  hasAuthenticateError: boolean
  message: string
};

const initialError:Error = {
  hasGenericError: false,
  message: '',
  hasAuthenticateError: false,
};

export type GeneralState = {
  user: User,
  error: Error
};

const initialState: GeneralState = {
  user: initialUser,
  error: initialError,
};

export default initialState;
