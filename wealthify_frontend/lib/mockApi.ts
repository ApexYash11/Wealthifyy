// Mock API for testing frontend without backend
export const mockAuthAPI = {
  login: async (data: { email: string; password: string }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful login
    if (data.email && data.password) {
      return {
        data: {
          token: 'mock-jwt-token-12345',
          user: {
            id: 'user-123',
            email: data.email,
            name: data.email.split('@')[0], // Use email prefix as name
          }
        }
      };
    } else {
      throw new Error('Invalid credentials');
    }
  },
  
  register: async (data: { email: string; password: string; name: string }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful registration
    if (data.email && data.password && data.name) {
      return {
        data: {
          token: 'mock-jwt-token-12345',
          user: {
            id: 'user-123',
            email: data.email,
            name: data.name,
          }
        }
      };
    } else {
      throw new Error('Registration failed');
    }
  }
};

export const mockExpenseAPI = {
  getExpenses: async (userId: string, month?: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock expense data
    const mockExpenses = [
      {
        month: 'January',
        categories: {
          food: 450,
          transportation: 200,
          entertainment: 150,
          shopping: 300,
          healthcare: 100,
          education: 0,
          housing: 1200,
          utilities: 150,
          insurance: 200,
          savings: 500,
          debt: 300,
          other: 100
        },
        total: 3650
      },
      {
        month: 'February',
        categories: {
          food: 480,
          transportation: 180,
          entertainment: 120,
          shopping: 250,
          healthcare: 80,
          education: 0,
          housing: 1200,
          utilities: 140,
          insurance: 200,
          savings: 600,
          debt: 250,
          other: 80
        },
        total: 3500
      }
    ];
    
    return { data: mockExpenses };
  },
  
  addExpense: async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { data: { success: true, message: 'Expense added successfully' } };
  },
  
  predictExpense: async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { data: { prediction: 3200 } };
  },
  
  predictSavings: async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { data: { prediction: 800 } };
  }
}; 