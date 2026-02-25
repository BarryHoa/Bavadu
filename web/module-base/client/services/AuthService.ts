import ClientHttpService from "./ClientHttpService";

export interface LoginParams {
  username: string;
  password: string;
  rememberMe?: boolean;
}

/** Response data khi login thành công (trùng với server) */
export interface LoginSuccessData {
  user: {
    id: string;
    username: string | null;
    avatar: string | null;
  };
}

/** Response body khi logout thành công (trùng với server) */
export interface LogoutSuccessData {
  message?: string;
}

class AuthService extends ClientHttpService {
  constructor() {
    super("/api/base/auth");
  }

  /**
   * POST /api/base/auth/login
   * @returns { data: { user: { id, username, avatar } } } khi thành công
   * @throws Error khi 4xx/5xx (message từ ClientHttpService)
   */
  async login(params: LoginParams): Promise<{ data: LoginSuccessData }> {
    return this.post<{ data: LoginSuccessData }>("login", {
      username: params.username.trim(),
      password: params.password.trim(),
      rememberMe: params.rememberMe ?? false,
    });
  }

  /**
   * POST /api/base/auth/logout
   * @returns { message: string } khi thành công
   * @throws Error khi 5xx
   */
  async logout(): Promise<LogoutSuccessData> {
    return this.post<LogoutSuccessData>("logout");
  }
}

export default AuthService;
