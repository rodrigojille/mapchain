describe('Register Page', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('should display registration form', () => {
    cy.contains('h1', 'Create an Account');
    cy.get('input[name="name"]').should('exist');
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="password"]').should('exist');
    cy.get('input[name="confirmPassword"]').should('exist');
    cy.contains('button', 'Register').should('exist');
  });

  it('should display validation errors for empty fields', () => {
    cy.contains('button', 'Register').click();
    cy.contains('Name is required').should('be.visible');
    cy.contains('Email is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
  });

  it('should navigate to login page', () => {
    cy.contains('a', 'Login').click();
    cy.url().should('include', '/login');
  });

  it('should register with valid information', () => {
    // Mock the registration API response
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 201,
      body: {
        user: {
          id: '1',
          email: 'newuser@example.com',
          name: 'New User',
          role: 'PROPERTY_OWNER'
        },
        token: 'fake-jwt-token'
      }
    }).as('registerRequest');

    cy.get('input[name="name"]').type('New User');
    cy.get('input[name="email"]').type('newuser@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password123');
    cy.get('select[name="role"]').select('PROPERTY_OWNER');
    cy.contains('button', 'Register').click();

    cy.wait('@registerRequest');
    cy.url().should('include', '/dashboard');
  });

  it('should display error for password mismatch', () => {
    cy.get('input[name="name"]').type('New User');
    cy.get('input[name="email"]').type('newuser@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('differentpassword');
    cy.contains('button', 'Register').click();

    cy.contains('Passwords do not match').should('be.visible');
  });

  it('should display error for existing email', () => {
    // Mock the registration API response for existing email
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 409,
      body: {
        message: 'Email already exists'
      }
    }).as('registerRequest');

    cy.get('input[name="name"]').type('Existing User');
    cy.get('input[name="email"]').type('existing@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password123');
    cy.get('select[name="role"]').select('PROPERTY_OWNER');
    cy.contains('button', 'Register').click();

    cy.wait('@registerRequest');
    cy.contains('Email already exists').should('be.visible');
  });

  it('should register with wallet', () => {
    // Mock the wallet connection
    cy.window().then((win: any) => {
      win.ethereum = {
        request: cy.stub().resolves('0x1234567890abcdef1234567890abcdef12345678'),
        on: cy.stub(),
        removeListener: cy.stub()
      };
    });

    // Mock the wallet registration API response
    cy.intercept('POST', '/api/auth/wallet-register', {
      statusCode: 201,
      body: {
        user: {
          id: '2',
          walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
          name: 'Wallet User',
          role: 'PROPERTY_OWNER'
        },
        token: 'fake-jwt-token'
      }
    }).as('walletRegisterRequest');

    cy.contains('button', 'Register with Wallet').click();
    
    // Fill in the name and role after wallet connection
    cy.get('input[name="name"]').type('Wallet User');
    cy.get('select[name="role"]').select('PROPERTY_OWNER');
    cy.contains('button', 'Complete Registration').click();
    
    cy.wait('@walletRegisterRequest');
    cy.url().should('include', '/dashboard');
  });
});
