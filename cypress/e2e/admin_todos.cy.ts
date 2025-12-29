/// <reference types="cypress" />

describe('Admin Todos', () => {
  beforeEach(() => {
    // Seed the database
    // cy.request('POST', '/api/auth/seed');
    cy.visit('/login');
    
    // Login as Admin
    cy.get('input[name="email"]').type('admin@todo.dev');
    cy.get('input[name="password"]').type('ChangeMe123!');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/');
    cy.visit('/todos');
  });

  it('should display admin todos', () => {
    // Check for Admin Todos
    cy.contains('Admin Task 1').scrollIntoView().should('be.visible');
    cy.contains('Admin Task 2').scrollIntoView().should('be.visible');
  });
});
