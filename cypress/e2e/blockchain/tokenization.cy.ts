describe('Property Tokenization', () => {
  beforeEach(() => {
    // Login before each test
    cy.window().then((win) => {
      win.localStorage.setItem('mapchain-token', 'fake-jwt-token');
      win.localStorage.setItem('mapchain-user', JSON.stringify({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'PROPERTY_OWNER'
      }));
    });
    
    cy.visit('/properties/tokenize');
  });

  it('should display the tokenization form', () => {
    cy.contains('h1', 'Tokenize Your Property');
    cy.get('input[name="propertyName"]').should('exist');
    cy.get('input[name="propertySymbol"]').should('exist');
    cy.get('input[name="propertyValue"]').should('exist');
    cy.get('input[name="totalTokens"]').should('exist');
    cy.contains('button', 'Tokenize Property').should('exist');
  });

  it('should validate the tokenization form', () => {
    cy.contains('button', 'Tokenize Property').click();
    cy.contains('Property name is required').should('be.visible');
    cy.contains('Property symbol is required').should('be.visible');
    cy.contains('Property value is required').should('be.visible');
    cy.contains('Total tokens is required').should('be.visible');
  });

  it('should create a property token successfully', () => {
    // Mock the Hedera service response
    cy.intercept('POST', '/api/blockchain/tokenize', {
      statusCode: 200,
      body: {
        success: true,
        tokenId: '0.0.123456',
        transactionId: '0.0.12345@1234567890.000000000',
        receipt: {
          status: 'SUCCESS'
        }
      }
    }).as('tokenizeRequest');

    // Fill the form
    cy.get('input[name="propertyName"]').type('Luxury Villa');
    cy.get('input[name="propertySymbol"]').type('LVILLA');
    cy.get('input[name="propertyValue"]').type('1000000');
    cy.get('input[name="totalTokens"]').type('1000');
    cy.get('textarea[name="propertyDescription"]').type('Beautiful luxury villa with ocean view');
    
    // Upload property image
    cy.get('input[type="file"]').attachFile('property-image.jpg');
    
    // Submit the form
    cy.contains('button', 'Tokenize Property').click();
    
    cy.wait('@tokenizeRequest');
    
    // Check success message
    cy.contains('Property successfully tokenized!').should('be.visible');
    cy.contains('Token ID: 0.0.123456').should('be.visible');
    
    // Check that we're redirected to the property details page
    cy.url().should('include', '/properties/detail');
  });

  it('should handle tokenization errors', () => {
    // Mock the Hedera service error response
    cy.intercept('POST', '/api/blockchain/tokenize', {
      statusCode: 500,
      body: {
        success: false,
        error: 'Failed to create token: INSUFFICIENT_BALANCE'
      }
    }).as('tokenizeRequest');

    // Fill the form
    cy.get('input[name="propertyName"]').type('Error Property');
    cy.get('input[name="propertySymbol"]').type('ERROR');
    cy.get('input[name="propertyValue"]').type('1000000');
    cy.get('input[name="totalTokens"]').type('1000');
    
    // Submit the form
    cy.contains('button', 'Tokenize Property').click();
    
    cy.wait('@tokenizeRequest');
    
    // Check error message
    cy.contains('Failed to create token: INSUFFICIENT_BALANCE').should('be.visible');
  });
});

describe('NFT Studio', () => {
  beforeEach(() => {
    // Login before each test
    cy.window().then((win) => {
      win.localStorage.setItem('mapchain-token', 'fake-jwt-token');
      win.localStorage.setItem('mapchain-user', JSON.stringify({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'PROPERTY_OWNER'
      }));
    });
    
    cy.visit('/nft-studio');
  });

  it('should display the NFT creation form', () => {
    cy.contains('h1', 'NFT Studio');
    cy.get('input[name="nftName"]').should('exist');
    cy.get('input[name="nftSymbol"]').should('exist');
    cy.get('textarea[name="nftDescription"]').should('exist');
    cy.contains('button', 'Create NFT').should('exist');
  });

  it('should validate the NFT creation form', () => {
    cy.contains('button', 'Create NFT').click();
    cy.contains('NFT name is required').should('be.visible');
    cy.contains('NFT symbol is required').should('be.visible');
  });

  it('should create an NFT successfully', () => {
    // Mock the Hedera service response
    cy.intercept('POST', '/api/blockchain/create-nft', {
      statusCode: 200,
      body: {
        success: true,
        tokenId: '0.0.654321',
        transactionId: '0.0.12345@1234567890.000000000',
        serialNumber: '1',
        receipt: {
          status: 'SUCCESS'
        }
      }
    }).as('createNftRequest');

    // Fill the form
    cy.get('input[name="nftName"]').type('Luxury Property NFT');
    cy.get('input[name="nftSymbol"]').type('LPNFT');
    cy.get('textarea[name="nftDescription"]').type('NFT representing ownership of a luxury property');
    
    // Upload NFT image
    cy.get('input[type="file"]').attachFile('nft-image.jpg');
    
    // Set royalty fee
    cy.get('input[name="royaltyFee"]').type('5');
    
    // Submit the form
    cy.contains('button', 'Create NFT').click();
    
    cy.wait('@createNftRequest');
    
    // Check success message
    cy.contains('NFT successfully created!').should('be.visible');
    cy.contains('Token ID: 0.0.654321').should('be.visible');
    cy.contains('Serial Number: 1').should('be.visible');
    
    // Check that we're redirected to the NFT details page
    cy.url().should('include', '/nft/detail');
  });

  it('should handle NFT creation errors', () => {
    // Mock the Hedera service error response
    cy.intercept('POST', '/api/blockchain/create-nft', {
      statusCode: 500,
      body: {
        success: false,
        error: 'Failed to create NFT: INVALID_TOKEN_SYMBOL'
      }
    }).as('createNftRequest');

    // Fill the form
    cy.get('input[name="nftName"]').type('Error NFT');
    cy.get('input[name="nftSymbol"]').type('123'); // Invalid symbol
    cy.get('textarea[name="nftDescription"]').type('This NFT will fail');
    
    // Submit the form
    cy.contains('button', 'Create NFT').click();
    
    cy.wait('@createNftRequest');
    
    // Check error message
    cy.contains('Failed to create NFT: INVALID_TOKEN_SYMBOL').should('be.visible');
  });
});
