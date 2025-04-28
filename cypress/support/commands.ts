// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import '@testing-library/cypress/add-commands';

// Add Cypress file upload command
import 'cypress-file-upload';

// Add type definitions for cypress-file-upload
declare global {
  namespace Cypress {
    interface Chainable {
      attachFile(filePath: string, options?: Partial<Cypress.SelectFileOptions>): Chainable<JQuery<HTMLElement>>
    }
  }
}

// Custom command to login programmatically
Cypress.Commands.add('login', (email, password) => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      email,
      password
    }
  }).then((response) => {
    window.localStorage.setItem('mapchain-token', response.body.token);
    window.localStorage.setItem('mapchain-user', JSON.stringify(response.body.user));
  });
});

// Custom command to login with wallet
Cypress.Commands.add('loginWithWallet', (walletAddress) => {
  cy.request({
    method: 'POST',
    url: '/api/auth/wallet-login',
    body: {
      walletAddress
    }
  }).then((response) => {
    window.localStorage.setItem('mapchain-token', response.body.token);
    window.localStorage.setItem('mapchain-user', JSON.stringify(response.body.user));
  });
});

// Custom command to create a property
Cypress.Commands.add('createProperty', (property) => {
  cy.request({
    method: 'POST',
    url: '/api/properties',
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem('mapchain-token')}`
    },
    body: property
  });
});

// Custom command to create a valuation
Cypress.Commands.add('createValuation', (valuation) => {
  cy.request({
    method: 'POST',
    url: '/api/valuation',
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem('mapchain-token')}`
    },
    body: valuation
  });
});

// Custom command to tokenize a property
Cypress.Commands.add('tokenizeProperty', (tokenization) => {
  cy.request({
    method: 'POST',
    url: '/api/blockchain/tokenize',
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem('mapchain-token')}`
    },
    body: tokenization
  });
});

// Declare the Cypress namespace to add custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): void;
      loginWithWallet(walletAddress: string): void;
      createProperty(property: any): Chainable<any>;
      createValuation(valuation: any): Chainable<any>;
      tokenizeProperty(tokenization: any): Chainable<any>;
    }
  }
}
