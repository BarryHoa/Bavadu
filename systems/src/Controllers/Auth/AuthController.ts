class AuthController {
  async register(req: Request, res: Response) {
    const { username, email, password } = req.body;
  }
}

export default new AuthController();
