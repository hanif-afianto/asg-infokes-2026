/**
 * User credentials for OrangeHRM Demo
 * Demo site credentials: Admin / admin123
 * @see https://opensource-demo.orangehrmlive.com/
 */

export const users = {
  admin: {
    username: "Admin",
    password: "admin123",
    displayName: "Paul Collings",
  },
  
  // Invalid users for negative testing
  invalidUser: {
    username: "InvalidUser",
    password: "wrongpassword",
  },
  
  emptyCredentials: {
    username: "",
    password: "",
  },

  // Data untuk TC-ADMIN-001 (Add User) — gunakan employee yang ada di demo
  addUser: {
    employeeNamePartial: "Odis",
    username: "testodis01",
    password: "TestOd1s!",
  },
} as const;
