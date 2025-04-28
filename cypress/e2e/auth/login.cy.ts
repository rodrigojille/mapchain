describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display login form', () => {
    cy.contains('h1', 'Login to MapChain');
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="password"]').should('exist');
    cy.contains('button', 'Login').should('exist');
  });

  it('should display validation errors for empty fields', () => {
    cy.contains('button', 'Login').click();
    cy.contains('Email is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
  });

  it('should navigate to register page', () => {
    cy.contains('a', 'Register').click();
    cy.url().should('include', '/register');
  });

  it('should login with valid credentials', () => {
    // Mock the login API response
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'PROPERTY_OWNER'
        },
        token: 'fake-jwt-token'
      }
    }).as('loginRequest');

    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.contains('button', 'Login').click();

    cy.wait('@loginRequest');
    cy.url().should('include', '/dashboard');
  });

  it('should display error message for invalid credentials', () => {
    // Mock the login API response for invalid credentials
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: {
        message: 'Invalid email or password'
      }
    }).as('loginRequest');

    cy.get('input[name="email"]').type('wrong@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.contains('button', 'Login').click();

    cy.wait('@loginRequest');
    cy.contains('Invalid email or password').should('be.visible');
  });

  it('should login with wallet', () => {
    // Mock the wallet connection and authentication
    cy.window().then((win: any) => {
      // Mock the wallet connection
      win.ethereum = {
        request: cy.stub().resolves('0x1234567890abcdef1234567890abcdef12345678'),
        on: cy.stub(),
        removeListener: cy.stub()
      };
    });

    // Mock the wallet login API response
    cy.intercept('POST', '/api/auth/wallet-login', {
      statusCode: 200,
      body: {
        user: {
          id: '2',
          walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
          name: 'Wallet User',
          role: 'PROPERTY_OWNER'
        },
        token: 'fake-jwt-token'
      }
    }).as('walletLoginRequest');

    cy.contains('button', 'Connect Wallet').click();
    cy.wait('@walletLoginRequest');
    cy.url().should('include', '/dashboard');
  });
});
