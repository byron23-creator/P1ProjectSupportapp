class LoginUseCase {
  constructor(userRepository, authService) {
    if (!userRepository) throw new Error('LoginUseCase: userRepository is required.');
    if (!authService)    throw new Error('LoginUseCase: authService is required.');
    this.userRepository = userRepository;
    this.authService    = authService;
  }

  async execute({ email, password }) {
    if (!email || !password) {
      throw new Error('LoginUseCase: email and password are required.');
    }

    const user = await this.userRepository.findByEmail(email.trim().toLowerCase());
    if (!user) {
      throw new Error('Invalid credentials.');
    }

    const isValid = await this.authService.verifyPassword(password, user.passwordHash, user.passwordSalt);
    if (!isValid) {
      throw new Error('Invalid credentials.');
    }

    const token = await this.authService.generateToken({
      userId: user.userId,
      email:  user.email,
      role:   user.role,
    });

    return {
      token,
      user: user.toPublic(),
    };
  }
}

module.exports = { LoginUseCase };
