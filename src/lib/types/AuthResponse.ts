export type authResponse = {
  token: string | null
  isAdmin?: boolean,
  id?:number,
  userName?: string
};
